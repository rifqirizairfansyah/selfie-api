const versionService = require("../services/version_service");
const { requestResponse } = require("../utils");
const logger = require("../utils/logger");

let response;

const getVersion = async (req, res) => {
  try {
    const type = req.query.type || null;
    const version = await versionService.getVersion(type);

    response = { ...requestResponse.success, data: version };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

module.exports = {
  getVersion
};
