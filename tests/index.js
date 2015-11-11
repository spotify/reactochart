
require('./spec/LineChart-test');
require('./spec/XYPlot-test');

// run mocha
(function() {
    if (window.mochaPhantomJS) {
        mochaPhantomJS.run();
    } else {
        mocha.run();
    }
})();