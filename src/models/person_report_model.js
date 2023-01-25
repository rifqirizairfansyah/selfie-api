const mongoose = require("mongoose");

function schema(guid) {
  const personSchema = new mongoose.Schema(
    {
      GUID: {
        type: String
      },
      ID_CARD: {
        type: String
      },
      PERSON_NAME: {
        type: String
      },
      UNIT: {
        type: String
      },
      REPORT: {}
    },
    {
      versionKey: false,
      collection: `${guid}_person`
    }
  );

  return mongoose.model(`${guid}_person`, personSchema);
}

module.exports = schema;
