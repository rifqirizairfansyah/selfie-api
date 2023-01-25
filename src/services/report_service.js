const format = require("date-fns/format");
const id = require("date-fns/locale/id");
const parseISO = require("date-fns/parseISO");
const excel = require("exceljs");
const mongoose = require("mongoose");
const { join } = require("path");
const Report = require("../models/report_model");
const companyService = require("../services/company_service");
const { rangeDateConditions, parseTotalAttendance } = require("../utils");

/**
 * @function createUserReport
 * Create user's report
 * @param {Object} reportData
 * @returns {Promise<void>}
 */
const createUserReport = async (reportData) => {
  const company = await companyService.findCompanyByGuid(reportData.company);

  const payload = {
    NAME: reportData.name,
    LONG: reportData.long,
    LAT: reportData.lat,
    ADDRESS: reportData.address,
    STATUS: reportData.status,
    LOCAL_IMAGE: reportData.local_image,
    TIMESTAMP: reportData.timestamp,
    IMAGE: reportData.image,
    GUID: reportData.guid,
    COMPANY: reportData.company,
    UNIT: reportData.unit,
    TYPE: company.TYPE
  };

  if (company.COMPANY_AREA !== undefined) {
    payload.AREA = company.COMPANY_AREA;
    payload.DISTRICT = company.COMPANY_DISTRICT;
  }

  await Report.create(payload);
};

/**
 * @function updateCompanyReport
 * Update a company report
 * @param {String} company
 * @param {String} query
 * @returns {Promise<void>}
 */
const updateCompanyReport = async (company, query) => {
  let Company;

  try {
    // Register model
    Company = require("../models/company_report_model")(company);
  } catch (error) {
    // If model already registered
    Company = mongoose.model(`${company}_company`);
  }

  await Company.updateOne(
    {},
    {
      $addToSet: JSON.parse(query)
    },
    {
      upsert: true
    }
  );
};

/**
 * @function updateUnitReport
 * Update a unit report
 * @param {String} company
 * @param {String} unit
 * @param {String} query
 * @returns {Promise<void>}
 */
const updateUnitReport = async ({ company, unit }, query) => {
  let Unit;

  try {
    // Register model
    Unit = require("../models/unit_report_model")(company);
  } catch (error) {
    // If model already registered
    Unit = mongoose.model(`${company}_unit`);
  }

  await Unit.updateOne(
    { UNIT: unit },
    {
      $set: { UNIT: unit },
      $addToSet: JSON.parse(query)
    },
    {
      upsert: true
    }
  );
};

/**
 * @function updatePersonReport
 * Update a person report
 * @param {String} guid
 * @param {String} idCard
 * @param {String} unit
 * @param {String} company
 * @param {String} query
 * @returns {Promise<void>}
 */
const updatePersonReport = async ({ guid, idCard, unit, company }, query) => {
  let Person;

  try {
    // Register model
    Person = require("../models/person_report_model")(company);
  } catch (error) {
    // If model already registered
    Person = mongoose.model(`${company}_person`);
  }

  await Person.updateOne(
    { GUID: guid },
    {
      $set: { GUID: guid, ID_CARD: idCard, UNIT: unit },
      $addToSet: JSON.parse(query)
    },
    {
      upsert: true
    }
  );
};

/**
 * @function getReports
 * Get reports by the supplied conditions
 * @param {Object} conditions
 * @param {Object} projection
 * @param {Boolean} minified
 * @param {Number} perPage
 * @param {Number} page
 * @returns {DocumentQuery<Document[], Document, {}> & {}}
 */
const getReports = (conditions, projection, { minified, perPage, page }) =>
  minified
    ? Report.find(conditions, projection, { lean: true })
    : Report.find(conditions, projection)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ _id: -1 });

/**
 * @function countReports
 * Get number of reports based by its conditions
 * @param conditions
 * @returns {Query<number> & {}}
 */
const countReports = (conditions) => Report.find(conditions).countDocuments();

/**
 * @function getTotalAttendance
 * Get total attendance (daily, weekly, monthly, and anually) based by its conditions
 * @param {Object} conditions
 * @returns {Promise<{Object}>}
 */
