require('./spec/resolveObjectProps-test');

require('./spec/LineChart-test');
require('./spec/XYPlot-test');

require('./spec/examples-test');

// run mocha
(function() {
    if (window.mochaPhantomJS) {
        mochaPhantomJS.run();
    } else {
        mocha.run();
    }
})();
