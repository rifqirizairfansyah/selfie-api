const express = require("express");
const router = express.Router();
const announcementController = require("../../controllers/announcement_controller");
const { checkRequest, requiredRequest } = require("../../utils");

router.get(
  "/",
  checkRequest(requiredRequest.authorization),
  announcementController.get
);
router.post(
  "/",
  checkRequest(requiredRequest.authorization),
  announcementController.create
);
router.get(
  "/:id",
  checkRequest(requiredRequest.authorization),
  announcementController.find
);
router.put(
  "/:id/update",
  checkRequest(requiredRequest.authorization),
  announcementController.update
);
router.delete(
  "/:id/delete",
  checkRequest(requiredRequest.authorization),
  announcementController.deleteData
);

module.exports = router;
