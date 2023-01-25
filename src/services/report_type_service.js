const ReportType = require("../models/report_type_model");

const getReportTypes = (condition = {}) => {
  return ReportType.find(condition, {
    _id: false,
    NAME: true,
    CODE: true,
    TYPE: true
  });
};

const createReportType = async (reportTypeData) => {
  const payload = {
    NAME: reportTypeData.name,
    CODE: reportTypeData.code,
    APP_TYPE: reportTypeData.app_type,
    ROLE: reportTypeData.role,
    TYPE: reportTypeData.type
  };

  await ReportType.create(payload);
};

module.exports = {
  getReportTypes,
  createReportType
};
