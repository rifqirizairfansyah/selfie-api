const mongoose = require("mongoose");

function schema(guid) {
  const unitSchema = new mongoose.Schema(
    {
      UNIT: {
        type: String
      },
      REPORT: {}
    },
    {
      versionKey: false,
      collection: `${guid}_unit`
    }
  );

  return mongoose.model(`${guid}_unit`, unitSchema);
}

module.exports = schema;
