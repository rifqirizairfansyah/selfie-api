const mongoose = require("mongoose");

const reportTypeSchema = new mongoose.Schema(
  {
    NAME: {
      type: String
    },
    CODE: {
      type: String
    },
    APP_TYPE: {
      type: String
    },
    ROLE: {
      type: String
    },
    TYPE: {
      type: String
    }
  },
  {
    versionKey: false,
    collection: "report_types"
  }
);

module.exports = mongoose.model("report_types", reportTypeSchema);
