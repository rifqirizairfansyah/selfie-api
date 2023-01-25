const { logger } = require("@pptik/galileo");
const exportedReportService = require("../services/exported_report_service");
const { requestResponse } = require("../utils");

let response;

const get = async (req, res) => {
  const { unit } = req.params;
  const { date_start, date_end } = req.query;
  const perPage = 10;
  const page = req.query.page || 1;
  const condition = {
    COMPANY_GUID: req.company,
    ...(unit && { UNIT: unit }),
    ...(date_start && { DATE_START: { $gte: date_start } }),
    ...(date_end && { DATE_END: { $lte: date_end } })
  };

  try {
    const exportedReports = await exportedReportService.get(condition, {
      perPage,
      page
    });
    const totalData = await exportedReportService.countExportedReports(
      condition
    );

    response = {
      ...requestResponse.success,
      data: {
        exported_reports: exportedReports,
        number_of_pages: Math.ceil((totalData / perPage) * 1) / 1
      }
    };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

module.exports = {
  get
};
