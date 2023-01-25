const District = require("../models/district_model");

/**
 * @function getAreas
 * Get areas by its type
 * @param {String} type
 * @returns {Promise<Array>}
 */
const getAreas = async (type) => {
  const areas = await District.find(
    { TYPE: type },
    { _id: false, TYPE: false }
  );

  return areas;
};

module.exports = {
  getAreas
};
