const Task = require("../models/task_model");

const create = ({
  GUID,
  USER_GUID,
  COMPANY_GUID,
  TITLE,
  DESCRIPTION,
  GENERATED_AT,
  DUE_AT
}) => {
  return Task.create({
    GUID,
    USER_GUID,
    COMPANY_GUID,
    TITLE,
    DESCRIPTION,
    GENERATED_AT,
    DUE_AT
  });
};

const get = (condition) => {
  return Task.find(condition, {
    COMPANY_GUID: false
  }).populate("USER", {
    _id: false,
    NAME: true
  });
};

const find = (condition) => {
  return Task.findOne(condition, {
    COMPANY_GUID: false
  }).populate("USER", {
    _id: false,
    NAME: true
  });
};

const update = (id, field) => {
  return Task.updateOne({ GUID: id }, { $set: field });
};

const deleteData = (id) => {
  return Task.deleteOne({ GUID: id });
};

module.exports = {
  create,
  get,
  find,
  update,
  deleteData
};
