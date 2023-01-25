const format = require("date-fns/format");
const Promise = require("bluebird");
const ObjectId = require("mongoose").Types.ObjectId;
const Report = require("../models/report_model");
const fileService = require("../services/file_service");
const reportService = require("../services/report_service");
const reportTypeService = require("../services/report_type_service");
const userService = require("../services/user_service");
const {
  requestResponse,
  rangeDateConditions,
  checkRequiredProperties,
  requiredRequest,
  buildCompaniesCondition,
  buildGroupReportTypeCondition,
  buildUsersWithRoleCondition
} = require("../utils");
const logger = require("../utils/logger");
const formidable = Promise.promisifyAll(require("formidable"), {
  multiArgs: true
});

let response;

const createReport = async (req, res) => {
  const form = formidable();
  try {
    const [fields, files] = await form.parseAsync(req);

    if (
      checkRequiredProperties(requiredRequest.create_report, { fields, files })
    ) {
      const dateNow = ~~(new Date() / 1000);
      const fileName = `${
        fields.guid
      }${dateNow}-PPTIK.${fileService.getFileExtension(files.image.name)}`;
      const oldPath = files.image.path;
      const newPath = `${process.env.IMAGE_PATH}\\${fileName}`;
      await fileService.moveFile(oldPath, newPath);

      const { company, unit, guid } = fields;
      const reportData = {
        ...fields,
        image: "data/kehadiran/image/" + fileName
      };
      const [year, month, day] = [
        format(dateNow * 1000, "yyyy"),
        format(dateNow * 1000, "MM"),
        format(dateNow * 1000, "dd")
      ];
      const query = `{"REPORT._${year}._${month}._${day}.DATA": ${JSON.stringify(
        fields
      )}}`;
      const idCard = await userService.getUserIdCardByGuid(guid);

      reportData.timestamp = dateNow;

      logger.info(`Updating ${guid}'s report`);
      await reportService.createUserReport(reportData);
      await reportService.updateCompanyReport(company, query);
      await reportService.updateUnitReport({ company, unit }, query);
      await reportService.updatePersonReport(
        { guid, idCard, unit, company },
        query
      );

      response = { ...requestResponse.success };
    } else {
      response = { ...requestResponse.incomplete_body };
    }
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const show = async (req, res) => {
  const { company, person } = req.params;
  const page = req.params.page || 1;
  const minified = req.query.minified === "true";
  const perPage = 10;

  try {
    const conditions = {
      COMPANY: company,
      GUID: person
    };

    const additionalConditions = { page, minified, perPage };
    const projection = minified
      ? { _id: true, LAT: true, LONG: true }
      : {
        GUID: false,
        UNIT: false,
        STATUS: false,
        COMPANY: false,
        AREA: false,
        DISTRICT: false
      };
    const reports = await reportService.getReports(
      conditions,
      projection,
      additionalConditions
    );

    response = { ...requestResponse.success, data: reports };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getCompanyReports = async (req, res, next) => {
  const page = req.query.page || 1;
  const minified = req.query.minified === "true";
  const totalAttendance = req.query.total_attendance === "true";
  const { report_type, group_report_type, date } = req.query;
  const reportTypes = await reportTypeService.getReportTypes();
  const perPage = 10;
  const { unit } = req.params;
  const conditions = {
    COMPANY: req.company,
    ...(unit && { UNIT: unit }),
    ...(date && { ...rangeDateConditions({}, date) }),
    ...(report_type && { "REPORT_TYPE.GUID": report_type }),
    ...(group_report_type && {
      ...buildGroupReportTypeCondition(reportTypes, group_report_type)
    })
  };

  const dataToPass = {
    page,
    minified,
    totalAttendance,
    perPage,
    conditions
  };

  res.locals = dataToPass;

  next();
};

const getHierarchicalReports = async (req, res, next) => {
  let users = [];
  const page = req.query.page || 1;
  const minified = req.query.minified === "true";
  const totalAttendance = req.query.total_attendance === "true";
  const { report_type, group_report_type, date, role } = req.query;
  const reportTypes = await reportTypeService.getReportTypes();
  const perPage = 10;
  const { area, district, company, unit } = req.params;

  if (role !== undefined) {
    users = await userService.getUsers({ ROLE: role });
  }
  const conditions = {
    TYPE: req.type,
    ...(area && { AREA: area }),
    ...(district && { DISTRICT: district }),
    ...(company && { COMPANY: company }),
    ...(unit && { UNIT: unit }),
    ...(date && { ...rangeDateConditions({}, date) }),
    ...(report_type && { "REPORT_TYPE.GUID": report_type }),
    ...(group_report_type && {
      ...buildGroupReportTypeCondition(reportTypes, group_report_type)
    }),
    ...(role && {
      ...buildUsersWithRoleCondition(users, role)
    })
  };

  const dataToPass = {
    page,
    minified,
    totalAttendance,
    perPage,
    conditions
  };

  res.locals = dataToPass;

  next();
};

const getPartialSupervisorReports = async (req, res, next) => {
  const page = req.query.page || 1;
  const minified = req.query.minified === "true";
  const totalAttendance = req.query.total_attendance === "true";
  const { report_type, group_report_type, date } = req.query;
  const reportTypes = await reportTypeService.getReportTypes();
  const perPage = 10;
  const { company, unit } = req.params;
  const conditions = {
    ...(unit && { UNIT: unit }),
    ...(date && { ...rangeDateConditions({}, date) }),
    ...(report_type && { "REPORT_TYPE.GUID": report_type }),
    ...(group_report_type && {
      ...buildGroupReportTypeCondition(reportTypes, group_report_type)
    })
  };

  if (company === undefined) {
    conditions["$or"] = buildCompaniesCondition(req.companies, false);
  } else {
    conditions.COMPANY = company;
  }

  const dataToPass = {
    page,
    minified,
    totalAttendance,
    perPage,
    conditions
  };

  res.locals = dataToPass;

  next();
};

const getReports = async (req, res) => {
  const { page, minified, totalAttendance, perPage, conditions } = res.locals;

  try {
    if (totalAttendance) {
      const totalAttendances = await reportService.getTotalAttendance(
        conditions
      );
      response = { ...requestResponse.success, data: totalAttendances };
    } else {
      const additionalConditions = { page, minified, perPage };
      const projection = minified
        ? { _id: true, LAT: true, LONG: true }
        : { LOCAL_IMAGE: false, GUID: false, UNIT: false };

      const reports = await reportService.getReports(
        conditions,
        projection,
        additionalConditions
      );
      const totalData = await reportService.countReports(conditions);

      response = {
        ...requestResponse.success,
        data: {
          reports: reports,
          number_of_pages: Math.ceil((totalData / perPage) * 1) / 1
        }
      };
    }
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const exportCompanyReports = async (req, res) => {
  try {
    const conditions = {
      COMPANY: req.company,
      UNIT: req.params.unit,
      ...rangeDateConditions({}, req.query.date)
    };

    const filename = await reportService.exportCompanyReports(
      conditions,
      req.query.date
    );
    response = { ...requestResponse.success, data: { filename } };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const exportPartialSupervisorReports = async (req, res) => {
  try {
    const { company, unit } = req.params;
    const conditions = {
      COMPANY: company,
      UNIT: unit,
      ...rangeDateConditions({}, req.query.date)
    };

    const filename = await reportService.exportCompanyReports(
      conditions,
      req.query.date
    );
    response = { ...requestResponse.success, data: { filename } };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const exportHierarchicalReports = async (req, res) => {
  try {
    const { area, district, company, unit } = req.params;
    const conditions = {
      AREA: area,
      DISTRICT: district,
      COMPANY: company,
      UNIT: unit,
      TYPE: req.type,
      ...rangeDateConditions({}, req.query.date)
    };

    const filename = await reportService.exportCompanyReports(
      conditions,
      req.query.date
    );
    response = { ...requestResponse.success, data: { filename } };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getReportById = async (req, res) => {
  try {
    const conditions = {
      _id: new ObjectId(req.params.reportId),
      ...(req.company && { COMPANY: req.company }),
      ...(req.type && { TYPE: req.type }),
      ...(req.companies && {
        $or: buildCompaniesCondition(req.companies, false)
      })
    };
    const report = await Report.findOne(conditions, {
      GUID: false,
      UNIT: false,
      STATUS: false,
      COMPANY: false,
      AREA: false,
      DISTRICT: false,
      LOCAL_IMAGE: false
    });
    response = { ...requestResponse.success, data: report };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getReportTypes = async (req, res) => {
  try {
    const { role, type = "report" } = req.query;
    const condition = {
      APP_TYPE: req.type,
      TYPE: type,
      ...(role && {
        ROLE: role
      })
    };
    const reportTypes = await reportTypeService.getReportTypes(condition);

    response = { ...requestResponse.success, data: reportTypes };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const updateReportStatus = async (req, res) => {
  const { reportId } = req.params;
  const { report_status: REPORT_STATUS } = req.body;

  try {
    const conditions = {
      _id: reportId
    };

    const report = await reportService.updateStatusReport(conditions, {
      REPORT_STATUS
    });

    response = { ...requestResponse.success, data: report };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }
  res.status(response.code).json(response);
};

module.exports = {
  createReport,
  show,
  updateReportStatus,
  getCompanyReports,
  getHierarchicalReports,
  exportCompanyReports,
  exportHierarchicalReports,
  exportPartialSupervisorReports,
  getPartialSupervisorReports,
  getReportById,
  getReports,
  getReportTypes
};
