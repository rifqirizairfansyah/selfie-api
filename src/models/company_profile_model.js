const mongoose = require("mongoose");
const { v4 } = require("uuid");

const companySchema = new mongoose.Schema(
  {
    GUID: {
      type: String,
      default: v4()
    },
    COMPANY_GUID: {
      type: String
    },
    NAME: {
      type: String
    },
    REGISTRANT_NAME: {
      type: String
    },
    INSTITUTION: {
      type: String
    },
    PHONE: {
      type: String
    },
    DESCRIPTION: {
      type: String
    },
    IMAGE: {
      type: String
    },
    SLUG: {
      type: String
    }
  },
  {
    versionKey: false,
    collection: "company_profiles"
  }
);

module.exports = mongoose.model("company_profiles", companySchema);
