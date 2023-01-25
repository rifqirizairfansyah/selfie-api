const fs = require("fs");
const util = require("util");
const copyFile = util.promisify(fs.copyFile);

/**
 * @function moveFile
 * Move a file to the new destination
 * @param {String} oldPath
 * @param {String} newPath
 * @returns {Promise<void>}
 */
const moveFile = async (oldPath, newPath) => {
  await copyFile(oldPath, newPath);
};

/**
 * @function getFileExtension
 * Get an extension of a given file name
 * @param {String} fileName
 * @returns {String}
 */
const getFileExtension = (fileName) => {
  return fileName.split(".").pop();
};

module.exports = {
  moveFile,
  getFileExtension
};
