const express = require("express");
const router = express.Router();
const taskController = require("../../controllers/task_controller");
const { checkRequest, requiredRequest } = require("../../utils");

router.post(
  "/",
  checkRequest(requiredRequest.authorization),
  taskController.create
);
router.get(
  "/:id",
  checkRequest(requiredRequest.authorization),
  taskController.find
);
router.put(
  "/:id/update",
  checkRequest(requiredRequest.authorization),
  taskController.update
);
router.delete(
  "/:id/delete",
  checkRequest(requiredRequest.authorization),
  taskController.deleteData
);

module.exports = router;
