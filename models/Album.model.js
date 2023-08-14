const { Schema, model } = require("mongoose");

const albumSchema = new Schema({
  albumTitle: String,
  artists: [String],
  releaseDate: String,
  genres: [String],
  totalTracks: Number,
  spotifyId: String,
  images: String,
});

const Album = model("Album", albumSchema);

module.exports = Album;
