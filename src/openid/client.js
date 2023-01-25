require("dotenv").config();
const querystring = require("querystring");
const { Issuer, Strategy, generators } = require("openid-client");
const logger = require("../utils/logger");
const axios = require("axios");

let client;
let clientMobile;

let config = {
  client_id: process.env.client_id,
  client_secret: process.env.client_secret,
  redirect_uris: [process.env.redirect_uris],
  post_logout_redirect_uris: [process.env.post_logout_redirect_uris],
  response_types: ["code"]
};

const connectIdentity = async () => {
  try {
    const criiptoIssuer = await Issuer.discover(
      process.env.identity_server_root
    );
    client = new criiptoIssuer.Client(config);
  } catch (error) {
    logger.error(error);
  }
};

const connectIdentityMobile = async () => {
  try {
    const criiptoIssuer = await Issuer.discover(
      process.env.identity_server_root
    );

    clientMobile = new criiptoIssuer.Client({
      ...config,
      response_types: ["code"],
      redirect_uris: [process.env.redirect_uris_mobile],
      post_logout_redirect_uris: [process.env.post_logout_redirect_uris_mobile]
    });
  } catch (error) {
    logger.error(error);
  }
};

const clientIdentity = () => client;
const clientIdentityMobile = () => clientMobile;

// check validation access_token
const introspectIdentity = async (access_token) => {
  try {
    const config = {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${access_token}`
      }
    };
    const checkValidationToken = await axios.post(
      "https://demo-accounts.pptik.id/oauth2/introspect",
      querystring.stringify({ token: access_token }),
      config
    );
    return checkValidationToken.data;
  } catch (error) {
    logger.error(error);
  }
};

const getUserIdentity = async (access_token) => {
  try {
    const userinfo = await client.userinfo(access_token);
    return userinfo;
  } catch (error) {
    logger.error(error);
  }
};

module.exports = {
  generators,
  Strategy,
  connectIdentityMobile,
  connectIdentity,
  clientIdentityMobile,
  introspectIdentity,
  getUserIdentity,
  clientIdentity
};
