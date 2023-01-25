const Company = require("../models/company_model");
const CompanyProfile = require("../models/company_profile_model");
const Unit = require("../models/unit_model");
const { buildCompaniesCondition } = require("../utils");
const { requestResponse } = require("../utils");

let response;
/**
 * @function findCompanyByCode
 * Find company document in database by its company code
 * @param {String} company_name
 * @param {String} company_guid
 * @param {String} company_code
 * @param {String} app_type
 * @param {String} company_area
 * @param {String} company_district
 * @param {Array} unit
 * @returns {Promise<Document>}
 */
const createCompany = async ({ company_name, company_guid, company_code, app_type, company_area, company_district, units }) => {
  const company = await Company.findOne({ COMPANY_NAME: company_name }, {}, { lean: true });

  if (company !== null) {
    response = { ...requestResponse.server_error };
    response.message = "Company already registered.";

    return response;
  }

  await Company.create({
    COMPANY_NAME: company_name,
    COMPANY_GUID: company_guid,
    COMPANY_UNITS: [],
    COMPANY_CODE: company_code,
    COMPANY_TYPE: app_type,
    COMPANY_AREA: company_area,
    COMPANY_DISTRICT: company_district
  });

  await Unit.insertMany(units.map(unit => ({ COMPANY_GUID: company_guid, COMPANY_CODE: company_code, ...unit })));
  return { ...requestResponse.success };
};

/**
 * @function findCompanyByCode
 * Find company document in database by its company code
 * @param {String} code
 * @returns {Promise<Document>}
 */
const findCompanyByCode = (code) => {
  return Company.findOne({ COMPANY_CODE: code.toUpperCase() });
};

/**
 * @function findCompanyByGuid
 * Find company document in database by its company GUID
 * @param {String} guid
 * @returns {Promise<boolean|{type: String }>}
 */
const findCompanyByGuid = (guid) => {
  return Company.findOne({ COMPANY_GUID: guid }, { _id: false });
};

/**
 * @function findCompanyByName
 * Find company document in database by its company Name
 * @param {String} name
 * @returns {Promise<boolean|{type: String }>}
 */
const findCompanyByName = (name) => {
  return Company.findOne({ COMPANY_NAME: name }, { _id: false });
};

/**
 * @function getCompaniesByDistrict
 * Get companies in database by type, area, and district supplied
 * @param {String} type
 * @param {String} area
 * @param {String} district
 * @returns {Promise<Array>}
 */
const getCompaniesByDistrict = async ({ type, area, district }) => {
  const companies = await Company.find(
    {
      COMPANY_TYPE: type,
      COMPANY_AREA: area,
      COMPANY_DISTRICT: district
    },
    { _id: false, COMPANY_NAME: true, COMPANY_GUID: true }
  );

  return companies;
};

/**
 * @function getCompanyUnits
 * Find company units by its GUID
 * @param {String} companyGuid
 * @param {Boolean} isActive
 * @returns {Promise<Array>}
 */
const getCompanyUnits = async (companyGuid, isActive = true) => {
  const units = await Unit.find(
    { COMPANY_GUID: companyGuid, IS_ACTIVE: isActive },
    { _id: false, NAME: true }
  ).lean();
  const flattenUnits = units.map(({ NAME }) => NAME);

  return flattenUnits;
};

/**
 * @function getCompanyUnitObject
 * Find company units json by its GUID
 * @param {String} companyGuid
 * @param {Boolean} isActive
 * @returns {Promise<Array>}
 */
const getCompanyUnitObject = async (companyGuid, isActive = true) => {
  const units = await Unit.find(
    { COMPANY_GUID: companyGuid, IS_ACTIVE: isActive }
  ).lean();

  return units;
};

/**
 * @function deactiveCompanyUnits
 * Find company units json by its GUID
 * @param {String} companyGuid
 * @param {Boolean} isActive
 * @returns {Promise<Array>}
 */
const deactiveCompanyUnits = async (form) => {
  const units = await Unit.updateOne({ _id: form.id },
    {
      $set: {
        IS_ACTIVE: false
      }
    }
  );
  return units;
};

/**
 * @function createAdminUnits
 * create company unit by company guid
 * @param {String} form
 * @param {Boolean} isActive
 * @returns {Promise<Array>}
 */
const createCompanyUnits = async (form, isActive = true) => {
  await Unit.create(
    { NAME: form.name, COMPANY_GUID: form.companyGuid, COMPANY_CODE: form.companyCode, IS_ACTIVE: isActive }
  );
};

/**
 * @function updateCompanyUnits
 * create company unit by company guid
 * @param {JSON} form
 * @returns {Promise<Array>}
 */
