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

    //These next two sections of code pull in the database and match it to the fields that we're creating in Mongo DB based on our Models

    //the variable names here must mattch the fields from the API documentation

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

  // The key names here must match the key names from the Album.Model file. The value names must match the fields from the API documentation

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

    //finding all albums that are in MongoDB

    const databaseAlbums = await Album.find();
    res.render("albums/all-albums", { albums: databaseAlbums }); // databaseAlbums is an array and we need to pass it as an object to make it accessible in handlebars file
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//Get Album Details --> refer to movies labs

router.get("/album-details/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  try {
    let albumDetails = await Album.findById(id).populate("reviews");   //.populate("reviews") is used in mongoose to populate the reviews for the associated album that we are referencing with ID. Without .populate("reviews") we would only get the IDs for each review and not the actual review objects. 
  

    //this nested .populate is called to further populate the reviewer field with user details from the User model, allowing us to access information about the User who left the reivew
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

//The savedAlbums after $addToSet comes from the object defined in the User model

//Used the $addToSet instead of $push because $addToSet checks to see if the ID is already in the array before adding it while push allows for duplicate entries

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

//Add Review to Album - CRUD Update. Post route creates review

router.post("/review-album/:id", isLoggedIn, async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    const { id } = req.params;
    const { rating, review } = req.body;

    const newReview = await Review.create({ rating, review });

    //This allows us to tie a review to a certain album, so that when we go to the albums details page, we will see all reviews for this album

    const albumUpdate = await Album.findByIdAndUpdate(id, {
      $push: { reviews: newReview._id },
    });

    //This allows us to add a review to a specific user

    const userUpdate = await User.findByIdAndUpdate(currentUser._id, {
      $push: { reviews: newReview._id },
    });

    //this is used to update the reviewer field in the on the newly created review with the current user. It establishes a link between the review and the user who submitted it 

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

        // Without using new:true, the method would return the original document before the update and we would not see the changes reflected immediately after the update 
        await Review.findByIdAndUpdate(reviewId, {rating, review}, {new: true})
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
    const { albumId } = req.body
    const user = req.session.currentUser;

    //removes the review from the Review model

    await Review.findByIdAndRemove(reviewId);
    console.log(Review);

    await Album.findByIdAndUpdate(albumId, { $pull: { reviews: reviewId } });
    console.log(Album);
    
    //Removes the review from the user

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
