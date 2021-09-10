import { scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import React from 'react';
import { shallow } from 'enzyme';

import XLine from '../../../src/XLine';

function findLine(wrapper) {
  return wrapper.find('line.rct-chart-line-x').first();
}

function expectCorrectLinePlacement(wrapper, value, scale) {
  const lines = wrapper.find('line.rct-chart-line-x');
  expect(lines).toHaveLength(1);
  const line = lines.first();
  expect(line.first().prop('x1')).toEqual(scale(value));
  expect(line.first().prop('x2')).toEqual(scale(value));
  return wrapper;
}

function getLineHeight(line) {
  const y1 = +line.prop('y1') || 0;
  const y2 = +line.prop('y2');
  return Math.abs(y2 - y1);
}

describe('XLine', () => {
  const linearScale = scaleLinear()
    .domain([-5, 5])
    .range([0, 500]);
  const timeScale = scaleTime()
    .domain([new Date(2009, 0, 1), new Date(2010, 0, 1)])
    .range([0, 500]);
  const ordinalScale = scalePoint()
    .domain(['a', 'b', 'c', 'd'])
    .range([0, 300]);

  const linearValue = 2;
  const timeValue = new Date(2009, 9, 19);
  const ordinalValue = 'c';
  const commonProps = { spacing: { top: 0, bottom: 0, left: 0, right: 0 } };

  it('renders a .rct-chart-line-x element in the correct place', () => {
    let wrapper = shallow(
      <XLine xScale={linearScale} value={linearValue} {...commonProps} />,
    );
    expectCorrectLinePlacement(wrapper, linearValue, linearScale);

    wrapper = shallow(
      <XLine xScale={timeScale} value={timeValue} {...commonProps} />,
    );
    expectCorrectLinePlacement(wrapper, timeValue, timeScale);

    wrapper = shallow(
      <XLine xScale={ordinalScale} value={ordinalValue} {...commonProps} />,
    );
    expectCorrectLinePlacement(wrapper, ordinalValue, ordinalScale);
  });

  it('renders a line with the correct height', () => {
    let wrapper = shallow(
      <XLine
        xScale={linearScale}
        value={linearValue}
        height={200}
        {...commonProps}
      />,
    );
    expect(getLineHeight(findLine(wrapper))).toEqual(200);

    wrapper = shallow(
      <XLine
        xScale={linearScale}
        value={linearValue}
        height={400}
        {...commonProps}
      />,
    );
    expect(getLineHeight(findLine(wrapper))).toEqual(400);
  });

  it('passes className to the line', () => {
    const wrapper = shallow(
      <XLine
        xScale={linearScale}
        value={linearValue}
        className="test-line-class"
        {...commonProps}
      />,
    );
    expect(wrapper).toContainMatchingElement('line.test-line-class');
  });

  it('passes style to the line', () => {
    const style = { fill: 'red' };
    const wrapper = shallow(
      <XLine
        xScale={linearScale}
        value={linearValue}
        style={style}
        {...commonProps}
      />,
    );
    expect(findLine(wrapper).prop('style')).toEqual(style);
  });

  it("limits the line's height using yLimit", () => {
    const limit = 2;
    const wrapper = shallow(
      <XLine
        yScale={linearScale}
        xScale={linearScale}
        yDomain={linearScale.domain()}
        value={linearValue}
        yLimit={limit}
        {...commonProps}
      />,
    );
    expect(getLineHeight(findLine(wrapper))).toEqual(linearScale(limit));
  });
});
