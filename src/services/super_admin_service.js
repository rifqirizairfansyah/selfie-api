const Admin = require("../models/admin_model");
const Company = require("../models/company_model");
const bcrypt = require("bcrypt");

const countCompanies = (conditions) => {
  return Company.find(conditions).countDocuments();
};

const getCompanies = (
  conditions = {},
  projection = { _id: false, COMPANY_NAME: true, COMPANY_GUID: true, COMPANY_CODE: true, COMPANY_AREA: true, COMPANY_DISTRICT: true },
  additionalConditions = { perPage: 0, page: 0, sortBy: -1 }
) => {
  if (additionalConditions.perPage === 0) {
    return Company.find(conditions, { _id: false, COMPANY_NAME: true, COMPANY_GUID: true, COMPANY_CODE: true, COMPANY_AREA: true, COMPANY_DISTRICT: true }).lean();
  }
  return Company.find(conditions, projection)
    .skip((additionalConditions.page - 1) * additionalConditions.perPage)
    .limit(additionalConditions.perPage)
    .lean()
    .sort({ _id: additionalConditions.sortBy });
};

const updateCompany = (id, field) => {
  return Company.updateOne({ COMPANY_GUID: id }, { $set: field });
};

const deleteCompany = (id) => {
  return Company.deleteOne({ COMPANY_GUID: id });
};

const resetPasswordAdmin = async (id) => {
  const newPassword = "12345678";
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  return Admin.updateOne(
    { COMPANY: id },
    { $set: { PASSWORD: hashedPassword } }
  );
};

const deleteAdmin = (id) => {
  return Admin.deleteOne({ COMPANY: id });
};

module.exports = {
  getCompanies,
  countCompanies,
  updateCompany,
  deleteCompany,
  resetPasswordAdmin,
  deleteAdmin
};
