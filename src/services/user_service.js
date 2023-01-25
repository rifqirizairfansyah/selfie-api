const Profile = require("../models/profile_model");
const User = require("../models/user_model");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const { validate: isUuid } = require("uuid");
const {
  findCompanyByCode,
  findCompanyByGuid
} = require("../services/company_service");
const { requestResponse, toTitleCase } = require("../utils");
const { SMTP_HOST, SMTP_PORT, APP_NAME, GOOGLE_CLIENT_ID } = process.env;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT
});

/**
 * @function findUserByEmail
 * Find an user by its email
 * @param {String} email
 * @returns {Promise<Document>}
 */
const findUserByEmail = async (email, app_type = undefined) => {
  const user = await User.findOne(
    {
      EMAIL: email,
      ...(app_type !== undefined && {
        APP_TYPE: app_type
      })
    },
    { _id: false },
    { lean: true }
  );

  return user;
};

/**
 * @function findUserByEmail
 * Find an user by its email
 * @param {String} email
 * @returns {Promise<Document>}
 */
const findUserByEmailOrIdCard = async (emailOrIdCard) => {
  return User.findOne(
    {
      $or: [
        {
          EMAIL: emailOrIdCard
        },
        {
          ID_CARD: emailOrIdCard
        }
      ]
    },
    { _id: false },
    { lean: true }
  );
};

/**
 * @function registerUser
 * Register an user
 * @param {Object} userData
 * @returns {Promise<{code: number, message: string, status: boolean}>}
 */
const registerUser = async (userData, app_type) => {
  let response;
  const { company, email } = userData;

  let companyData;
  if (isUuid(company)) {
    companyData = await findCompanyByGuid(company);
  } else {
    companyData = await findCompanyByCode(company);
  }

  if (companyData === null) {
    response = { ...requestResponse.unprocessable_entity };
    response.message = "No company with that code";

    return response;
  }

  const user = await findUserByEmail(email, app_type);

  if (user !== null) {
    response = { ...requestResponse.unprocessable_entity };
    response.message = "E-mail already registered";

    return response;
  }

  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const payload = {
    NAME:
      userData.name[0] === userData.name[0].toUpperCase()
        ? userData.name
        : toTitleCase(userData.name),
    EMAIL: userData.email,
    PASSWORD: hashedPassword,
    POSITION: userData.position,
    ID_CARD: userData.id_card,
    COMPANY: companyData.COMPANY_GUID,
    TIMESTAMP: userData.timestamp,
    LOCAL_IMAGE: userData.local_image,
    IMAGE: userData.image,
    UNIT: userData.unit,
    GUID: userData.guid,
    PHONE_NUMBER: userData.phone_number,
    IDENTITY_CARD_IMAGE: userData.identity_card_image,
    FAMILY_CARD_IMAGE: userData.family_card_image,
    APP_TYPE: app_type || companyData.COMPANY_TYPE,
    ROLE: userData.role
  };

  await User.create(payload);
  await Profile.create({
    USER_GUID: userData.guid,
    ...(userData.user_location_long !== undefined && {
      USER_LOCATION: {
        ADDRESS: userData.user_location_address,
        LONG: userData.user_location_long,
        LAT: userData.user_location_lat
      }
    }),
    ...(userData.user_property_location_long !== undefined && {
      USER_PROPERTY_LOCATION: {
        LONG: userData.user_property_location_long,
        LAT: userData.user_property_location_lat
      }
    })
  });

  return { ...requestResponse.success };
};

/**
 * @function getUserIdCardByGuid
 * Get the ID card of an user by its GUID
 * @param {String} guid
 * @returns {Promise<any>}
 */
const getUserIdCardByGuid = async (guid) => {
  const { ID_CARD } = await User.findOne(
    { GUID: guid },
    { _id: false, ID_CARD: true }
  );

  return ID_CARD;
};

