const mongoose = require("mongoose");
const { v4 } = require("uuid");

const ProfileSchema = new mongoose.Schema(
  {
    GUID: {
      type: String,
      default: v4()
    },
    USER_GUID: String,
    USER_LOCATION: {
      ADDRESS: String,
      LONG: Number,
      LAT: Number
    },
    USER_PROPERTY_LOCATION: {
      LONG: Number,
      LAT: Number
    }
  },
  {
    versionKey: false,
    collection: "profiles"
  }
);

module.exports = mongoose.model("profiles", ProfileSchema);
