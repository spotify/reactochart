import React from 'react';
import { mount } from 'enzyme';

import { A11yInterface } from '../../../src';

const onKeyDown = jest.fn();
const ariaLabelGenerator = frameIndex => `frameIndex: ${frameIndex}`;
const props = {
  ariaLabelGenerator,
  numFrames: 5,
  onKeyDown,
  height: 50,
  width: 100,
};

describe('A11yInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and passes props correctly to A11yInterface', () => {
    const chart = mount(<A11yInterface {...props} />);
    const group = chart.find('g');
    const rects = chart.find('rect');

    expect(group).toHaveLength(1);
    expect(rects).toHaveLength(props.numFrames);

    expect(rects.at(0).props().height).toEqual(props.height);
    expect(rects.at(0).props().width).toEqual(
      props.width / (props.numFrames - 1),
    );
    expect(rects.at(0).props()['aria-label']).toEqual(ariaLabelGenerator(0));
  });

  it('renders the last rect at the same position as the second-to-last', () => {
    const chart = mount(<A11yInterface {...props} />);
    const rects = chart.find('rect');

    expect(rects.at(props.numFrames - 1).x).toEqual(
      rects.at(props.numFrames - 2).x,
    );
  });

  it('triggers an action on key press', () => {
    const chart = mount(<A11yInterface {...props} />);
    const rects = chart.find('rect');
    expect(onKeyDown).not.toHaveBeenCalled();
    rects.at(0).simulate('keydown');
    expect(onKeyDown).toHaveBeenCalled();
  });
});
