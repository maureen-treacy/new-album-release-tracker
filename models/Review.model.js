const {Schema, model} = require("mongoose")

const reviewSchema = new Schema({
    rating: Integer,
    review: String,
    shareWith: String,
    saveAlbum: Boolean
})


const Review = model("Review", reviewSchema);

module.exports = Review;

//Think about how save album works with the Boolean logic