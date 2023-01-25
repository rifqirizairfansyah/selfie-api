const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin_controller");
const userController = require("../controllers/user_controller");
const unitController = require("../controllers/unit_controller");
const reportController = require("../controllers/report_controller");
const companyController = require("../controllers/company_controller");
const reportTypeController = require("../controllers/report_type_controller");
const districtController = require("../controllers/district_controller");
const taskController = require("../controllers/task_controller");
const versionController = require("../controllers/version_controller");
const announcementController = require("../controllers/announcement_controller");
const admin = require("./admin");
const superAdmin = require("./super-admin");
const { checkRequest, requiredRequest } = require("../utils");
const validationObject = require("../utils/validation_object");
const { validateExpress } = require("../middlewares/validator");

// Auth
router.post(
  "/users/login",
  checkRequest(requiredRequest.login),
  userController.signIn
);
router.post("/users/register", userController.signUp);
router.patch(
  "/users/profile/update",
  checkRequest(requiredRequest.profile_update),
  userController.updateUser
);
router.patch(
  "/users/change-password",
  checkRequest(requiredRequest.change_password),
  userController.changePassword
);
router.post(
  "/users/reset-password",
  checkRequest(requiredRequest.reset_password),
  userController.resetPassword
);
router.post(
  "/users/bind-google",
  checkRequest(requiredRequest.bind_google_account),
  userController.bindGoogleAccount
);
router.post(
  "/users/google-sign-in",
  checkRequest(requiredRequest.google_sign_in),
  userController.googleSignIn
);
// Area
router.get(
  "/users/areas/:type",
  districtController.getAreasUsers
);

// Report Create Absensi
router.post("/report/create", reportController.createReport);

// Show Report Data User
router.get("/report/:company/:person/:page?", reportController.show);
router.get("/company/:companyCode/units", companyController.getUnitsByCode);
router.get(
  "/companies",
  checkRequest(requiredRequest.companies_by_app_type),
  companyController.getCompaniesByAppType
);
router.get(
  "/company/:companyGuid/profile",
  companyController.getCompanyProfile
);

// Get Application Version
router.get("/version", versionController.getVersion);

// Unit
router.post(
  "/unit", unitController.create
);
router.get(
  "/unit/getCompanyCode/:companyCode", unitController.getUnitCode
);

// Company
router.post(
  "/companies/create",
  companyController.createCompany
);
router.post(
  "/companies/profile/create",
  companyController.createCompanyProfile
);
router.get(
  "/companies/:companyGuid",
  companyController.getCompanyByCompanyGuid
);

// Task
router.get("/tasks/:guid", taskController.getUserTasks);

// Report Type
router.get("/report-types", reportTypeController.reportTypes);

// Admin
router.post(
  "/admin/registration",
  checkRequest(requiredRequest.admin_registration),
  validateExpress(validationObject.registrationAdminScheme),
  adminController.registration
);

router.use("/admin", admin);
router.get(
  "/admin/tasks",
  checkRequest(requiredRequest.authorization),
  taskController.get
);

// Announcement
router.get(
  "/announcement/:company_guid/:role",
  announcementController.userAnnouncement
);

// super admin
router.use("/super-admin", superAdmin);

module.exports = router;
