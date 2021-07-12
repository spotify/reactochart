import React from 'react';
import { mount } from 'enzyme';

import { testWithScales } from '../utils';
import { RangeRect } from '../../../src';

describe('RangeRect', () => {
  it('renders a RangeRect with correct placement and size', () => {
    testWithScales(
      ['linear', 'ordinal'],
      ({ scale: xScale, testValues: xTestValues }) => {
        testWithScales(
          ['linear', 'ordinal'],
          ({ scale: yScale, testValues: yTestValues }) => {
            [0, 1].forEach(i => {
              const el = mount(
                <RangeRect
                  {...{
                    xScale,
                    yScale,
                    x: xTestValues[i],
                    y: yTestValues[i],
                    xEnd: xTestValues[i + 1],
                    yEnd: yTestValues[i + 1],
                  }}
                />,
              );

              const rect = el.find('rect');
              expect(rect).toHaveLength(1);
              const rectProps = rect.props();

              const xPosition = xScale(xTestValues[i]);
              const xEndPosition = xScale(xTestValues[i + 1]);
              expect(rectProps.x).toEqual(Math.min(xPosition, xEndPosition));
              expect(rectProps.width).toEqual(
                Math.abs(xEndPosition - xPosition),
              );

              const yPosition = yScale(yTestValues[i]);
              const yEndPosition = yScale(yTestValues[i + 1]);
              expect(rectProps.y).toEqual(Math.min(yPosition, yEndPosition));
              expect(rectProps.height).toEqual(
                Math.abs(yEndPosition - yPosition),
              );
            });
          },
        );
      },
    );
  });

  it('attaches style, className and mouse event handler props', () => {
    testWithScales(
      ['linear', 'ordinal'],
      ({ scale: xScale, testValues: xTestValues }) => {
        testWithScales(
          ['linear', 'ordinal'],
          ({ scale: yScale, testValues: yTestValues }) => {
            const props = {
              xScale,
              yScale,
              x: xTestValues[0],
              y: yTestValues[0],
              xEnd: xTestValues[1],
              yEnd: yTestValues[1],
              style: { fill: 'red', stroke: 'blue' },
              className: 'my-test-rect',
              onMouseEnter: jest.fn(),
              onMouseMove: jest.fn(),
              onMouseLeave: jest.fn(),
            };

            const el = mount(<RangeRect {...props} />);
            const rect = el.find('rect');
            expect(rect).toHaveLength(1);
            const rectProps = rect.props();

            expect(rectProps.style).toEqual(props.style);
            expect(rectProps.className).toContain(props.className);

            expect(rectProps.onMouseEnter).not.toHaveBeenCalled();
            rect.simulate('mouseenter');
            expect(rectProps.onMouseEnter).toHaveBeenCalledTimes(1);

            expect(rectProps.onMouseMove).not.toHaveBeenCalled();
            rect.simulate('mousemove');
            expect(rectProps.onMouseMove).toHaveBeenCalledTimes(1);

            expect(rectProps.onMouseLeave).not.toHaveBeenCalled();
            rect.simulate('mouseleave');
            expect(rectProps.onMouseLeave).toHaveBeenCalledTimes(1);
          },
        );
      },
    );
  });
});
