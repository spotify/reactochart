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

const EXCLUDED_DOCGEN_FILES = ['TreeMapNode.js', 'TreeMapNodeLabel.js'];

const docsDirPath = `${__dirname}/../docs/src/docs`;
const docsPageTemplatePath = `${__dirname}/../docs/src/templates/ComponentDocsPage.js.template`;
const exampleTemplatePath = `${__dirname}/../docs/src/templates/ComponentExample.js.template`;

// generate a list of all JS files in `src` that start with an uppercase letter
// these are the components for which we will generate docs
const jsFilePaths = sh.ls(`${__dirname}/../src/*.js`);
const componentPaths = jsFilePaths.filter(
  path =>
    !EXCLUDED_DOCGEN_FILES.includes(fileNameFromPath(path)) &&
    isUpperCase(fileNameFromPath(path)[0]),
);

ensureDir(docsDirPath);
componentPaths.forEach(path => {
  const fileName = fileNameFromPath(path);
  const componentName = stripFileExtension(fileName);
  const componentDocsPath = `${docsDirPath}/${componentName}`;

  // use react-docgen to autogenerate prop docs json file from component src files
  ensureDir(componentDocsPath);
  console.log('Generating prop docs for', componentName);
  sh.exec(
    `react-docgen ${path} --pretty -o ${componentDocsPath}/propDocs.json`,
  );

  const docsPagePath = `${componentDocsPath}/${componentName}Docs.js`;
  const examplesDirPath = `${componentDocsPath}/examples`;
  const examplePath = `${examplesDirPath}/${componentName}.js.example`;

  if (!fileExists(docsPagePath)) {
    // use template file to generate a stub example page for this component
    const docsTemplate = _.template(sh.cat(docsPageTemplatePath).toString());
    const docsPageStub = docsTemplate({ componentName });
    fs.writeFile(docsPagePath, docsPageStub, err => {
      if (err) throw err;
      console.log('wrote to', docsPagePath);
    });

    // use template to generate stub example file, to be used for live preview (using component-playground)
    const exampleTemplate = _.template(sh.cat(exampleTemplatePath).toString());
    const exampleStub = exampleTemplate({ componentName });
    ensureDir(examplesDirPath);
    fs.writeFile(examplePath, exampleStub, err => {
      if (err) throw err;
      console.log('wrote to', examplePath);
    });
  }
});

// export all docs files from docs/index.js
const componentDocExports = componentPaths.map(componentPath => {
  const fileName = fileNameFromPath(componentPath);
  const componentName = stripFileExtension(fileName);
  return `export {default as ${componentName}Docs} from './${componentName}/${componentName}Docs';\n`;
});
fs.writeFile(`${docsDirPath}/index.js`, componentDocExports.join(''), err => {
  if (err) throw err;
  console.log('wrote exports');
});
