import React from 'react';
import { mount } from 'enzyme';
import { scaleLinear } from 'd3-scale';

import { AriaLabelContainer } from '../../../src';

const onKeyDown = jest.fn();
const ariaLabelGenerator = xValue => `xValue: ${xValue}`;
const data0 = [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }];
const data1 = [{ val: 0, y: 0 }, { val: 1, y: 0 }, { val: 2, y: 0 }];
const props = {
  ariaLabelGenerator,
  onKeyDown,
  height: 50,
  width: 100,
  xScale: scaleLinear()
    .domain([0, 4])
    .range([0, 100]),
  datasetWithAccessor: [
    {
      data: data0,
      accessor: d => d.x,
    },
  ],
};

const numFrames = data0.length;

describe('AriaLabelContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and passes props correctly to AriaLabelContainer', () => {
    const chart = mount(<AriaLabelContainer {...props} />);
    const group = chart.find('g');
    const rects = chart.find('rect');

    expect(group).toHaveLength(1);
    expect(rects).toHaveLength(numFrames);

    expect(rects.at(0).props().height).toEqual(props.height);
    expect(rects.at(0).props().width).toEqual(props.width / (numFrames - 1));
    expect(rects.at(0).props()['aria-label']).toEqual(
      ariaLabelGenerator(data0[0].x),
    );
  });

  it('renders the last rect at the same position as the second-to-last if last value is end of domain', () => {
    const chart = mount(<AriaLabelContainer {...props} />);
    const rects = chart.find('rect');

    expect(rects.at(numFrames - 1).props().x).toEqual(
      rects.at(numFrames - 2).props().x,
    );
  });

  it('renders the last rect at a different location if before the end of the domain', () => {
    const chart = mount(
      <AriaLabelContainer
        {...props}
        datasetWithAccessor={[{ data: data1, accessor: d => d.val }]}
      />,
    );
    const rects = chart.find('rect');

    expect(rects.at(data1.length - 1).props().x).not.toEqual(
      rects.at(data1.length - 2).props().x,
    );
  });

  it('renders the proper amount of rectangles given two datasets', () => {
    const chart = mount(
      <AriaLabelContainer
        {...props}
        datasetWithAccessor={[
          ...props.datasetWithAccessor,
          { data: data1, accessor: d => d.val },
        ]}
      />,
    );
    const rects = chart.find('rect');

    expect(rects).toHaveLength(5);
  });

  it('triggers an action on key press', () => {
    const chart = mount(<AriaLabelContainer {...props} />);
    const rects = chart.find('rect');
    expect(onKeyDown).not.toHaveBeenCalled();
    rects.at(0).simulate('keydown');
    expect(onKeyDown).toHaveBeenCalled();
  });
});
