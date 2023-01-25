require("dotenv").config();
const compression = require("compression");
const express = require("express");
const morgan = require("morgan");
const format = require("date-fns/format");
const basicAuth = require("express-basic-auth");
const fs = require("fs");
const gracefulFs = require("graceful-fs");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const mongo = require("./database/mongo");
const routes = require("./routes");
const amqp = require("./message_brokers/amqp");
const parseAppType = require("./middlewares/app_type");
const bearerToken = require("./middlewares/bearer_token");
const { cors } = require("./config");
const logger = require("./utils/logger");
const { requestResponse } = require("./utils/index");
const swaggerDocument = YAML.load("./swagger.yaml");
const openIddictIdentityServer = require("./openid/client");
const { API_DOCS_USERNAME, API_DOCS_PASSWORD } = process.env;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

morgan.token("date", (req, res, tz) => {
  return `[${format(new Date(), "dd-MM-yyyy HH:mm:ss")}]`;
});

mongo.createConnection().then((_) => logger.info("MongoDB connected"));
amqp.connectToAmqp().then((_) => logger.info("AMQP connected!"));
openIddictIdentityServer
  .connectIdentity()
  .then((_) => logger.info("Open Id Connected"));

gracefulFs.gracefulify(fs);

const app = express();
app.use(helmet());
app.use(compression());
app.use(cors);
app.use(
  "/api-docs",
  basicAuth({
    users: {
      [API_DOCS_USERNAME]: API_DOCS_PASSWORD
    },
    challenge: true
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);
app.use(bearerToken());
app.use(parseAppType());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan(
    ":date[Asia/Jakarta] :method :url :status :response-time ms - :res[content-length]"
  )
);
app.use(routes);
app.use((req, res) => {
  const response = requestResponse.not_found;
  res.status(response.code).json(response);
});

module.exports = app;