/**
 * @function updateProfile
 * Update user's profile
 * @param {String} guid
 * @param {String} company
 * @param {String} unit
 * @returns {Promise<{}>}
 */
const updateProfile = async ({ guid, company, unit }) => {
  const condition = {
    ...(unit && { UNIT: unit })
  };

  const companyData = await findCompanyByCode(company);
  condition.COMPANY = companyData.COMPANY_GUID;

  await User.updateOne({ GUID: guid }, { $set: condition });

  return condition;
};

/**
 * @function updateUserPassword
 * Update user's password
 *
 * If unsetIdCard is supplied by true, it will unset the user's ID card
 * @param {String} email
 * @param {String} password
 * @param {Boolean} unsetIdCard
 * @returns {Promise<void>}
 */
const updateUserPassword = async ({ email, password }, unsetIdCard) => {
  const doc = unsetIdCard
    ? {
      $set: { PASSWORD: password },
      $unset: { ID_CARD: true }
    }
    : { $set: { PASSWORD: password } };
  await User.updateOne({ EMAIL: email }, doc);
};

/**
 * @function logInUser
 * Log in a user
 * @param {String} email
 * @param {String} password
 * @param {String|undefined} app_type
 * @returns {Promise<Object>}
 */
const logInUser = async (email, password, app_type) => {
  const user = await findUserByEmailOrIdCard(email);

  if (user === null) {
    return requestResponse.unauthorized;
  }

  const { PASSWORD: userPassword, ID_CARD, TIMESTAMP, ...userData } = user;
  if (ID_CARD === password) {
    const hashedPassword = await bcrypt.hash(password, 12);

    await updateUserPassword({ email, password: hashedPassword }, true);

    return { ...requestResponse.success, data: user };
  } else if (userPassword !== undefined) {
    const matchPassword = await bcrypt.compare(password, userPassword);

    if (!matchPassword) {
      return { ...requestResponse.unauthorized };
    }

    return { ...requestResponse.success, data: userData };
  } else {
    return { ...requestResponse.unauthorized };
  }
};

/**
 * @function changePassword
 * Update user's password. There's a validation in this function
 * @param email
 * @param currentPassword
 * @param newPassword
 * @param newPasswordConfirmation
 * @returns {Promise<{code: number, message: string, status: boolean}>}
 */
const changePassword = async ({
  email,
  currentPassword,
  newPassword,
  newPasswordConfirmation
}) => {
  let response;
  const user = await findUserByEmail(email);

  if (user === null) {
    return requestResponse.unauthorized;
  }

  if (newPassword !== newPasswordConfirmation) {
    response = { ...requestResponse.unauthorized };
    response.message =
      "Your new password and confirmation password doesn't match";

    return response;
  }

  const matchCurrentPassword = await bcrypt.compare(
    currentPassword,
    user.PASSWORD
  );

  if (!matchCurrentPassword) {
    response = { ...requestResponse.unauthorized };
    response.message = "Your current password does not match";

    return response;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await updateUserPassword({ email, password: hashedPassword }, false);

  return requestResponse.success;
};

const resetPassword = async ({ email }, app_type) => {
  const user = await findUserByEmail(email, app_type);

  if (user === null) {
    return {
      ...requestResponse.unprocessable_entity,
      message: "E-mail address not found"
    };
  }

  const newPassword = generatePassword(12);
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await transport.sendMail({
    from: `'${APP_NAME}' <pptik@pptik.itb.ac.id>`,
    to: `${email}`,
    subject: "Informasi Pengaturan Ulang Kata Sandi",
    text: `Seseorang telah melakukan permintaan untuk pengaturan ulang kata sandi untuk akun anda.
    Setelah mendapatkan kata sandi baru, diharapkan untuk mengubahnya kembali di menu pengaturan.
    
    Berikut adalah kata sandi baru anda: ${newPassword}`,
    html: `Seseorang telah melakukan permintaan untuk pengaturan ulang kata sandi untuk akun anda.
    Setelah mendapatkan kata sandi baru, diharapkan untuk mengubahnya kembali di menu pengaturan.
    <br><br>
    Berikut adalah kata sandi baru anda: <b>${newPassword}</b>`
  });

  await User.updateOne(
    { EMAIL: email },
    { $set: { PASSWORD: hashedPassword } }
  );

  return { ...requestResponse.success, message: "E-mail has been sent" };
};

const generatePassword = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const findGoogleId = ({ google_id: googleId }, projection = {}) =>
  User.findOne({ GOOGLE_ID: googleId }, projection);

const bindGoogleAccount = async ({ email, token }) => {
  const user = await findUserByEmail(email);

  if (user === null) {
    return {
      ...requestResponse.unprocessable_entity,
      message: "E-mail address not found"
    };
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID
  });
  const { sub: googleId } = ticket.getPayload();

  const findGoogleAccount = await findGoogleId({ google_id: googleId });
  if (findGoogleAccount !== null) {
    return {
      ...requestResponse.unprocessable_entity,
      message: "Google account has already binded to another account"
    };
  }

  await User.updateOne({ EMAIL: email }, { $set: { GOOGLE_ID: googleId } });

  return { ...requestResponse.success };
};

