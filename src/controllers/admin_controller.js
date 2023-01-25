const Promise = require("bluebird");
const joi = require("@hapi/joi");
const adminService = require("../services/admin_service");
const companyService = require("../services/company_service");
const fileService = require("../services/file_service");
const { requestResponse, requiredRequest, generateCode } = require("../utils");
const logger = require("../utils/logger");
const formidable = Promise.promisifyAll(require("formidable"), {
  multiArgs: true
});
const validationObject = require("../utils/validation_object");
const { validate } = require("../middlewares/validator");
const { checkRequiredProperties } = require("@pptik/galileo");
const { v4 } = require("uuid");

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

const registration = async (req, res) => {
  try {
    const { email, password, role, type, company_name, company_area, company_district, units } = req.body;
    const company = v4();
    const company_code = generateCode(5);
    const admin = await adminService.registration({
      guid: v4(),
      email,
      password,
      company,
      role,
      type,
      company_name,
      company_guid: company,
      company_code,
      app_type: type,
      company_area,
      company_district,
      units
    });
    response = { ...admin };
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

const updateInformation = async (req, res) => {
  const { title, location, name, presence_hour, leave_hour } = req.body;

  try {
    await adminService.updateInformation({
      guid: req.guid,
      title,
      location,
      name,
      presence_hour,
      leave_hour
    });

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getInformation = async (req, res) => {
  const { guid } = req;
  try {
    let information = await adminService.getInformation({ admin_guid: guid });
    information =
      Object.keys(information).length !== 0
        ? information.ADDITIONAL
        : information;

    response = { ...requestResponse.success, data: information };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const updateCompanyProfile = async (req, res) => {
  const form = formidable();
  try {
    const [fields, files] = await form.parseAsync(req);
    if (
      checkRequiredProperties(requiredRequest.company_profile_update, {
        fields,
        files
      })
    ) {
      await validate(fields, validationObject.updateCompanyProfileScheme);
      const guid = req.guid;
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

      await companyService.updateCompanyProfile({
        ...fields,
        ...images,
        guid: guid,
        company: req.company
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

const companyProfile = async (req, res) => {
  const companyGuid = req.company;

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
  login,
  registration,
  updateInformation,
  getInformation,
  updateCompanyProfile,
  companyProfile
};
