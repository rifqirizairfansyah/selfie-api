const express = require("express");
const router = express.Router();
const { checkRequest, requiredRequest } = require("../../utils/index");

const authorizationController = require("../../controllers/oauth_controller");

router.get("/signin", authorizationController.signin);
router.get("/signin-callback", authorizationController.signinCallback);

router.get("/signin-mobile", authorizationController.signinMobile);
router.get(
  "/signin-callback-mobile",
  authorizationController.signinCallbackMobile
);

router.get("/signout", authorizationController.signout);
router.get("/signout-callback", authorizationController.signoutCallback);
router.get("/signin", authorizationController.signin);
router.get(
  "/user-info",
  checkRequest(requiredRequest.authorization),
  authorizationController.getUsersIdentity
);
router.post("/refresh-token", authorizationController.refreshTokenIdentity);

module.exports = router;
