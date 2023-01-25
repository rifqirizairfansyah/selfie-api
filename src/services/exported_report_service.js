const ExportedReport = require("../models/exported_report_model");

const get = (condition, { perPage, page }) => {
  return ExportedReport.find(condition)
    .skip((page - 1) * perPage)
    .limit(perPage);
};

const countExportedReports = (condition) => {
  return ExportedReport.find(condition).countDocuments();
};

module.exports = {
  get,
  countExportedReports
};
