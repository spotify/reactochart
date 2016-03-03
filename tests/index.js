//require('./spec/resolveObjectProps.spec');
require('./spec/resolveXYScales.spec');

//require('./spec/LineChart.spec');
//require('./spec/XYPlot.spec');
//
//require('./spec/examples.spec');

// run mocha
(function() {
    if (window.mochaPhantomJS) {
        mochaPhantomJS.run();
    } else {
        mocha.run();
    }
})();
