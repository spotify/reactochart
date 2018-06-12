// Run eslint as part of our tests
// credits to https://robots.thoughtbot.com/testing-your-style-with-eslint-and-mocha

import glob from "glob";
import { CLIEngine } from "eslint";
import { expect, assert } from "chai";

const srcPaths = glob.sync("./src/*.js");
const testPaths = glob.sync("./tests/*.js");
const engine = new CLIEngine({
  envs: ["node", "mocha"],
  useEslintrc: true
});

const srcResults = engine.executeOnFiles(srcPaths).results;
const testResults = engine.executeOnFiles(testPaths).results;

const results = srcResults.concat(testResults);

describe("ESLint", () => {
  results.forEach(result => generateTest(result));
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