const googleSignIn = async ({ token }) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID
  });
  const { sub: googleId } = ticket.getPayload();

  const user = await findGoogleId(
    { google_id: googleId },
    {
      _id: false,
      NAME: true,
      EMAIL: true,
      POSITION: true,
      COMPANY: true,
      LOCAL_IMAGE: true,
      GUID: true,
      IMAGE: true,
      UNIT: true
    }
  );
  if (user === null) {
    return {
      ...requestResponse.unprocessable_entity,
      message: "Account with that Google account is not found"
    };
  }

  return { ...requestResponse.success, data: user };
};

/**
 * @function getUsers
 * Get list of users based by passed conditions
 * @param {Object} conditions
 */
const getUsers = (
  conditions = {},
  projection = { _id: false, NAME: true, GUID: true },
  additionalConditions = { perPage: 0, page: 0 }
) => {
  if (additionalConditions.perPage === 0) {
    return User.find(conditions, { _id: false, NAME: true, GUID: true }).lean();
  }
  return User.find(conditions, projection)
    .skip((additionalConditions.page - 1) * additionalConditions.perPage)
    .limit(additionalConditions.perPage)
    .lean();
};

const findUser = (
  conditions = {},
  projection = { _id: false, NAME: true, GUID: true }
) => {
  return User.findOne(conditions, projection);
};

const updateUser = async (conditions, data) => {
  let response;
  const user = await findUser(conditions, { EMAIL: true });
  if (user.EMAIL !== data.email) {
    const findUserEmail = await findUserByEmail(data.email);
    if (findUserEmail) {
      response = { ...requestResponse.unprocessable_entity };
      response.message = "E-mail is already registered";

      return response;
    }
  }

  let hashedPassword;
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 12);
  } else {
    hashedPassword = "";
  }
  const payload = {
    NAME: data.name,
    EMAIL: data.email,
    POSITION: data.position,
    ID_CARD: data.id_card,
    COMPANY: data.company,
    UNIT: data.unit,
    PHONE_NUMBER: data.phone_number,
    ...(data.password && {
      PASSWORD: hashedPassword
    })
  };

  await User.updateOne(conditions, { $set: payload });

  response = { ...requestResponse.success };

  return response;
};

const deleteUser = (conditions) => {
  return User.deleteOne(conditions);
};

const countUsers = (conditions) => {
  return User.find(conditions).countDocuments();
};

module.exports = {
  findUserByEmail,
  findUserByEmailOrIdCard,
  registerUser,
  getUserIdCardByGuid,
  updateProfile,
  logInUser,
  changePassword,
  resetPassword,
  bindGoogleAccount,
  googleSignIn,
  getUsers,
  findUser,
  updateUser,
  deleteUser,
  countUsers
};
