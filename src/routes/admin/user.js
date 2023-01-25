const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user_controller");
const { validateExpress } = require("../../middlewares/validator");
const validationObject = require("../../utils/validation_object");
const { checkRequest, requiredRequest } = require("../../utils");

router.post(
  "/",
  checkRequest(requiredRequest.authorization),
  userController.signUp
);
router.get(
  "/",
  checkRequest(requiredRequest.authorization),
  userController.get
);
router.get(
  "/:id/find",
  checkRequest(requiredRequest.authorization),
  userController.find
);
router.put(
  "/:id/update",
  checkRequest(requiredRequest.update_user),
  validateExpress(validationObject.updateUserScheme),
  userController.update
);
router.delete(
  "/:id/delete",
  checkRequest(requiredRequest.authorization),
  userController.destroy
);

module.exports = router;
