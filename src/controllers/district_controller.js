const districtService = require("../services/district_service");
const { requestResponse } = require("../utils");
const logger = require("../utils/logger");

let response;

const getAreasUsers = async (req, res) => {
  try {
    const { type } = req.params;
    const areas = await districtService.getAreas(type);

    response = { ...requestResponse.success, data: { areas } };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getAreas = async (req, res) => {
  try {
    const areas = await districtService.getAreas(req.type);

    response = { ...requestResponse.success, data: { areas } };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

module.exports = {
  getAreas,
  getAreasUsers
};
