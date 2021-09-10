import React from 'react';
import { mount } from 'enzyme';

import { ZoomContainer } from '../../../src';

describe('ZoomContainer', () => {
  const uncontrolledProps = {
    width: 500,
    height: 500,
    scaleExtent: [0.5, 2],
  };

  const controlledProps = {
    ...uncontrolledProps,
    controlled: true,
  };

  it('passes props correctly to DOM', () => {
    const zoomContainer = mount(<ZoomContainer {...uncontrolledProps} />);

    let svg = zoomContainer.find('svg').instance();
    let group = zoomContainer.find('g').instance();

    expect(parseInt(svg.getAttribute('width'))).toEqual(
      uncontrolledProps.width,
    );
    expect(parseInt(svg.getAttribute('height'))).toEqual(
      uncontrolledProps.height,
    );
    expect(parseInt(group.getAttribute('width'))).toEqual(
      uncontrolledProps.width,
    );
    expect(parseInt(group.getAttribute('height'))).toEqual(
      uncontrolledProps.height,
    );

    const controlledZoomContainer = mount(
      <ZoomContainer {...controlledProps} />,
    );

    svg = controlledZoomContainer.find('svg').instance();
    group = controlledZoomContainer.find('g').instance();

    expect(parseInt(svg.getAttribute('width'))).toEqual(controlledProps.width);
    expect(parseInt(svg.getAttribute('height'))).toEqual(
      controlledProps.height,
    );
    expect(parseInt(group.getAttribute('width'))).toEqual(
      controlledProps.width,
    );
    expect(parseInt(group.getAttribute('height'))).toEqual(
      controlledProps.height,
    );
  });

  it('passes props correctly to d3 zoom', () => {
    const d3Props = {
      extent: [[0, 0], [1, 1]],
      scaleExtent: [0.5, 2],
      translateExtent: [[0, 0], [1, 1]],
      clickDistance: 1,
      duration: 250,
      interpolate: () => {},
      constrain: () => {},
      filter: () => {},
      touchable: () => {},
      wheelDelta: () => {},
    };

    const zoomContainer = mount(
      <ZoomContainer {...uncontrolledProps} {...d3Props} />,
    );

    const d3Zoom = zoomContainer.instance().zoom;

    expect(d3Zoom.extent).toBeInstanceOf(Function);
    expect(d3Zoom.scaleExtent).toBeInstanceOf(Function);
    expect(d3Zoom.translateExtent).toBeInstanceOf(Function);
    expect(d3Zoom.clickDistance).toBeInstanceOf(Function);
    expect(d3Zoom.duration).toBeInstanceOf(Function);
    expect(d3Zoom.interpolate).toBeInstanceOf(Function);
    expect(d3Zoom.constrain).toBeInstanceOf(Function);
    expect(d3Zoom.filter).toBeInstanceOf(Function);
    expect(d3Zoom.touchable).toBeInstanceOf(Function);
    expect(d3Zoom.wheelDelta).toBeInstanceOf(Function);
  });

  it('passes zoom props correctly when controlled', () => {
    const zoomContainer = mount(<ZoomContainer {...controlledProps} />);

    expect(zoomContainer.prop('zoomX')).toEqual(0);
    expect(zoomContainer.prop('zoomY')).toEqual(0);
    expect(zoomContainer.prop('zoomScale')).toEqual(1);
    expect(zoomContainer.state('lastZoomTransform').k).toEqual(1);
    expect(zoomContainer.state('lastZoomTransform').x).toEqual(0);
    expect(zoomContainer.state('lastZoomTransform').y).toEqual(0);

    zoomContainer.setProps({ zoomX: 100, zoomY: 100, zoomScale: 2 });

    expect(zoomContainer.state('lastZoomTransform').k).toEqual(2);
    expect(zoomContainer.state('lastZoomTransform').x).toEqual(100);
    expect(zoomContainer.state('lastZoomTransform').y).toEqual(100);
  });

  it('renders correctly', () => {
    const zoomContainer = mount(<ZoomContainer {...uncontrolledProps} />);

    let svg = zoomContainer.find('svg');
    let group = zoomContainer.find('g');

    expect(svg.length).toEqual(1);
    expect(group.length).toEqual(1);

    const controlledZoomContainer = mount(
      <ZoomContainer {...controlledProps} />,
    );

    svg = controlledZoomContainer.find('svg');
    group = controlledZoomContainer.find('g');

    expect(svg.length).toEqual(1);
    expect(group.length).toEqual(1);
  });
});
