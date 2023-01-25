const mongoose = require("mongoose");

const DistrictSchema = new mongoose.Schema(
  {
    TYPE: String,
    AREA: String,
    DISTRICTS: []
  },
  {
    versionKey: false,
    collection: "districts"
  }
);

module.exports = mongoose.model("districts", DistrictSchema);
