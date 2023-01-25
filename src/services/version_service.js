const Version = require("../models/version_model");

/**
 * @function getVersion
 * Get the app version that stoerd in database
 * @param {String} type
 * @returns {Promise<Document>}
 */
const getVersion = async (type) => {
  const version = await Version.findOne(
    { TYPE: type },
    { _id: false, VERSION: true }
  );

  return version;
};

module.exports = {
  getVersion
};
