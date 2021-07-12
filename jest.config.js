const config = {
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.js'
    ],
    setupFiles: [
        '<rootDir>/tests/jsdom/setup.js'
    ],
    setupFilesAfterEnv: [
        './node_modules/jest-enzyme/lib/index.js'
    ],
};

module.exports = config;