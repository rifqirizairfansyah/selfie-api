require("dotenv").config();

const {
  clientIdentity,
  clientIdentityMobile,
  generators
} = require("../openid/client");
const UserController = require("../controllers/user_controller");

const logger = require("../utils/logger");
const { requestResponse } = require("../utils");
const url = require("url");

const nonce = generators.nonce();

let response;
// internal_application_mgt_view
const signin = async (req, res) => {
  const url = clientIdentity().authorizationUrl({
    scope: "openid email profile phone name",
    response_mode: "query",
    nonce: nonce
  });
  return res.redirect(url);
};

const signinCallback = async (req, res) => {
  const params = clientIdentity().callbackParams(req);

  const tokenSet = await clientIdentity().callback(
    process.env.redirect_uris,
    params,
    { nonce }
  );
  // const userinfo = await clientIdentity().userinfo(tokenSet.access_token);
  const checkUser = " ";
  // const checkUser = await UserController.findUserByEmailAndIdentityUser(
  //   userinfo.sub
  // );

  if (checkUser == null) {
    return res.redirect(
      url.format({
        pathname: process.env.frontend_optional_registration_root,
        query: {
          access_token: tokenSet.access_token,
          refresh_token: tokenSet.refresh_token
        }
      })
    );
  } else {
    return res.redirect(
      url.format({
        pathname: process.env.frontend_root,
        query: {
          access_token: tokenSet.access_token,
          refresh_token: tokenSet.refresh_token,
          role: checkUser.role
        }
      })
    );
  }
};

const signinMobile = async (req, res) => {
  const url = clientIdentityMobile().authorizationUrl({
    scope: "openid api profile email offline_access",
    response_mode: "query",
    nonce: nonce
  });
  return res.redirect(url);
};

const signinCallbackMobile = async (req, res) => {
  try {
    const params = clientIdentityMobile().callbackParams(req);
    params.client_id = process.env.client_id;
    params.client_secret = process.env.client_secret;
    params.grant_type = "authorization_code";

    const tokenSet = await clientIdentityMobile().callback(
      process.env.redirect_uris_mobile,
      params
    );

    res.send({
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token
    });
  } catch (error) {
    logger.error(error);
  }
};

const getUsersIdentity = async (req, res) => {
  try {
    const userinfo = await clientIdentity().userinfo(req.access_token);
    response = { ...requestResponse.success, data: userinfo };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }
  res.status(response.code).json(response);
};

const refreshTokenIdentity = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const newToken = await clientIdentity().refresh(refresh_token);
    response = { ...requestResponse.success, data: newToken };
  } catch (error) {
    logger.error(error);
    response = {
      ...requestResponse.unauthorized,
      message: "Refresh token no longer valid"
    };
  }
  res.status(response.code).json(response);
};

const signout = async (req, res) => {
  await clientIdentity().endSessionUrl();
  res.redirect(clientIdentity().endSessionUrl());
};

const signoutCallback = async (req, res) => {
  res.redirect(process.env.frontend_logout);
};

module.exports = {
  signin,
  signinCallback,
  signout,
  signoutCallback,
  signinMobile,
  signinCallbackMobile,
  getUsersIdentity,
  refreshTokenIdentity
};
