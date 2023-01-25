const { logger, requestResponse } = require("@pptik/galileo");
const adminService = require("../services/admin_service");
const superAdminService = require("../services/super_admin_service");
const userService = require("../services/user_service");
const reportService = require("../services/report_service");

let response;

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const loginResponse = await adminService.login({ email, password });

    response = { ...loginResponse };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }
  res.status(response.code).json(response);
};

const getAllCompanies = async (req, res) => {
  try {
    const projection = {
      _id: false,
      COMPANY_UNITS: false,
      COMPANY_TYPE: false
    };

    const allCompanies = await superAdminService.getCompanies({},
      projection
    );

    response = {
      ...requestResponse.success,
      data: {
        allCompanies
      }
    };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getCompanies = async (req, res) => {
  const page = req.query.page || 1;
  const sortBy = req.query.sort_by;
  const perPage = 10;
  try {
    const additionalConditions = {
      page,
      perPage,
      sortBy
    };
    const projection = {
      _id: false,
      COMPANY_UNITS: false,
      COMPANY_TYPE: false
    };

    const companies = await superAdminService.getCompanies({},
      projection,
      additionalConditions
    );
    const totalData = await superAdminService.countCompanies();

    response = {
      ...requestResponse.success,
      data: {
        companies,
        number_of_pages: Math.ceil((totalData / perPage) * 1) / 1
      }
    };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getUsersByCompany = async (req, res) => {
  const page = req.query.page || 1;
  const { companyGuid } = req.params;
  const perPage = 10;
  try {
    const projection = {
      _id: false
    };
    const additionalConditions = {
      page,
      perPage
    };
    const condition = {
      COMPANY: companyGuid
    };
    const users = await userService.getUsers(
      condition,
      projection,
      additionalConditions
    );
    const totalData = await userService.countUsers(condition);

    response = {
      ...requestResponse.success,
      data: {
        users,
        number_of_pages: Math.ceil((totalData / perPage) * 1) / 1
      }
    };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getAdminsByCompany = async (req, res) => {
  const { companyGuid } = req.params;
  try {
    const condition = {
      COMPANY: companyGuid
    };
    const admins = await adminService.getAdmins(
      condition
    );

    response = {
      ...requestResponse.success,
      data: {
        admins
      }
    };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getReportsByCompany = async (req, res) => {
  const { companyGuid } = req.params;
  const page = req.query.page || 1;
  const minified = req.query.minified === "true";
  const perPage = 10;

  try {
    const conditions = {
      COMPANY: companyGuid
    };

    const additionalConditions = { page, minified, perPage };
    const projection = minified
      ? { _id: true, LAT: true, LONG: true }
      : {
        GUID: false,
        UNIT: false,
        STATUS: false,
        COMPANY: false,
        AREA: false,
        DISTRICT: false
      };
    const reports = await reportService.getReports(
      conditions,
      projection,
      additionalConditions
    );
    const totalData = await reportService.countReports(conditions);
    response = {
      ...requestResponse.success,
      data: {
        reports,
        number_of_pages: Math.ceil((totalData / perPage) * 1) / 1
      }
    };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const updateCompany = async (req, res) => {
  const { id } = req.params;
  const {
    company_name: COMPANY_NAME,
    company_area: COMPANY_AREA,
    company_district: COMPANY_DISTRICT
  } = req.body;
  try {
    await superAdminService.updateCompany(id, {
      COMPANY_AREA,
      COMPANY_DISTRICT,
      COMPANY_NAME
    });

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);

    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const deleteCompany = async (req, res) => {
  const { id } = req.params;
  try {
    await superAdminService.deleteCompany(id);

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await superAdminService.deleteAdmin(id);

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const resetPassword = async (req, res) => {
  const { id } = req.params;
  try {
    await superAdminService.resetPasswordAdmin(id);

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);

    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const conditions = {
      GUID: id
    };

    await userService.deleteUser(conditions);

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

module.exports = {
  login,
  getCompanies,
  getUsersByCompany,
  getReportsByCompany,
  getAllCompanies,
  updateCompany,
  deleteCompany,
  resetPassword,
  deleteAdmin,
  getAdminsByCompany,
  deleteUser
};
