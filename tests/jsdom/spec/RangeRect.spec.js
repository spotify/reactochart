import React from 'react';
import chai from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const { expect } = chai;

import { testWithScales } from '../utils';
import { RangeRect } from '../../../src/index.js';

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
              expect(rect).to.have.length(1);
              const rectProps = rect.props();

              const xPosition = xScale(xTestValues[i]);
              const xEndPosition = xScale(xTestValues[i + 1]);
              expect(rectProps.x).to.equal(Math.min(xPosition, xEndPosition));
              expect(rectProps.width).to.equal(
                Math.abs(xEndPosition - xPosition),
              );

              const yPosition = yScale(yTestValues[i]);
              const yEndPosition = yScale(yTestValues[i + 1]);
              expect(rectProps.y).to.equal(Math.min(yPosition, yEndPosition));
              expect(rectProps.height).to.equal(
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
              onMouseEnter: sinon.spy(),
              onMouseMove: sinon.spy(),
              onMouseLeave: sinon.spy(),
            };

            const el = mount(<RangeRect {...props} />);
            const rect = el.find('rect');
            expect(rect).to.have.length(1);
            const rectProps = rect.props();

            expect(rectProps.style).to.deep.equal(props.style);
            expect(rectProps.className).to.include(props.className);

            expect(rectProps.onMouseEnter).not.to.have.been.called;
            rect.simulate('mouseenter');
            expect(rectProps.onMouseEnter).to.have.been.calledOnce;

            expect(rectProps.onMouseMove).not.to.have.been.called;
            rect.simulate('mousemove');
            expect(rectProps.onMouseMove).to.have.been.calledOnce;

            expect(rectProps.onMouseLeave).not.to.have.been.called;
            rect.simulate('mouseleave');
            expect(rectProps.onMouseLeave).to.have.been.calledOnce;
          },
        );
      },
    );
  });
});
