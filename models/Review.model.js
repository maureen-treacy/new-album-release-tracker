const {Schema, model} = require("mongoose")

const reviewSchema = new Schema({
    rating: Number,
    review: String,
    shareWith: String,
    reviewer: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
    })


const Review = model("Review", reviewSchema);

module.exports = Review;

//Think about how save album works with the Boolean logic