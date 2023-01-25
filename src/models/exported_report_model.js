const mongoose = require("mongoose");

const ExportedReportSchema = new mongoose.Schema(
  {
    COMPANY_GUID: String,
    UNIT: String,
    DATE_START: Date,
    DATE_END: Date,
    FILENAME: String
  },
  {
    versionKey: false,
    collection: "exported_reports"
  }
);

module.exports = mongoose.model("exported_reports", ExportedReportSchema);
