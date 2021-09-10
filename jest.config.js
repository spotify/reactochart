const dontTranspiledThese = ['internmap', 'delaunator', 'robust-predicates'];
const dontTranspile = dontTranspiledThese.join('|');

const config = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  setupFiles: ['<rootDir>/tests/jsdom/setup.js'],
  setupFilesAfterEnv: ['./node_modules/jest-enzyme/lib/index.js'],
  transformIgnorePatterns: [
    `[/\\\\]node_modules[/\\\\]((?!(?<=[/\\\\])(d3-?|${dontTranspile})).)+\\.(js|jsx|ts|tsx)$`,
  ],
};

module.exports = config;
