require("dotenv").config();
const {
  parseISO,
  getUnixTime,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear
} = require("date-fns");
const logger = require("./logger");

/**
 * @function checkRequest
 * This method is used in express middleware. It will check the incoming request with required request.
 * @param {Object} requiredRequest
 * @returns {function(...[*]=)}
 */
const checkRequest = (requiredRequest) => {
  return async (req, res, next) => {
    let valid = true;

    for (const type in requiredRequest) {
      if (type === "file") {
        if (!(req.file.fieldname === requiredRequest[type])) {
          if (process.env.NODE_ENV !== "production") {
            logger.info("Missing 'file' field");
          }
          valid = false;
        }
      } else {
        requiredRequest[type].forEach((parameterName) => {
          if (!(parameterName in req[type])) {
            if (process.env.NODE_ENV !== "production") {
              logger.info(`Missing ${parameterName} field`);
            }
            valid = false;
          }
        });
      }
    }

    if (!valid) {
      res
        .status(requestResponse.incomplete_body.code)
        .json(requestResponse.incomplete_body);
    } else {
      next();
    }
  };
};

/**
 * @function checkReqeuiredProperties
 * This method is an alternative method from checkRequest, but can be used more universal, not limited only to express middleware.
 * @param {Object} requiredProperties
 * @param {Object} properties
 * @returns {boolean}
 */
const checkRequiredProperties = (requiredProperties, properties) => {
  let valid = true;

  for (const type in requiredProperties) {
    requiredProperties[type].forEach((parameterName) => {
      if (!(parameterName in properties[type])) {
        if (process.env.NODE_ENV !== "production") {
          logger.info(`Missing ${parameterName} field`);
        }
        valid = false;
      }
    });
  }

  return valid;
};

/**
 * @function parseTotalAttendance
 * The input is an array of object that produced from MongoDB aggregation process (see {@link getTotalAttendance}).
 * The goal is to destructure (or flatten) the array into a single object.
 * @param {Array} totalAttendance
 * @returns {{week, month, year, day}}
 */
const parseTotalAttendance = (totalAttendance) => {
  let { day, week, month, year } = totalAttendance[0];

  day = day.length === 0 ? 0 : day[0].total;
  week = week.length === 0 ? 0 : week[0].total;
  month = month.length === 0 ? 0 : month[0].total;
  year = year.length === 0 ? 0 : year[0].total;

  return { day, week, month, year };
};

const requiredRequest = {
  profile_update: { body: ["guid", "company"] },
  admin_login: { body: ["email", "password"] },
  admin_registration: { body: ["email", "password", "role", "type", "company_name", "company_area", "company_district", "units"] },
  authorization: { headers: ["authorization"] },
  login: { body: ["email", "password"] },
  register: {
    fields: [
      "name",
      "email",
      "password",
      "position",
      "id_card",
      "company",
      "unit",
      "phone_number"
    ],
    files: ["image"]
  },
  change_password: {
    body: [
      "email",
      "current_password",
      "new_password",
      "new_password_confirmation"
    ]
  },
  create_report: {
    fields: [
      "company",
      "guid",
      "name",
      "long",
      "lat",
      "address",
      "local_image",
      "status",
      "position",
      "unit",
      "description"
    ],
    files: ["image"]
  },
  reset_password: { body: ["email"] },
  bind_google_account: { body: ["email", "token"] },
  google_sign_in: { body: ["token"] },
  update_admin_information: {
    body: ["title", "location"],
    headers: ["authorization"]
  },
  create_map_boundaries: {
    body: ["map_boundaries"],
    headers: ["authorization"]
  },
  update_user: {
    body: [
      "name",
      "email",
      "position",
      "id_card",
      "company",
      "unit",
      "phone_number"
    ],
    headers: ["authorization"]
  },
  company_profile_update: {
    fields: ["name", "description", "slug", "registrant_name", "phone", "institution"]
  },
  create_profile_company: {
    fields: ["name", "description", "slug", "registrant_name", "phone", "company_guid", "institution"]
  },
  companies_by_app_type: {
    query: ["app-type"]
  }
};

const requestResponse = {
  success: {
    code: 200,
    status: true,
    message: "Success."
  },
  incomplete_body: {
    code: 400,
    status: false,
    message: "Bad request. Please check your request data."
  },
  unauthorized: {
    code: 401,
    status: false,
    message:
      "E-mail or password does not match, or you are not authorized to accessing this page."
  },
  not_found: {
    code: 404,
    status: false,
    message: "Resource not found"
  },
  unprocessable_entity: {
    code: 422,
    status: false,
    message: "The request you sent is unable to process"
  },
  server_error: {
    code: 500,
    status: true,
    message: "Internal server error. Please contact the administrator."
  }
};

