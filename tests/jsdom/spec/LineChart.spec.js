import { expect } from 'chai';
import { scaleLinear, scaleTime, scalePoint } from 'd3-scale';
import { mount } from 'enzyme';
import React from 'react';
import { LineChart, XYPlot } from '../../../src/index.js';

describe('LineChart', () => {
  it('passes props correctly to group and path elements', () => {
    const props = {
      xScale: scaleLinear()
        .domain([0, 2])
        .range([0, 100]),
      yScale: scaleLinear()
        .domain([0, 1])
        .range([100, 0]),
      data: [[0, 0.5], [1, 1], [2, 0.25]],
      x: d => d[0],
      y: d => d[1],
      lineClassName: 'my-line',
      lineStyle: { fill: 'blue' },
    };
    const chart = mount(<LineChart {...props} />);
    const group = chart.find('g');
    const path = chart.find('path');

    expect(path.props().style).to.equal(props.lineStyle);
    expect(group.props().className).to.contain(props.lineClassName);
  });

  it('renders a line with number X & Y scales', () => {
    // make simple number-number line chart with 3 datapoints
    const props = {
      xScale: scaleLinear()
        .domain([0, 2])
        .range([0, 100]),
      yScale: scaleLinear()
        .domain([0, 1])
        .range([100, 0]),
      data: [[0, 0.5], [1, 1], [2, 0.25]],
      x: d => d[0],
      y: d => d[1],
    };

    // ensure line is drawn as expected
    const chart = mount(<LineChart {...props} />);
    const path = chart.find('path');
    const pathData = path.instance().getAttribute('d');
    expect(pathData).to.equal('M0,50L50,0L100,75');
  });

  it('renders a line with time X scale and number Y scale', () => {
    // make simple number-time line chart with 3 datapoints
    const props = {
      xScale: scaleTime()
        .range([0, 100])
        .domain([
          new Date('2015-01-01T00:00:00.000Z'),
          new Date('2015-01-03T00:00:00.000Z'),
        ]),
      yScale: scaleLinear()
        .domain([0, 1])
        .range([100, 0]),
      data: [
        [new Date('2015-01-01T00:00:00.000Z'), 0.5],
        [new Date('2015-01-02T00:00:00.000Z'), 1],
        [new Date('2015-01-03T00:00:00.000Z'), 0.25],
      ],
      x: d => d[0],
      y: d => d[1],
    };

    // ensure line is drawn as expected
    const chart = mount(<LineChart {...props} />);
    const path = chart.find('path');
    const pathData = path.instance().getAttribute('d');
    expect(pathData).to.equal('M0,50L50,0L100,75');
  });

  it('renders a line with ordinal X scale and number Y scale', () => {
    // make simple number-time line chart with 3 datapoints
    const props = {
      xScale: scalePoint()
        .domain(['a', 'b', 'c'])
        .range([0, 100]),
      yScale: scaleLinear()
        .domain([0, 1])
        .range([100, 0]),
      data: [['a', 0.5], ['b', 1], ['c', 0.25]],
      x: d => d[0],
      y: d => d[1],
    };

    // ensure line is drawn as expected
    const chart = mount(<LineChart {...props} />);
    const path = chart.find('path');
    const pathData = path.instance().getAttribute('d');
    expect(pathData).to.equal('M0,50L50,0L100,75');
  });

  it('renders a line chart within an XYPlot', () => {
    const xyProps = { width: 100, height: 100 };
    const lineProps = {
      data: [[0, 0.5], [1, 1], [2, 0.25]],
      x: d => d[0],
      y: d => d[1],
    };

    const chart = mount(
      <XYPlot {...xyProps}>
        <LineChart {...lineProps} />
      </XYPlot>,
    );

    const path = chart.find('path');
    expect(path).to.have.length(1);
    const pathData = path.instance().getAttribute('d');
    expect(pathData).not.to.include('NaN');
  });
});
