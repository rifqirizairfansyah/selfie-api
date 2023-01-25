const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    COMPANY_NAME: {
      type: String
    },
    COMPANY_GUID: {
      type: String
    },
    COMPANY_UNITS: {
      type: Array
    },
    COMPANY_CODE: {
      type: String
    },
    COMPANY_TYPE: {
      type: String
    },
    COMPANY_AREA: {
      type: String
    },
    COMPANY_DISTRICT: {
      type: String
    }
  },
  {
    versionKey: false,
    collection: "companies"
  }
);

module.exports = mongoose.model("companies", companySchema);
