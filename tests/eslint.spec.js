// Run eslint as part of our tests
// credits to https://robots.thoughtbot.com/testing-your-style-with-eslint-and-mocha

import { assert } from "chai";
import { CLIEngine } from "eslint";
import glob from "glob";

const srcPaths = glob.sync("./src/*.js");
<<<<<<< HEAD
const testPaths = glob.sync("./tests/jsdom/spec/*.js");
=======
const testPaths = glob.sync("./tests/*.js");
const docPaths = glob.sync("./docs/src/*.js");
>>>>>>> a1a2f8c323fcb23541086db024b8031a80b12b99
const engine = new CLIEngine({
  envs: ["node", "mocha"],
  useEslintrc: true
});

<<<<<<< HEAD
const srcResults = engine.executeOnFiles(srcPaths).results;
const testResults = engine.executeOnFiles(testPaths).results;

const results = srcResults.concat(testResults);

=======
>>>>>>> a1a2f8c323fcb23541086db024b8031a80b12b99
describe("ESLint", () => {
  [srcPaths, testPaths, docPaths].forEach(path => {
    const results = engine.executeOnFiles(path).results;

    results.forEach(res => generateTest(res));
  });
});

function generateTest(result) {
  const { filePath, messages } = result;

  it(`validates ${filePath}`, function() {
    if (messages.length > 0) {
      assert.fail(false, true, formatMessages(messages));
    }
  });
}

function formatMessages(messages) {
  const errors = messages.map(message => {
    return `${message.line}:${message.column} ${message.message.slice(
      0,
      -1
    )} - ${message.ruleId}\n`;
  });

  return `\n${errors.join("")}`;
}