const updateCompanyUnits = async (form) => {
  await Unit.updateOne(
    { _id: form.id },
    {
      $set: {
        NAME: form.name
      }
    }
  );
};

/**
 * @function getCompanies
 * Get a list of companies document by its GUID
 * @param {Array} userCompanies
 * @returns {Promise<any>}
 */
const getCompanies = async ({
  user_companies: userCompanies,
  app_type: appType
}) => {
  const companies = await Company.find(
    {
      ...(userCompanies && { $or: buildCompaniesCondition(userCompanies) }),
      COMPANY_TYPE: appType
    },
    { _id: false, COMPANY_NAME: true, COMPANY_GUID: true }
  );

  return companies;
};


/**
 * @function getCompanyUnits
 * Find company units by its code
 * @param {String} companyCode
 * @returns {Promise<Array>}
 */
const getCompanyUnitsByCode = async (companyCode, isActive = true) => {
  const units = await Unit.find(
    { COMPANY_CODE: companyCode, IS_ACTIVE: isActive },
    { _id: false, NAME: true }
  ).lean();
  const flattenUnits = units.map(({ NAME }) => NAME);

  return flattenUnits;
};

/**
 * @function disableCurrentActiveUnits
 * Disable current active units by its company GUID
 * @param {String} companyGuid
 */
const disableCurrentActiveUnits = (companyGuid) =>
  Unit.updateMany(
    { COMPANY_GUID: companyGuid, NAME: /(2020\/2021)/, IS_ACTIVE: true },
    { $set: { IS_ACTIVE: false } }
  );

/**
 * @function migrateUnits
 * Migrate old units.
 * I'm not pretty sure about the 2020/2021 migration. It should be dynamic, either using a configuration file
 * or store them in the database.
 *
 * Update 2020-08-13: So I update the regex to hardcoded due to pptik/absensi-selfie-api#31 (again, duh!).
 * Still can't find out how to solve this.
 * @todo Make the migrated value more dynamic
 * @todo Make the regex more dynamic
 * @param {String} companyGuid
 */
const migrateUnits = async (companyGuid) => {
  const units = await Unit.find(
    { COMPANY_GUID: companyGuid, NAME: /(2020\/2021)/, IS_ACTIVE: true },
    { _id: false }
  ).lean();
  const replaceUnits = units.map(({ COMPANY_GUID, NAME, COMPANY_CODE }) => {
    return {
      COMPANY_GUID: COMPANY_GUID,
      NAME: NAME.replace(/(2020\/2021)/, "2021/2022"),
      COMPANY_CODE: COMPANY_CODE,
      IS_ACTIVE: true
    };
  });

  await Unit.insertMany(replaceUnits);
  await disableCurrentActiveUnits(companyGuid);
};

const updateCompanyProfile = (data) => {
  return CompanyProfile.updateOne(
    { COMPANY_GUID: data.company },
    {
      COMPANY_GUID: data.company,
      NAME: data.name,
      REGISTRANT_NAME: data.registrant_name,
      PHONE: data.phone,
      DESCRIPTION: data.description,
      SLUG: data.slug,
      INSTITUTION: data.institution,
      ...(data.image && {
        IMAGE: data.image
      })
    },
    { upsert: true }
  );
};

const createCompanyProfile = (data) => {
  return CompanyProfile.create(
    {
      COMPANY_GUID: data.company,
      NAME: data.name,
      REGISTRANT_NAME: data.registrant_name,
      PHONE: data.phone,
      DESCRIPTION: data.description,
      SLUG: data.slug,
      INSTITUTION: data.institution,
      ...(data.image && {
        IMAGE: data.image
      })
    }
  );
};

const getCompanyProfileByCompanyGuid = (companyGuid) => {
  return CompanyProfile.findOne(
    { COMPANY_GUID: companyGuid },
    { _id: false, GUID: false }
  );
};

const getCompanyByCompanyGuid = (companyGuid) => {
  return Company.findOne(
    { COMPANY_GUID: companyGuid },
    { _id: false, COMPANY_GUID: false }
  );
};

module.exports = {
  createCompany,
  createCompanyProfile,
  createCompanyUnits,
  updateCompanyUnits,
  deactiveCompanyUnits,
  findCompanyByCode,
  findCompanyByGuid,
  findCompanyByName,
  getCompaniesByDistrict,
  getCompanyUnits,
  getCompanyUnitObject,
  getCompanyByCompanyGuid,
  getCompanies,
  getCompanyUnitsByCode,
  migrateUnits,
  updateCompanyProfile,
  getCompanyProfileByCompanyGuid
};
