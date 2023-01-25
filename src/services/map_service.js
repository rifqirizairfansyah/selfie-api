const Maps = require("../models/map_boundaries_model");
const { v4 } = require("uuid");

/**
 * @function createMapBoundaries
 * Create map mapboundaries
 * @param {JSON} mapData
 * @returns {Promise<void>}
 */
const createMapBoundaries = async (mapData) => {
  const BOUNDARIES_GUID = v4();
  const { COMPANY_GUID, MAP_BOUNDARIES } = mapData;
  const createMapBoundaries = await Maps.create({
    BOUNDARIES_GUID,
    COMPANY_GUID,
    MAP_BOUNDARIES
  });
  return createMapBoundaries;
};

/**
 * @function getMapBoundariesByCompanyGuid
 * Get mapboundaries by companyGuid
 * @param {String} companyGuid
 * @returns {Promise<any>}
 */
const getMapBoundariesByCompanyGuid = async (companyGuid) => {
  return Maps.findOne(
    { COMPANY_GUID: companyGuid, ACTIVE: true },
    { _id: false }
  );
};

/**
 * @function deleteMapBoundaries
 * Delete mapboundaries
 * @param {String} id
 * @returns {Promise<any>}
 */
const deleteMapBoundaries = async (id) => {
  return Maps.updateOne({ BOUNDARIES_GUID: id }, { $set: { ACTIVE: false } });
};

module.exports = {
  createMapBoundaries,
  deleteMapBoundaries,
  getMapBoundariesByCompanyGuid
};
