const { logger, requestResponse } = require("@pptik/galileo");
const announcementService = require("../services/announcement_service");
const { v4 } = require("uuid");

let response;

const create = async (req, res) => {
  const { title: TITLE, description: DESCRIPTION, role: ROLE } = req.body;
  try {
    await announcementService.create({
      GUID: v4(),
      COMPANY_GUID: req.company,
      TITLE,
      DESCRIPTION,
      ROLE,
      CREATED_AT: new Date()
    });

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const get = async (req, res) => {
  try {
    const announcements = await announcementService.get({
      COMPANY_GUID: req.company
    });

    response = { ...requestResponse.success, data: announcements };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const find = async (req, res) => {
  const { id } = req.params;
  try {
    const announcement = await announcementService.find({
      GUID: id
    });

    response = { ...requestResponse.success, data: announcement };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { title: TITLE, description: DESCRIPTION, role: ROLE } = req.body;
  try {
    await announcementService.update(id, {
      TITLE,
      DESCRIPTION,
      ROLE
    });

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);

    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const deleteData = async (req, res) => {
  const { id } = req.params;
  try {
    await announcementService.deleteData(id);

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const userAnnouncement = async (req, res) => {
  const { company_guid, role } = req.params;
  try {
    const announcements = await announcementService.get({
      COMPANY_GUID: company_guid,
      ROLE: role
    });

    response = { ...requestResponse.success, data: announcements };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

module.exports = {
  create,
  get,
  find,
  update,
  deleteData,
  userAnnouncement
};
