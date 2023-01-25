const { logger, requestResponse } = require("@pptik/galileo");
const taskService = require("../services/task_service");
const { v4 } = require("uuid");

let response;

const create = async (req, res) => {
  const {
    user_guid: USER_GUID,
    title: TITLE,
    description: DESCRIPTION,
    generated_at: GENERATED_AT,
    due_at: DUE_AT
  } = req.body;
  try {
    await taskService.create({
      GUID: v4(),
      COMPANY_GUID: req.company,
      USER_GUID,
      TITLE,
      DESCRIPTION,
      GENERATED_AT,
      DUE_AT
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
    const tasks = await taskService.get({
      COMPANY_GUID: req.company
    });

    response = { ...requestResponse.success, data: tasks };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const getUserTasks = async (req, res) => {
  const { guid } = req.params;
  try {
    const tasks = await taskService.get({
      USER_GUID: guid
    });

    response = { ...requestResponse.success, data: tasks };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const find = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await taskService.find({
      GUID: id
    });

    response = { ...requestResponse.success, data: task };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

const update = async (req, res) => {
  const { id } = req.params;
  const {
    user_guid: USER_GUID,
    title: TITLE,
    description: DESCRIPTION,
    generated_at: GENERATED_AT,
    due_at: DUE_AT
  } = req.body;
  try {
    await taskService.update(id, {
      USER_GUID,
      TITLE,
      DESCRIPTION,
      GENERATED_AT,
      DUE_AT
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
    await taskService.deleteData(id);

    response = { ...requestResponse.success };
  } catch (error) {
    logger.error(error);
    response = { ...requestResponse.server_error };
  }

  res.status(response.code).json(response);
};

module.exports = {
  create,
  get,
  getUserTasks,
  find,
  update,
  deleteData
};
