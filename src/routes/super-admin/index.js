const express = require("express");
const router = express.Router();
const { checkRequest, requiredRequest } = require("../../utils");
const superAdminController = require("../../controllers/super_admin_controller");

router.post(
  "/login",
  checkRequest(requiredRequest.admin_login),
  superAdminController.login
);

router.get(
  "/all-companies",
  checkRequest(requiredRequest.authorization),
  superAdminController.getAllCompanies
);

router.get(
  "/companies",
  checkRequest(requiredRequest.authorization),
  superAdminController.getCompanies
);

router.get(
  "/:companyGuid/users",
  checkRequest(requiredRequest.authorization),
  superAdminController.getUsersByCompany
);

router.get(
  "/:companyGuid/admins",
  checkRequest(requiredRequest.authorization),
  superAdminController.getAdminsByCompany
);

router.get(
  "/:companyGuid/reports",
  checkRequest(requiredRequest.authorization),
  superAdminController.getReportsByCompany
);

router.put(
  "/companies/:id/update",
  checkRequest(requiredRequest.authorization),
  superAdminController.updateCompany
);

router.delete(
  "/companies/:id/delete",
  checkRequest(requiredRequest.authorization),
  superAdminController.deleteCompany
);

router.put(
  "/admins/:id/reset-password",
  checkRequest(requiredRequest.authorization),
  superAdminController.resetPassword
);

router.delete(
  "/users/:id/delete",
  checkRequest(requiredRequest.authorization),
  superAdminController.deleteUser
);

module.exports = router;
