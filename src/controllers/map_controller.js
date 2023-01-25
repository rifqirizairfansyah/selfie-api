const mapService = require("../services/map_service");
const { requestResponse } = require("../utils");
const logger = require("../utils/logger");

let response;

const createCompanyBoundaries = async (req, res) => {
  const {
    map_boundaries
  } = req.body;
  try {
    await mapService.createMapBoundaries({
      "COMPANY_GUID": req.company,
      "ACTIVE": true,
      "MAP_BOUNDARIES": map_boundaries
    });

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getCompanyBoundaries = async (req, res) => {
  try {
    const map = await mapService.getMapBoundariesByCompanyGuid(req.company);
    response = {
      ...requestResponse.success,
      data: map
    };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const deleteMapBoundaries = async (req, res) => {
  const { id } = req.params;
  try {
    await mapService.deleteMapBoundaries(id);

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

module.exports = {
  createCompanyBoundaries,
  deleteMapBoundaries,
  getCompanyBoundaries
};
