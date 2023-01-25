const express = require("express");
const router = express.Router();

const mapController = require("../../controllers/map_controller");
const { checkRequest, requiredRequest } = require("../../utils");

router.post(
  "/boundary",
  checkRequest(requiredRequest.create_map_boundaries),
  mapController.createCompanyBoundaries
);
router.get(
  "/boundaries",
  checkRequest(requiredRequest.authorization),
  mapController.getCompanyBoundaries
);
router.delete(
  "/boundaries/:id/delete",
  checkRequest(requiredRequest.authorization),
  mapController.deleteMapBoundaries
);

module.exports = router;
