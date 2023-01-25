require("dotenv").config();
const mongoose = require("mongoose");
const collectionName = "users";

const userSchema = new mongoose.Schema(
  {
    NAME: String,
    EMAIL: String,
    PASSWORD: String,
    POSITION: String,
    ID_CARD: String,
    COMPANY: String,
    TIMESTAMP: Number,
    LOCAL_IMAGE: String,
    IMAGE: String,
    UNIT: String,
    GUID: String,
    PHONE_NUMBER: {
      type: String,
      default: null
    },
    GOOGLE_ID: String,
    IDENTITY_CARD_IMAGE: String,
    FAMILY_CARD_IMAGE: String,
    APP_TYPE: String,
    ROLE: String
  },
  {
    versionKey: false,
    collection: collectionName
  }
);

module.exports = mongoose.model("users", userSchema);
