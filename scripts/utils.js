const fs = require('fs');
const sh = require('shelljs');
const _ = require('lodash');

function isUpperCase(letter) {
  return letter.toUpperCase() === letter;
}
function fileExists(path) {
  return sh.test('-f', path);
}
function dirExists(path) {
  return sh.test('-d', path);
}
function ensureDir(path) {
  if (!dirExists(path)) sh.mkdir('-p', path);
}
function fileNameFromPath(path) {
  return _.last(path.split('/'));
}
function stripFileExtension(fileName) {
  return _.dropRight(fileName.split('.')).join('.');
}

module.exports = {
  isUpperCase,
  fileExists,
  dirExists,
  ensureDir,
  fileNameFromPath,
  stripFileExtension,
};
