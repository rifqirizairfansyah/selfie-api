const mongoose = require("mongoose");

const VersionSchema = new mongoose.Schema(
  {
    VERSION: String,
    TYPE: String
  },
  {
    versionKey: false,
    collection: "versions"
  }
);

module.exports = mongoose.model("versions", VersionSchema);
