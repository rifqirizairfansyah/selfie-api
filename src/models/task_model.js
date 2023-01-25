const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    GUID: String,
    USER_GUID: String,
    COMPANY_GUID: String,
    TITLE: String,
    DESCRIPTION: String,
    GENERATED_AT: Date,
    DUE_AT: Date
  },
  {
    versionKey: false,
    collection: "tasks",
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
TaskSchema.virtual("USER", {
  ref: "users",
  localField: "USER_GUID",
  foreignField: "GUID"
});

module.exports = mongoose.model("tasks", TaskSchema);
