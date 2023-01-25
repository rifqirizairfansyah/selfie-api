const express = require("express");
const router = express.Router();

const map = require("./map");
const report = require("./report");
const task = require("./task");
const user = require("./user");
const announcement = require("./announcement");
const oauthController = require("./oauth");

const adminController = require("../../controllers/admin_controller");
const companyController = require("../../controllers/company_controller");
const districtController = require("../../controllers/district_controller");
const reportTypeController = require("../../controllers/report_type_controller");
const exportedReportController = require("../../controllers/exported_report_controller");
const reportController = require("../../controllers/report_controller");
const userController = require("../../controllers/user_controller");
const { checkRequest, requiredRequest } = require("../../utils");
const validationObject = require("../../utils/validation_object");
const { validateExpress } = require("../../middlewares/validator");

router.use("/map", map);
router.use("/report", report);
router.use("/task", task);
router.use("/user", user);
router.use("/oauth", oauthController);
router.use("/announcement", announcement);
router.post(
  "/login",
  checkRequest(requiredRequest.admin_login),
  adminController.login
);
router.get(
  "/areas",
  checkRequest(requiredRequest.authorization),
  districtController.getAreas
);
router.get(
  "/companies",
  checkRequest(requiredRequest.authorization),
  companyController.getCompanies
);

router.get(
  "/companies/:area/:district",
  checkRequest(requiredRequest.authorization),
  companyController.getCompaniesByDistrict
);

router.get(
  "/units/complete/",
  checkRequest(requiredRequest.authorization),
  companyController.getCompleteUnits
);

router.post(
  "/unit/",
  checkRequest(requiredRequest.authorization),
  companyController.createCompanyUnits
);

router.put(
  "/unit/update",
  checkRequest(requiredRequest.authorization),
  companyController.updateCompanyUnits
);

router.put(
  "/unit/deactive",
  checkRequest(requiredRequest.authorization),
  companyController.deactivateCompanyUnits
);

router.get(
  "/units/:companyGuid?",
  checkRequest(requiredRequest.authorization),
  companyController.getUnits
);

router.post(
  "/unit/migrate",
  checkRequest(requiredRequest.authorization),
  companyController.migrateUnits
);
router.get(
  "/report-types",
  checkRequest(requiredRequest.authorization),
  reportController.getReportTypes
);
router.post(
  "/report-types",
  checkRequest(requiredRequest.authorization),
  reportTypeController.createReportTypes
);
router.get(
  "/users/:company/:unit?",
  checkRequest(requiredRequest.authorization),
  userController.getUsers
);
router.get(
  "/exported-report/:unit?",
  checkRequest(requiredRequest.authorization),
  exportedReportController.get
);
router.put(
  "/profile/information/update",
  checkRequest(requiredRequest.update_admin_information),
  validateExpress(validationObject.updateAdminInformationScheme),
  adminController.updateInformation
);
router.get(
  "/profile/information",
  checkRequest(requiredRequest.authorization),
  adminController.getInformation
);
router.put(
  "/company/profile/update",
  checkRequest(requiredRequest.authorization),
  adminController.updateCompanyProfile
);
router.get(
  "/company/profile",
  checkRequest(requiredRequest.authorization),
  adminController.companyProfile
);

module.exports = router;
