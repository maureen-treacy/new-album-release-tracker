const { Schema, model } = require("mongoose");

const albumSchema = new Schema({
  albumTitle: String,
  artists: [String],
  releaseDate: String,
  genres: [String],
  totalTracks: Number,
  spotifyId: String,
  images: String,
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Review"
  }]
},
{
timestamps: true
}
);

const Album = model("Album", albumSchema);

module.exports = Album;
