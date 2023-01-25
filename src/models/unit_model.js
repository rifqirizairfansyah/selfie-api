require("dotenv").config();
const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    COMPANY_GUID: {
      type: String,
      index: true
    },
    NAME: {
      type: String
    },
    COMPANY_CODE: {
      type: String,
      index: true
    },
    IS_ACTIVE: {
      type: Boolean,
      index: true
    }
  },
  {
    versionKey: false,
    collection: "units"
  }
);

module.exports = mongoose.model("units", unitSchema);
