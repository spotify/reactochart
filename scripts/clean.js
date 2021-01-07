const fs = require('fs');
const sh = require('shelljs');

const { fileExists, dirExists } = require('./utils');

const srcContents = sh.ls('src');

// We don't want to commit built files, so it is useful to have a `clean` script which deletes them if they exist.
// However, Reactochart is built in the root directory
// (so that modules may be required with eg. `require('reactochart/LineChart')`).
// This makes cleanup harder than simply deleting a `build` directory.
// Instead this looks for any files in the root directory which match the name of a file in the `src` directory,
// and deletes them if they exist.
// Sounds dangerous, but any files in root which share a name with src would have been overwritten by the build anyway.

srcContents.forEach(fileOrDir => {
  if (fileExists(`src/${fileOrDir}`) && fileExists(`./${fileOrDir}`)) {
    console.log(`deleting file ./${fileOrDir}`);
    sh.rm(`./${fileOrDir}`);
  } else if (dirExists(`src/${fileOrDir}`) && dirExists(fileOrDir)) {
    console.log(`deleting directory ./${fileOrDir}`);
    sh.rm('-rf', `./${fileOrDir}`);
  }
  // check for source maps too
  if (fileExists(`./${fileOrDir}.map`)) {
    console.log(`deleting file ./${fileOrDir}.map`);
    sh.rm(`./${fileOrDir}.map`);
  }
});

// Clean compiled css file
if (fileExists('./styles.css')) {
  sh.rm('./styles.css');
}
