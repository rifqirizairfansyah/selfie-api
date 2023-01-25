require("dotenv").config();
const https = require("https");
const { readFileSync } = require("fs");
const app = require("./src/app");
const logger = require("./src/utils/logger");
const credentials = {
  rejectUnauthorized: false,
  pfx: readFileSync(process.env.PFX_FILE),
  passphrase: process.env.PFX_PASSPHRASE,
  ca: readFileSync(process.env.INTERCERT_FILE)
};

const server = https.createServer(credentials, app);

server.listen(process.env.PORT, () => {
  logger.info(`Server started on port ${process.env.PORT}`);
});