const getTotalAttendance = async (conditions) => {
  let totalAttendance = await Report.aggregate([
    {
      $facet: {
        day: [
          { $match: rangeDateConditions(conditions, "day") },
          {
            $group: {
              _id: "$GUID"
            }
          },
          {
            $count: "total"
          }
        ],
        week: [
          {
            $match: rangeDateConditions(conditions, "week")
          },
          {
            $group: {
              _id: "$GUID"
            }
          },
          {
            $count: "total"
          }
        ],
        month: [
          {
            $match: rangeDateConditions(conditions, "month")
          },
          {
            $group: {
              _id: "$GUID"
            }
          },
          {
            $count: "total"
          }
        ],
        year: [
          {
            $match: rangeDateConditions(conditions, "year")
          },
          {
            $group: {
              _id: "$GUID"
            }
          },
          {
            $count: "total"
          }
        ]
      }
    }
  ]);

  totalAttendance = parseTotalAttendance(totalAttendance);

  return totalAttendance;
};

/**
 * @function exportCompanyReports
 * Export an unit of a company's report
 *
 * Returns path to download
 * @param {Object} conditions
 * @param {string} date
 * @returns {Promise<string>}
 */
const exportCompanyReports = async (conditions, date) => {
  const company = await companyService.findCompanyByGuid(conditions.COMPANY);
  const filename = `Laporan ${company.COMPANY_NAME} - ${conditions.UNIT.replace(
    "/",
    " "
  )} ${date}.xlsx`;
  const workbook = new excel.Workbook();
  const sheet = workbook.addWorksheet("Laporan");
  const projection = {
    _id: false,
    NAME: true,
    TIMESTAMP: true,
    ADDRESS: true,
    DESCRIPTION: true
  };

  const header = [{
    label: "No",
    key: "no"
  }, {
    label: "Nama",
    key: "NAME"
  }, {
    label: "Alamat",
    key: "ADDRESS"
  }, {
    label: "Waktu",
    key: "TIMESTAMP"
  }, {
    label: "Komentar",
    key: "DESCRIPTION"
  }];

  sheet.addRows([
    [format(parseISO(date), "EEEE, dd LLLL yyyy", { locale: id })],
    ["Instansi", company.COMPANY_NAME],
    ["Unit", conditions.UNIT],
    []
  ]);
  sheet.addRow(header.map(({ label }) => label)).eachCell((cell, number) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF5A9BD5" },
      bgColor: { argb: "FFFFFFFF" }
    };
    cell.font = {
      color: { argb: "FFFFFFFF" },
      bold: true
    };
  });
  sheet.getColumn(1).width = 10;
  sheet.getColumn(2).width = 25;
  sheet.getColumn(3).width = 60;
  sheet.getColumn(4).width = 18;
  sheet.getColumn(5).width = 40;

  const reports = await getReports(conditions, projection, {
    minified: true
  }).lean();

  reports.forEach((data, index) => {
    sheet.addRow([
      index + 1,
      ...header.filter(header => header.key !== "no")
        .map(({ key }) => {
          if (key === "TIMESTAMP") {
            const timestamp =
              String(data.TIMESTAMP).length === 10
                ? data.TIMESTAMP * 1000
                : data.TIMESTAMP;
            return format(timestamp, "dd LLLL yyyy HH:mm:ss", {
              locale: id
            });
          }

          if (key === "DESCRIPTION") {
            return data.DESCRIPTION || "-";
          }

          return data[key];
        })
    ]);
  });

  await workbook.xlsx.writeFile(join(process.env.EXPORT_DIR, filename));

  return filename;
};

/**
 * @function getCollectedReports
 * Collect the returned value from some functions
 * @param {Object} conditions
 * @param {Object} projection
 * @param {Object} additionalConditions
 * @returns {Promise<((DocumentQuery<Document[], Document, {}>&{})|{Object}|(Query<number>&{}))[]>}
 */
const getCollectedReports = async (
  conditions,
  projection,
  additionalConditions
) => {
  const [reports, totalData] = await Promise.all([
    getReports(conditions, projection, additionalConditions),
    countReports(conditions)
  ]);

  return [reports, totalData];
};

/**
 * @function updateStatusReport
 * Update a company report
 * @param {String} reportGuid
 * @param {String} report_status
 * @returns {Promise<void>}
 */
const updateStatusReport = (condition, field) => {
  return Report.updateOne(condition, { $set: field });
};

module.exports = {
  createUserReport,
  updateStatusReport,
  updateCompanyReport,
  updateUnitReport,
  updatePersonReport,
  getReports,
  countReports,
  getTotalAttendance,
  exportCompanyReports,
  getCollectedReports
};
