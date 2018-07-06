// Run eslint as part of our tests
// credits to https://robots.thoughtbot.com/testing-your-style-with-eslint-and-mocha

import { assert } from "chai";
import { CLIEngine } from "eslint";
import glob from "glob";

const srcPaths = glob.sync("./src/*.js");
const testPaths = glob.sync("./tests/*.js");
const docPaths = glob.sync("./docs/src/*.js");
const engine = new CLIEngine({
  envs: ["node", "mocha"],
  useEslintrc: true
});

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
