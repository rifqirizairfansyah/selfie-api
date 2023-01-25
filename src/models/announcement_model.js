const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    GUID: String,
    COMPANY_GUID: String,
    ROLE: String,
    TITLE: String,
    DESCRIPTION: String,
    CREATED_AT: Date
  },
  {
    versionKey: false,
    collection: "announcements"
  }
);

module.exports = mongoose.model("announcements", AnnouncementSchema);
