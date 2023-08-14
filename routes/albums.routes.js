const express = require("express");
const router = express.Router();

// require spotify-web-api-node package here
const SpotifyWebApi = require("spotify-web-api-node");

// setting the spotify-api goes here
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

//Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

const Album = require("../models/Album.model.js");
// const Review = require("../models/Review.model.js")

//Routes

//Get New Releases, save them to the database and display them

router.get("/all-new-releases", async (req, res) => {
  try {
    let allNewReleases = await spotifyApi.getNewReleases({
      limit: 50,
      offset: 0,
      country: "US",
    });
    /* console.log(allNewReleases.body.albums.items); */


    allNewReleases.body.albums.items.forEach(async (album)=> {
        const existingAlbum = await Album.findOne({spotifyId: album.id})
    if (!existingAlbum) {
        const {
          name,
          artists,
          release_date,
          genres,
          total_tracks,
          id,
          images, //does this need to be in its own variable like the example?
        } = album;
        let imageUrl = images[0].url;

        //use album here?
        await Album.create({
          albumTitle: name,
          artists: artists[0].name,
          //do we need to include all the fields?
          //how does this need to be displayed int he model file?
          releaseDate: release_date,
          genres,
          totalTracks: total_tracks,
          spotifyId: id,
          images: imageUrl,
        })
        };
      });

    const databaseAlbums = await Album.find();
    res.render("albums/all-albums", { albums: databaseAlbums });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

/*
spotifyApi.getNewReleases({ limit : 5, offset: 0, country: 'SE' })
  .then(function(data) {
    console.log(data.body);
      done();
    }, function(err) {
       console.log("Something went wrong!", err);
    });
  });
  */

/* favorite albums
  router.post('/beers/addFavs/:id', isLoggedIn, async (req, res, next) => {
    const { id } = req.params;
    const currentUser = req.session.currentUser._id;
    try {
        console.log(id)
        const favouriteBeer = await User.findByIdAndUpdate(currentUser, { $push: { favBeers: id }});
        res.redirect(`/beers/details/${id}`);
    } catch (error) {
        console.log(error);
        next(error);
    }
});
*/

module.exports = router;
