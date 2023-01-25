const { logger } = require("@pptik/galileo");
const reportTypeService = require("../services/report_type_service");
const { requestResponse, generateCode } = require("../utils");

let response;

async function reportTypes(req, res) {
  const { app_type, role } = req.query;
  try {
    const condition = {
      ...(app_type && {
        APP_TYPE: app_type
      }),
      ...(role && {
        ROLE: role
      })
    };

    const reportTypesData = await reportTypeService.getReportTypes(condition);

    response = { ...requestResponse.success, data: reportTypesData };
  } catch (error) {
    logger.error(error);

    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
}

async function createReportTypes (req, res) {
  const { name, role, app_type } = req.body;
  try {
    const code = generateCode(5);
    const reportTypeData = {
      name,
      code,
      app_type,
      role,
      type: "report"
    };

    const createReportType = await reportTypeService.createReportType(reportTypeData);

    response = { ...requestResponse.success, data: createReportType };
  } catch (error) {
    logger.error(error);

    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
}

module.exports = {
  createReportTypes,
  reportTypes
};