/**
 * @function rangeDateConditions
 * There are two possibilities in baseCondition parameter. First is an empty object ({}), and second is a set of object.
 * With the second possibility, there must be supplied TIMESTAMP as its property.
 * If in the baseCondition has TIMESTAMP as its member property, then it will take the value and multiply it by 1000
 * (because the supplied TIMESTAMP is a second-based UNIX timestamp and JavaScript only accept the millisecond-based UNIX timestamp.
 * otherwise, the result will set to a date in 1970).
 * If no TIMESTAMP in baseCondition, it will initiate current time (a second-based UNIX timestamp).
 *
 * After it get the initial time, the second parameter (type) will be tested.
 * If the value is 'day', 'week', 'month', or 'year' string, then it will call the ${@link startOf} (as gte) and ${@link endOf} (lte) method.
 * That will returns a start and end of supplied value time and period (day, week, month, or year) in second-based UNIX timestamp.
 * Otherwise, it will get a second-based UNIX timestamp from supplied type.
 *
 * Return a combination of baseCondition and gte and lte as an object.
 * @param {Object} baseCondition
 * @param {String | Date} type
 * @returns {{TIMESTAMP: {$gte: number, $lte: number}}}
 */
const rangeDateConditions = (baseCondition, type) => {
  let initialTime =
    baseCondition.TIMESTAMP !== undefined
      ? baseCondition.TIMESTAMP["$gte"] * 1000
      : (new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      ) /
          1000) *
        1000;
  initialTime =
    initialTime.toString().length === 10
      ? parseInt(initialTime) * 1000
      : initialTime;
  const gte = /^(day|week|month|year)$/g.test(type)
    ? getUnixTime(startOf(type, initialTime))
    : getUnixTime(parseISO(`${type} 00:00:00`));
  const lte = /^(day|week|month|year)$/g.test(type)
    ? getUnixTime(endOf(type, initialTime))
    : getUnixTime(parseISO(`${type} 23:59:59`));
  const rangeDate = {
    TIMESTAMP: {
      $gte: gte,
      $lte: lte
    }
  };

  return { ...baseCondition, ...rangeDate };
};

/**
 * @function startOf
 * Calling startOfDay method (from date-fns) from supplied argument
 * @param {String} type
 * @param {String | Date} date
 * @returns {Date}
 */
const startOf = (type, date) => {
  switch (type) {
    case "day":
      return startOfDay(date);
    case "week":
      return startOfWeek(date);
    case "month":
      return startOfMonth(date);
    case "year":
      return startOfYear(date);
  }
};

/**
 * @function endOf
 * Calling endOfDay method (from date-fns) from supplied argument
 * @param {String} type
 * @param {String | Date} date
 * @returns {Date}
 */
const endOf = (type, date) => {
  switch (type) {
    case "day":
      return endOfDay(date);
    case "week":
      return endOfWeek(date);
    case "month":
      return endOfMonth(date);
    case "year":
      return endOfYear(date);
  }
};

/**
 * @function buildCompaniesCondition
 * Map the supplied array to object
 * @param {Array} companies
 * @returns {Array<Object>}
 */
const buildCompaniesCondition = (companies, isCompanyCollection = true) => {
  return companies.map((company) => ({
    [isCompanyCollection ? "COMPANY_GUID" : "COMPANY"]: company
  }));
};

/**
 * @function toTitleCase
 * Transform supplied string to title case
 * @param {String} string
 * @returns {String}
 */
const toTitleCase = (string) => {
  return string
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
    .join(" ");
};

const buildGroupReportTypeCondition = (reportTypes, type) => {
  return {
    [type === "task" ? "$nor" : "$or"]: reportTypes.map((reportType) => ({
      "REPORT_TYPE.GUID": reportType.CODE
    }))
  };
};

const buildUsersWithRoleCondition = (users, role) => {
  if (users.length === 0) {
    // This is not an actual field. This returned object is just to make the query to be failed
    // because no data matched with the selected role
    return { ROLE: role };
  }

  return {
    $or: users.map(({ GUID }) => ({ GUID }))
  };
};

const generateCode = (length) => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = {
  checkRequest,
  generateCode,
  rangeDateConditions,
  parseTotalAttendance,
  buildCompaniesCondition,
  checkRequiredProperties,
  toTitleCase,
  requestResponse,
  requiredRequest,
  buildGroupReportTypeCondition,
  buildUsersWithRoleCondition
};
