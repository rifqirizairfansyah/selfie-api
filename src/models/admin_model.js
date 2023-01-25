const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    GUID: String,
    EMAIL: String,
    PASSWORD: String,
    COMPANY: String,
    TYPE: String,
    ROLE: String,
    ADDITIONAL: {
      TITLE: String,
      LOCATION: {
        LONGITUDE: Number,
        LATITUDE: Number,
        ZOOM: Number
      },
      NAME: {
        AREA: String,
        DISTRICT: String,
        COMPANY: String,
        UNIT: String
      },
      PRESENCE_HOUR: String,
      LEAVE_HOUR: String
    }
  },
  {
    versionKey: false,
    collection: "admins"
  }
);

module.exports = mongoose.model("admins", AdminSchema);
