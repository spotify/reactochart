require('./spec/XAxis.spec');
require('./spec/YAxis.spec');
require('./spec/YAxisLabels.spec');
require('./spec/XAxisLabels.spec');
require('./spec/XAxisTitle.spec');
require('./spec/YAxisTitle.spec');
const enzyme = require('enzyme');
const adapter = require('enzyme-adapter-react-16');

// some tests must be run in a browser environment
// also it can be easier to debug tests in browser thanks to chrome debugger
// place browser tests in tests/browser/spec and run `npm run test-browser`

// run mocha
(function() {
  enzyme.configure({ adapter: new adapter() });

  if (window.mochaPhantomJS) {
    mochaPhantomJS.run();
  } else {
    mocha.run();
  }
})();
