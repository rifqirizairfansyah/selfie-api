const Promise = require("bluebird");
const joi = require("@hapi/joi");
const { v4: uuidv4 } = require("uuid");
const { validate } = require("../middlewares/validator");
const fileService = require("../services/file_service");
const userService = require("../services/user_service");
const {
  requestResponse,
  requiredRequest,
  checkRequiredProperties
} = require("../utils");
const logger = require("../utils/logger");
const validationObject = require("../utils/validation_object");
const formidable = Promise.promisifyAll(require("formidable"), {
  multiArgs: true
});

let response;

const signIn = async (req, res) => {
  const { email, password } = req.body;
  const { app_type } = req;
  try {
    const user = await userService.logInUser(email, password, app_type);
    response = { ...user };
  } catch (error) {
    logger.error(error);

    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const signUp = async (req, res) => {
  const { app_type } = req;
  const form = formidable();
  try {
    const [fields, files] = await form.parseAsync(req);

    if (checkRequiredProperties(requiredRequest.register, { fields, files })) {
      if (req.baseUrl === "/admin/user") {
        await validate(fields, validationObject.signUpScheme);
      }
      const guid = uuidv4();
      const timestamp = ~~(new Date() / 1000);
      let images = {};
      for (const file in files) {
        const fileName = `${guid}${timestamp}-${file}-PPTIK.${fileService.getFileExtension(
          files[file].name
        )}`;
        const oldPath = files[file].path;
        const newPath = `${process.env.IMAGE_PATH}\\${fileName}`;
        await fileService.moveFile(oldPath, newPath);
        images = { ...images, [file]: fileName };
      }
      const user = await userService.registerUser(
        {
          ...fields,
          ...images,
          timestamp: timestamp,
          guid: guid
        },
        app_type
      );

      response = { ...user };
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

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateProfile(req.body);

    response = { ...requestResponse.success, data: user };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const changePassword = async (req, res) => {
  const {
    email,
    current_password: currentPassword,
    new_password: newPassword,
    new_password_confirmation: newPasswordConfirmation
  } = req.body;
  try {
    const user = await userService.changePassword({
      email,
      currentPassword,
      newPassword,
      newPasswordConfirmation
    });

    response = { ...user };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const resetPassword = async (req, res) => {
  const { email } = req.body;
  const { app_type } = req;
  try {
    const resetPassword = await userService.resetPassword({ email }, app_type);

    response = { ...resetPassword };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const bindGoogleAccount = async (req, res) => {
  const { email, token } = req.body;
  try {
    const bindGoogleAccount = await userService.bindGoogleAccount({
      email,
      token
    });

    response = { ...bindGoogleAccount };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const googleSignIn = async (req, res) => {
  const { token } = req.body;
  try {
    const user = userService.googleSignIn({ token });

    response = { ...user };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getUsers = async (req, res) => {
  const { company, unit } = req.params;
  try {
    const conditions = {
      ...(company && { COMPANY: company }),
      ...(unit && { UNIT: unit })
    };

    const users = await userService.getUsers(conditions);

    response = { ...requestResponse.success, data: users };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const get = async (req, res) => {
  const page = req.query.page || 1;
  const { role } = req.query;
  const { company } = req;
  const perPage = 10;
  try {
    const conditions = {
      APP_TYPE: req.type,
      ...(role && { ROLE: role }),
      COMPANY: company
    };
    const projection = {
      _id: false,
      PASSWORD: false,
      TIMESTAMP: false,
      LOCAL_IMAGE: false,
      APP_TYPE: false,
      ROLE: false
    };
    const additionalConditions = {
      page,
      perPage
    };

    const users = await userService.getUsers(
      conditions,
      projection,
      additionalConditions
    );
    const totalData = await userService.countUsers(conditions);

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

const find = async (req, res) => {
  const { id } = req.params;
  try {
    const conditions = {
      APP_TYPE: req.type,
      GUID: id
    };
    const projection = {
      _id: false,
      PASSWORD: false,
      TIMESTAMP: false,
      LOCAL_IMAGE: false,
      APP_TYPE: false,
      ROLE: false
    };

    const users = await userService.findUser(conditions, projection);

    response = { ...requestResponse.success, data: users };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const update = async (req, res) => {
  const { id } = req.params;
  try {
    const conditions = {
      APP_TYPE: req.type,
      GUID: id
    };
    const user = await userService.updateUser(conditions, {
      ...req.body
    });

    response = { ...user };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }
  res.status(response.code).json(response);
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    const conditions = {
      APP_TYPE: req.type,
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
  signIn,
  signUp,
  updateUser,
  changePassword,
  resetPassword,
  bindGoogleAccount,
  googleSignIn,
  getUsers,
  get,
  find,
  update,
  destroy
};
