import React from 'react';
import { scaleLinear } from 'd3-scale';
import { mount } from 'enzyme';

import { AreaBarChart, RangeRect } from '../../../src';
import { getValue } from '../../../src/utils/Data.js';

describe('AreaBarChart', () => {
  describe('renders and passes props correctly to RangeRect', () => {
    const props = {
      xScale: scaleLinear()
        .domain([0, 100])
        .range([0, 100]),
      yScale: scaleLinear()
        .domain([0, 1])
        .range([100, 0]),
      data: [
        { ageMin: 25, ageMax: 45, rate: 0.25 },
        { ageMin: 45, ageMax: 65, rate: 0.17 },
        { ageMin: 65, ageMax: 85, rate: 0.084 },
      ],
      x: d => d.ageMin,
      xEnd: d => d.ageMax,
      y: () => 0,
      yEnd: d => d.rate,
      barClassName: 'test-bar-class-name',
      barStyle: { fill: 'red' },
      onMouseEnterBar: () => {},
      onMouseMoveBar: () => {},
      onMouseLeaveBar: () => {},
    };

    it('when horizontal is false', () => {
      // renders individual RangeRects for the length of data
      const chart = mount(<AreaBarChart {...props} />);
      const group = chart.find('g');
      const rangeRects = chart.find(RangeRect);
      expect(group).toHaveLength(1);
      expect(rangeRects).toHaveLength(props.data.length);

      // sets / transforms props correctly for vertical bar chart
      expect(rangeRects.at(0).props().xScale).toEqual(props.xScale);
      expect(rangeRects.at(0).props().yScale).toEqual(props.yScale);
      expect(rangeRects.at(0).props().className).toContain(props.barClassName);
      expect(rangeRects.at(0).props().style).toEqual(props.barStyle);
      expect(rangeRects.at(0).props().x).toEqual(
        getValue(props.x, props.data[0]),
      );
      expect(rangeRects.at(0).props().xEnd).toEqual(
        getValue(props.xEnd, props.data[0]),
      );
      expect(rangeRects.at(0).props().y).toEqual(0);
      expect(rangeRects.at(0).props().yEnd).toEqual(
        getValue(props.y, props.data[0]),
      );
      // this should fail
      expect(true).toBeFalsy();
    });

    it('when horizontal is true', () => {
      // check that correct props are passed through in horizontal case
      const horizontalProps = { ...props, horizontal: true };

      const horizontalAreaBarChart = mount(
        <AreaBarChart {...horizontalProps} />,
      );
      const horizontalRangeRects = horizontalAreaBarChart.find(RangeRect);

      expect(horizontalRangeRects.at(0).props().x).toEqual(0);
      expect(horizontalRangeRects.at(0).props().xEnd).toEqual(
        getValue(props.x, props.data[0]),
      );
      expect(horizontalRangeRects.at(0).props().y).toEqual(
        getValue(props.y, props.data[0]),
      );
      expect(horizontalRangeRects.at(0).props().yEnd).toEqual(
        getValue(props.yEnd, props.data[0]),
      );
    });
  });
});
