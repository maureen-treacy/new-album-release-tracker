
const router = Require("express"),Router();

const SpotifyWebApi = require("spotify-web-api-node");
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });


const Album = require("../models/Album.model.js")
// const Review = require("../models/Review.model.js")

//Routes

//Get New Releases

app.get("/all-new-releases", async (req,res) => {
    try{
        let allNewReleases = await spotifyApi.getNewReleases({limit: 50, offset:0, country: "US"});
        console.log(allNewReleases)
    }
    catch (error){
        console.log(error)
    }
})



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