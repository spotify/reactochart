const fs = require('fs');
const sh = require('shelljs');
const _ = require('lodash');

const {
  isUpperCase,
  fileExists,
  dirExists,
  ensureDir,
  fileNameFromPath,
  stripFileExtension,
} = require('./utils');

const lessonsDirPath = `${__dirname}/../docs/src/lessons`;
const lessonTemplatePath = `${__dirname}/../docs/src/templates/Lesson.js.template`;
const exampleTemplatePath = `${__dirname}/../docs/src/templates/ComponentExample.js.template`;

if (process.argv.length <= 2) {
  console.log(`Usage: ${__filename} LESSON_NAME`);
  process.exit(-1);
}

const lessonName = process.argv[2];
console.log(lessonName);

const componentName = lessonName
  .split(' ')
  .map(_.capitalize)
  .join('');
console.log('componentName', componentName);
const lessonDirPath = `${lessonsDirPath}/${componentName}`;
const lessonComponentPath = `${lessonDirPath}/${componentName}Lesson.js`;

ensureDir(lessonsDirPath);
ensureDir(lessonDirPath);
if (!fileExists(lessonComponentPath)) {
  // use template file to generate a stub example page for this component
  const lessonTemplate = _.template(sh.cat(lessonTemplatePath).toString());
  const lessonStub = lessonTemplate({ name: lessonName, componentName });
  fs.writeFile(lessonComponentPath, lessonStub, err => {
    if (err) throw err;
    console.log('created stub lesson component:', lessonComponentPath);
  });

  const examplesDirPath = `${lessonDirPath}/examples`;
  const examplePath = `${examplesDirPath}/${componentName}.js.example`;

  // use template to generate stub example file, to be used for live preview (using component-playground)
  const exampleTemplate = _.template(sh.cat(exampleTemplatePath).toString());
  const exampleStub = exampleTemplate({ componentName });
  ensureDir(examplesDirPath);
  fs.writeFile(examplePath, exampleStub, err => {
    if (err) throw err;
    console.log('created stub example:', examplePath);
  });
}
