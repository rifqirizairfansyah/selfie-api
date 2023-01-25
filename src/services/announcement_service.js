const format = require("date-fns-tz/format");
const Announcement = require("../models/announcement_model");
const amqp = require("../message_brokers/amqp");
const companyService = require("../services/company_service");

const create = async (field) => {
  const company = await companyService.findCompanyByGuid(field.COMPANY_GUID);
  const routingKey = `${company.COMPANY_TYPE}.${field.COMPANY_GUID}.${field.ROLE}`;
  const message = `${field.TITLE}#${field.DESCRIPTION}#${format(
    field.CREATED_AT,
    "dd-MM-yyy",
    { timeZone: "Aia/Jakarta" }
  )}#${format(field.CREATED_AT, "HH:mm:ss", {
    timeZone: "Aia/Jakarta"
  })}`;
  amqp.publish(routingKey, message);
  return Announcement.create(field);
};

const get = (condition) => {
  return Announcement.find(condition);
};

const find = (condition) => {
  return Announcement.findOne(condition);
};

const update = (id, field) => {
  return Announcement.updateOne({ GUID: id }, { $set: field });
};

const deleteData = (id) => {
  return Announcement.deleteOne({ GUID: id });
};

module.exports = {
  create,
  get,
  find,
  update,
  deleteData
};
