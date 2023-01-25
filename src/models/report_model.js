require("dotenv").config();
const mongoose = require("mongoose");
const collectionName =
  process.env.NODE_ENV === "production" ? "reports" : "reports";

const reportSchema = new mongoose.Schema(
  {
    NAME: String,
    LONG: Number,
    LAT: Number,
    ADDRESS: String,
    STATUS: String,
    LOCAL_IMAGE: String,
    TIMESTAMP: Number,
    IMAGE: String,
    GUID: String,
    COMPANY: String,
    UNIT: String,
    AREA: String,
    DISTRICT: String,
    DESCRIPTION: {
      type: String,
      default: "-"
    },
    REPORT_STATUS: String,
    TYPE: String,
    REPORT_TYPE: {
      GUID: String,
      NAME: String
    }
  },
  {
    versionKey: false,
    collection: collectionName
  }
);

module.exports = mongoose.model("reports", reportSchema);
