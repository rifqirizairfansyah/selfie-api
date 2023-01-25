const mongoose = require("mongoose");

const mapBoundariesSchema = new mongoose.Schema(
  {
    BOUNDARIES_GUID: {
      type: String
    },
    COMPANY_GUID: {
      type: String
    },
    ACTIVE: {
      type: Boolean,
      default: true
    },
    MAP_BOUNDARIES: [{
      type: mongoose.Schema.Types.Mixed
    }]
  },
  {
    versionKey: false,
    collection: "map_boundaries"
  }
);

module.exports = mongoose.model("map_boundaries", mapBoundariesSchema);
