import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import d3 from 'd3';

import {expect} from 'chai';

import {XYPlot, LineChart} from '../../src/index.js';

const getXYArrayValue = { // accessors for (X, Y) data from simple arrays that look like [[x, y], [x, y]]
    x: d => d[0],
    y: d => d[1]
};

describe('XYPlot', () => {
    it('renders SVG with given width & height (or a default)', () => {
        const chart = TestUtils.renderIntoDocument(<XYPlot width={600} height={800} />);
        const node = TestUtils.findRenderedDOMComponentWithTag(chart, 'svg');
        expect(node.tagName.toLowerCase()).to.equal('svg');
        expect(node.getAttribute('width')).to.equal('600');
        expect(node.getAttribute('height')).to.equal('800');

        const chart2 = TestUtils.renderIntoDocument(<XYPlot />);
        const node2 = TestUtils.findRenderedDOMComponentWithTag(chart2, 'svg');
        expect(node2.tagName.toLowerCase()).to.equal('svg');
        expect(parseInt(node2.getAttribute('width'))).to.be.a('number').and.to.be.above(0);
        expect(parseInt(node2.getAttribute('height'))).to.be.a('number').and.to.be.above(0);
    });

    it('renders inner chart area with given margin', () => {
        const size = 400;
        const margin = {top: 10, bottom: 20, left: 30, right: 40};
        const chart = TestUtils.renderIntoDocument(<XYPlot width={size} height={size} margin={margin} />);
        const inner = TestUtils.findRenderedDOMComponentWithClass(chart, 'chart-inner');
        const bg = TestUtils.findRenderedDOMComponentWithClass(chart, 'chart-background');
        expect(inner.getAttribute('transform').replace(/\s/, ''))
            .to.contain(`translate(${margin.left},${margin.top})`);
        expect(parseInt(bg.getAttribute('width'))).to.equal(size - (margin.left + margin.right));
        expect(parseInt(bg.getAttribute('height'))).to.equal(size - (margin.top + margin.bottom));
    });

    it('creates a top/bottom/left/right object from single value, if object is not given for directional props', () => {
        const size = 400;
        const margin = 50;
        const chart = TestUtils.renderIntoDocument(<XYPlot width={size} height={size} margin={margin} />);
        const inner = TestUtils.findRenderedDOMComponentWithClass(chart, 'chart-inner');
        const bg = TestUtils.findRenderedDOMComponentWithClass(chart, 'chart-background');
        expect(inner.getAttribute('transform').replace(/\s/, ''))
            .to.contain(`translate(${margin},${margin})`);
        expect(parseInt(bg.getAttribute('width'))).to.equal(size - (margin + margin));
        expect(parseInt(bg.getAttribute('height'))).to.equal(size - (margin + margin));
    });

    /*
     spacing: PropTypes.fourDirections,

     // axis types - number, time or ordinal
     axisType: PropTypes.xyObjectOf(PropTypes.axisType),
     // scale domains may be provided, otherwise will be inferred from data
     domain: PropTypes.xyObjectOf(PropTypes.dataArray),
     // whether or not to extend the scales to end on nice values (see docs for d3 scale.linear.nice())
     nice: PropTypes.xyObjectOf(PropTypes.bool),

     // approximate # of ticks to include on each axis - 10 is default
     // (actual # may be slightly different, to get nicest intervals)
     tickCount: PropTypes.xyObjectOf(PropTypes.number),
     // or alternatively, you can pass an array of the exact tick values to use on each axis
     ticks: PropTypes.xyObjectOf(PropTypes.dataArray),
     // size of axis ticks
     tickLength: PropTypes.xyObjectOf(PropTypes.number),

     // axis value labels will be created for each tick, unless you specify a different list of values to label
     labelValues: PropTypes.xyObjectOf(PropTypes.dataArray),
     // format to use for the axis value labels. can be a function or a string.
     // if function, called on each label.
     // if string, interpreted as momentjs formats for time axes, or numeraljs formats for number axes
     labelFormat: PropTypes.xyObjectOf(PropTypes.stringFormatter),
     // padding between axis value labels and the axis/ticks
     labelPadding: PropTypes.xyObjectOf(PropTypes.number),

     // should we draw axis value labels
     showLabels: PropTypes.xyObjectOf(PropTypes.bool),
     // should we draw the grid lines in the main chart space
     showGrid: PropTypes.xyObjectOf(PropTypes.bool),
     // should we draw the little tick lines along the axis
     showTicks: PropTypes.xyObjectOf(PropTypes.bool),
     // should we draw a line showing where zero is
     showZero: PropTypes.xyObjectOf(PropTypes.bool),

     //
     axisLabel: PropTypes.xyObjectOf(PropTypes.string),
     axisLabelAlign: PropTypes.xyObjectOf(PropTypes.shape({
     horizontal: PropTypes.oneOf(['left', 'center', 'right']),
     vertical: PropTypes.oneOf(['top', 'bottom'])
     })),
     axisLabelPadding: PropTypes.xyObjectOf(PropTypes.number),

     // todo more interaction
     onMouseMove: PropTypes.func,
     onMouseEnter: PropTypes.func,
     onMouseLeave: PropTypes.func
     */

});
