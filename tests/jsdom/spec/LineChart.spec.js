import React from 'react';
import * as d3 from 'd3';

import {expect} from 'chai';
import {mount, shallow} from 'enzyme';

import {XYPlot, LineChart} from '../../../src/index.js';

const getXYArrayValue = { // accessors for (X, Y) data from simple arrays that look like [[x, y], [x, y]]
  x: d => d[0],
  y: d => d[1]
};

describe('LineChart', () => {
  const linearYScale = d3.scaleLinear().domain([0, 1]).range([100, 0]);

  it('renders a line with number X & Y scales', () => {
    // make simple number-number line chart with 3 datapoints
    const props = {
      scale: {
        x: d3.scaleLinear().domain([0, 2]).range([0, 100]),
        y: linearYScale
      },
      data: [[0, 0.5], [1, 1], [2, 0.25]],
      getX: 0,
      getY: 1
    };

    // ensure line is drawn as expected
    var chart = mount(<LineChart {...props} />);
    var path = chart.find('path');
    const pathData = path.getNode().getAttribute('d');
    expect(pathData).to.equal('M 0 50 L 50 0 L 100 75');
  });

  it('renders a line with time X scale and number Y scale', () => {
    // make simple number-time line chart with 3 datapoints
    const props = {
      scale: {
        x: d3.scaleTime().range([0,100])
          .domain([new Date('2015-01-01T00:00:00.000Z'), new Date('2015-01-03T00:00:00.000Z')]),
        y: linearYScale
      },
      data: [
        [new Date('2015-01-01T00:00:00.000Z'), 0.5],
        [new Date('2015-01-02T00:00:00.000Z'), 1],
        [new Date('2015-01-03T00:00:00.000Z'), 0.25]
      ],
      getX: 0,
      getY: 1
    };

    // ensure line is drawn as expected
    var chart = mount(<LineChart {...props} />);
    var path = chart.find('path');
    const pathData = path.getNode().getAttribute('d');
    expect(pathData).to.equal('M 0 50 L 50 0 L 100 75');
  });

  it('renders a line with ordinal X scale and number Y scale', () => {
    // make simple number-time line chart with 3 datapoints
    const props = {
      scale: {
        x: d3.scalePoint().domain(['a','b','c']).range([0,100]),
        y: linearYScale
      },
      data: [['a', 0.5], ['b', 1], ['c', 0.25]],
      getX: 0,
      getY: 1
    };

    // ensure line is drawn as expected
    var chart = mount(<LineChart {...props} />);
    var path = chart.find('path');
    const pathData = path.getNode().getAttribute('d');
    expect(pathData).to.equal('M 0 50 L 50 0 L 100 75');
  });

  it('renders a line chart within an XYPlot', () => {
    const xyProps = {width: 100, height: 100};
    const lineProps = {
      getValue: getXYArrayValue,
      data: [[0, 0.5], [1, 1], [2, 0.25]]
    };

    var chart = mount(
      <XYPlot {...xyProps}>
          <LineChart {...lineProps} />
      </XYPlot>
    );
    var path = chart.find('path');
    const pathData = path.getNode().getAttribute('d');
  })
});