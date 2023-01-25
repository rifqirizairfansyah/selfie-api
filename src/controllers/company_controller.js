const Promise = require("bluebird");
const companyService = require("../services/company_service");
const { requestResponse, requiredRequest, generateCode } = require("../utils");
const logger = require("../utils/logger");
const { checkRequiredProperties } = require("@pptik/galileo");
const fileService = require("../services/file_service");
const joi = require("@hapi/joi");
const validationObject = require("../utils/validation_object");
const { validate } = require("../middlewares/validator");
const { v4 } = require("uuid");
const formidable = Promise.promisifyAll(require("formidable"), {
  multiArgs: true
});

let response;

const createCompany = async (req, res) => {
  try {
    const { company_name, app_type, company_area, company_district, units } = req.body;
    const company_code = generateCode(5);
    const company_guid = v4();
    const companies = await companyService.createCompany({
      company_name,
      company_guid,
      company_code,
      app_type,
      company_area,
      company_district,
      units
    });
    response = { ...requestResponse.success, data: companies };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getCompaniesByDistrict = async (req, res) => {
  try {
    const { area, district } = req.params;
    const type = req.type;
    const companies = await companyService.getCompaniesByDistrict({
      type,
      area,
      district
    });

    response = { ...requestResponse.success, data: companies };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getUnits = async (req, res) => {
  try {
    const companyGuid = req.company || req.params.companyGuid;
    const units = await companyService.getCompanyUnits(companyGuid);
    if (units !== null) {
      response = { ...requestResponse.success, data: units };
    } else {
      response = { ...requestResponse.incomplete_body };
    }
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getCompleteUnits = async (req, res) => {
  try {
    const companyGuid = req.company || req.params.companyGuid;
    const units = await companyService.getCompanyUnitObject(companyGuid);
    if (units !== null) {
      response = { ...requestResponse.success, data: units };
    } else {
      response = { ...requestResponse.incomplete_body };
    }
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const createCompanyUnits = async (req, res) => {
  try {
    const { name } = req.body;
    const companyGuid = req.company;
    const getCompanyCode = await companyService.getCompanyUnitObject(companyGuid);
    const companyCode = getCompanyCode[0].COMPANY_CODE;

    await companyService.createCompanyUnits({ name, companyGuid, companyCode });

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const updateCompanyUnits = async (req, res) => {
  try {
    const { id, name } = req.body;
    await companyService.updateCompanyUnits({ name, id });

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const deactivateCompanyUnits = async (req, res) => {
  try {
    const { id } = req.body;
    await companyService.deactiveCompanyUnits({ id });

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getCompanies = async (req, res) => {
  try {
    const companies = await companyService.getCompanies({
      user_companies: req.companies,
      app_type: req.type
    });

    response = { ...requestResponse.success, data: companies };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getUnitsByCode = async (req, res) => {
  try {
    const units = await companyService.getCompanyUnitsByCode(
      req.params.companyCode.toUpperCase()
    );
    if (units !== null) {
      response = { ...requestResponse.success, data: units };
    } else {
      response = { ...requestResponse.incomplete_body };
    }
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const migrateUnits = async (req, res) => {
  try {
    await companyService.migrateUnits(req.company);

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getCompaniesByAppType = async (req, res) => {
  const { "app-type": appType } = req.query;
  try {
    const companies = await companyService.getCompanies({ app_type: appType });

    response = { ...requestResponse.success, data: companies };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getCompanyByCompanyGuid = async (req, res) => {
  const { companyGuid } = req.params;
  try {
    const companies = await companyService.getCompanyByCompanyGuid(companyGuid);
    response = { ...requestResponse.success, data: companies };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }
  res.status(response.code).json(response);
};

const createCompanyProfile = async (req, res) => {
  const form = formidable();
  try {
    const [fields, files] = await form.parseAsync(req);
    if (
      checkRequiredProperties(requiredRequest.create_profile_company, {
        fields,
        files
      })
    ) {
      await validate(fields, validationObject.createCompanyProfileScheme);
      const guid = fields.company_guid;
      let images = {};
      const timestamp = ~~(new Date() / 1000);
      for (const file in files) {
        const fileName = `${guid}${timestamp}-${file}-PPTIK.${fileService.getFileExtension(
          files[file].name
        )}`;
        const oldPath = files[file].path;
        const newPath = `${process.env.COMPANY_PROFILE_IMAGE_PATH}\\${fileName}`;
        await fileService.moveFile(oldPath, newPath);
        images = { ...images, [file]: fileName };
      }

      await companyService.createCompanyProfile({
        ...fields,
        ...images,
        company: guid
      });

      response = { ...requestResponse.success };
    } else {
      response = { ...requestResponse.incomplete_body };
    }
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
    if (error instanceof joi.ValidationError) {
      const errors = error.details.map(({ path }) => path[0]);
      response = { ...requestResponse.incomplete_body, data: { path: errors } };
      response.message = "Invalid pattern for validation";
    }
  }

  res.status(response.code).json(response);
};

const getCompanyProfile = async (req, res) => {
  const { companyGuid } = req.params;
  try {
    const companyProfile = await companyService.getCompanyProfileByCompanyGuid(
      companyGuid
    );

    response = { ...requestResponse.success, data: companyProfile };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

module.exports = {
  createCompany,
  createCompanyProfile,
  createCompanyUnits,
  updateCompanyUnits,
  deactivateCompanyUnits,
  getCompaniesByDistrict,
  getCompanyByCompanyGuid,
  getUnits,
  getCompanies,
  getCompleteUnits,
  getUnitsByCode,
  migrateUnits,
  getCompaniesByAppType,
  getCompanyProfile
};
