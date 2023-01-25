const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/report_controller");
const { checkRequest, requiredRequest } = require("../../utils");

router.get(
  "/company/:unit?",
  checkRequest(requiredRequest.authorization),
  reportController.getCompanyReports,
  reportController.getReports
);
router.get(
  "/hierarchical/:area?/:district?/:company?/:unit?",
  checkRequest(requiredRequest.authorization),
  reportController.getHierarchicalReports,
  reportController.getReports
);
router.get(
  "/supervisor/:company?/:unit?",
  checkRequest(requiredRequest.authorization),
  reportController.getPartialSupervisorReports,
  reportController.getReports
);
router.get(
  "/export/hierarchical/:area/:district/:company/:unit",
  checkRequest(requiredRequest.authorization),
  reportController.exportHierarchicalReports
);
router.get(
  "/export/company/:unit",
  checkRequest(requiredRequest.authorization),
  reportController.exportCompanyReports
);
router.get(
  "/export/supervisor/:company/:unit",
  checkRequest(requiredRequest.authorization),
  reportController.exportPartialSupervisorReports
);
router.get(
  "/by-id/:reportId",
  checkRequest(requiredRequest.authorization),
  reportController.getReportById
);
router.put(
  "/status/by-id/:reportId/update",
  checkRequest(requiredRequest.authorization),
  reportController.updateReportStatus
);
module.exports = router;
