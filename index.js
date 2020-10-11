// Modules
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const exphbs = require('express-handlebars');
const nedb = require('nedb');
const SpotifyAPI = require('node-spotify-api');
const SpotifyStrategy = require('passport-spotify').Strategy;

// declare the express app
const app = express();
// Set Static Path
app.use(express.static('public'));
// cors middleware
app.use(cors());
// body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Set Ports
const PORT = process.env.PORT || 666;
app.listen(PORT, () => console.log(`listening at ${PORT}`));

// Middlewares

// Handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Spotify API middleware
let spotify = new SpotifyAPI({
    id: process.env.SPOTIFY_APP_USER_ID,
    secret: process.env.SPOTIFY_APP_SECRET
});

// spotify constants

const spotifyInfo = [];
const SpotifyTotalFollowers = [];

// spotify functions
function totalFollowers(data) {
  SpotifyTotalFollowers[0] = {
      followers: data
  };
};
 
function returnInfo(data) {
  data.forEach((element, index) => {
      spotifyInfo[index] = {
          rank: index + 1,
          trackname: element.name,
          albumname: element.album.name,
          popularity: element.popularity,
          releasedate: element.album.release_date,
          albumimage: element.album.images[1].url,
          spotifytrackurl: element.external_urls.spotify,
          spotifyartisturl: element.artists[0].external_urls.spotify,
          spotifyalbumurl: element.album.external_urls.spotify
      };
  });
};
 
// get top ten marilyn manson tracks for NZ
spotify.request(`https://api.spotify.com/v1/artists/${process.env.SPOTIFYMARILYNMANSONID}/top-tracks?market=${process.env.SPOTIFYCOUNTRYCODE}`)
    .then(function(data) {
        returnInfo(data.tracks);
    })
    .catch(function(err) {
        console.error('Error occurred: ' + err);
});


// Get total manson Followers on spotify
spotify
  .search({ type: 'artist', query: 'Marilyn Manson' })
  .then(function(data) {
    totalFollowers(data.artists.items[0].followers.total);
  })
  .catch(function(err) {
    console.log(err);
  });

// Homepage Route
app.get('/', (req, res) => res.render('homepage', {
    title: "Marilyn Manson || WE ARE CHAOS",
    preorderalbum, SpotifyTotalFollowers, spotifyInfo
}));
//sign up page || login in
app.get('/signup', (req, res) => res.render('signup', {
  title: "Marilyn Manson || Register",
  registered: true
}));

// Route files
const preorderalbum = require('./Preorders');

// Set routes, API routes.
app.use('/api/preorder', require('./routes/preorders'));

//404 page || No Page Found
app.use((req, res) => {
  res.status(404).render('404',{ title: "Marilyn Manson || Page Not Found" })
});