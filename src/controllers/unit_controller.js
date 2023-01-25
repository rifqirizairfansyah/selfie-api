const { logger, requestResponse } = require("@pptik/galileo");
const unitService = require("../services/unit_service");

let response;

const create = async (req, res) => {
  try {
    await unitService.create(req.body);

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getUnitCode = async (req, res) => {
  try {
    const find = await unitService.find({ COMPANY_GUID: req.params.companyCode }, { COMPANY_CODE: 1 });
    response = { ...requestResponse.success, data: find };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

module.exports = {
  create,
  getUnitCode
};
