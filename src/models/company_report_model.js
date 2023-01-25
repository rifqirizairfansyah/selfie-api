const mongoose = require("mongoose");

function schema(guid) {
  const companySchema = new mongoose.Schema(
    {
      REPORT: {}
    },
    {
      versionKey: false,
      collection: `${guid}_company`
    }
  );

  return mongoose.model(`${guid}_company`, companySchema);
}

module.exports = schema;
