const Unit = require("../models/unit_model");

const create = (data) => {
  return Unit.insertMany(data);
};

const find = (condition, parameters) => {
  return Unit.findOne(condition, parameters);
};

module.exports = {
  create,
  find
};
