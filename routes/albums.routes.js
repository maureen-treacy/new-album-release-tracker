const express = require("express");
const router = express.Router();

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

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
const User = require("../models/User.model.js");
const Review = require("../models/Review.model.js");
// const Review = require("../models/Review.model.js")

//Routes

//Get New Releases, save them to the database and display them

router.get("/all-new-releases", isLoggedIn, async (req, res, next) => {
  try {
    let allNewReleases = await spotifyApi.getNewReleases({
      limit: 50,
      offset: 0,
      country: "US",
    });
    /* console.log(allNewReleases.body.albums.items); */

    allNewReleases.body.albums.items.forEach(async (album) => {
      const existingAlbum = await Album.findOne({ spotifyId: album.id });
      if (!existingAlbum) {
        const {
          name,
          artists,
          release_date,
          genres,
          total_tracks,
          id,
          images, 
        } = album;
        let imageUrl = images[0].url;

  
        await Album.create({
          albumTitle: name,
          artists: artists[0].name,
          releaseDate: release_date,
          genres,
          totalTracks: total_tracks,
          spotifyId: id,
          images: imageUrl,
        });
      }
    });

    const databaseAlbums = await Album.find();
    res.render("albums/all-albums", { albums: databaseAlbums });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//Get Album Details --> refer to movies example

router.get("/album-details/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  try {
    let albumDetails = await Album.findById(id).populate("reviews");
    await albumDetails.populate({
      path: "reviews",
      populate: {
        path: "reviewer",
        model: "User",
      },
    });
    console.log(albumDetails);

    res.render("albums/album-details", albumDetails);
  } catch (error) {
    console.log("Error while fetching album details:", error);
  }
});

//Add my Saved Albums
//Note: the savedAlbums after $addToSet comes from the object defined in the User model
//Used the $addToSet instead of $push $addToSet checks to see if the ID is already in the array before adding it while push allows for duplicate entries

router.post(
  "/album-details/save-album/:id",
  isLoggedIn,
  async (req, res, next) => {
    const { id } = req.params;
    const currentUser = req.session.currentUser._id;
    try {
      const saveAlbum = await User.findByIdAndUpdate(currentUser, {
        $addToSet: { savedAlbums: id },
      });

      res.redirect(`/all-new-releases`);
    } catch (error) {
      console.log("Error while saving album to favorites:", error);
    }
  }
);

//Remove album from saved albums
router.post(
  "/album-details/remove-album/:id",
  isLoggedIn,
  async (req, res, next) => {
    const { id } = req.params;
    const currentUser = req.session.currentUser._id;
    try {
      const saveAlbum = await User.findByIdAndUpdate(currentUser, {
        $pull: { savedAlbums: id },
      });

      res.redirect(`/saved-albums`);
    } catch (error) {
      console.log("Error while removing album from favorites:", error);
    }
  }
);

//Display Saved Albums
router.get("/saved-albums", isLoggedIn, async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser._id;

    const user = await User.findById(currentUser).populate("savedAlbums");
    console.log(user);

    res.render("albums/my-saved-albums", user);
  } catch (error) {
    console.log("Error while viewing saved albums profile", error);
  }
});

//Add Review to Album - CRUD Update

//Post route to create review
router.post("/review-album/:id", isLoggedIn, async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const { id } = req.params;
    const { rating, review } = req.body;

    const newReview = await Review.create({ rating, review });

    const albumUpdate = await Album.findByIdAndUpdate(id, {
      $push: { reviews: newReview._id },
    });

    const userUpdate = await User.findByIdAndUpdate(currentUser._id, {
      $push: { reviews: newReview._id },
    });

    const reviewUser = await Review.findByIdAndUpdate(newReview._id, {
      $push: { reviewer: currentUser._id },
    });

    res.redirect(`/album-details/${id}`);
  } catch (error) {
    console.log(error);
  }
});

// Edit Review
router.get("/review/:reviewId/edit", isLoggedIn, async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        let foundReview = await Review.findById(reviewId)
        res.render("reviews/edit-review", {review: foundReview})
    }
    catch (error){
        console.log(error)
    }

})

router.post("/review/:reviewId/edit", isLoggedIn, async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const {rating, review} = req.body

        await Review.findById(reviewId, {rating, review})
        res.redirect("/saved-albums")
    }
    catch (error){
        console.log(error)
    }

})



//Delete review - CRUD delete
router.post("/review/:reviewId/delete", isLoggedIn, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user = req.session.currentUser;

    await Review.findByIdAndRemove(reviewId);
    console.log(Review);

    /*  await Album.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    console.log(Album); */

    await User.findByIdAndUpdate(user._id, {
      $pull: { reviews: reviewId },
    });
    console.log(User);

    res.redirect("/all-new-releases");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
