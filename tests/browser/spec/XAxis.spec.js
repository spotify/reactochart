import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  LineChart,
  XAxis,
  XAxisLabels,
  XAxisTitle,
  XGrid,
  XTicks,
  XYPlot,
} from 'src/index.js';

chai.use(sinonChai);
// XAxis tests must run in browser since XAxis uses measureText

describe('XAxis', () => {
  const width = 500;
  const height = 300;
  const props = {
    width,
    height,
    xScaleType: 'linear',
    yScaleType: 'linear',
    marginTop: 11,
    marginBottom: 22,
    marginLeft: 33,
    marginRight: 44,
  };

  it('extends the scale domain if to include custom `ticks` if passed', () => {
    const tree = (
      <XYPlot {...props} xDomain={[0, 10]} yDomain={[0, 10]}>
        <LineChart data={[[0, 0], [10, 10]]} x={d => d[0]} y={d => d[1]} />
        <XAxis ticks={[-5, 0, 5]} />
      </XYPlot>
    );
    const rendered = mount(tree).find(XAxis);

    expect(rendered.props().xDomain).to.deep.equal([-5, 10]);
    expect(rendered.props().yDomain).to.deep.equal([0, 10]);
  });

  it('rounds domain to nice numbers if `nice` option is true', () => {
    const niceXChart = mount(
      <XYPlot {...props}>
        <LineChart
          data={[[0.3, 0.8], [9.2, 9.7]]}
          x={d => d[0]}
          y={d => d[1]}
        />
        <XAxis nice />
      </XYPlot>,
    ).find(LineChart);

    expect(niceXChart.props().xDomain).to.deep.equal([0, 10]);
    expect(niceXChart.props().yDomain).to.deep.equal([0.8, 9.7]);
  });

  it('renders every part of the xAxis', () => {
    const tree = (
      <XYPlot {...props} xDomain={[0, 10]} yDomain={[0, 10]}>
        <XAxis ticks={[-5, 0, 5]} />
      </XYPlot>
    );
    const rendered = mount(tree);
    const line = rendered.find('.rct-chart-axis-line-x');
    expect(rendered.find(XGrid).props().ticks).to.have.length(3);
    expect(rendered.find(XAxisLabels)).to.have.length(1);
    expect(rendered.find(XAxisTitle)).to.have.length(1);
    expect(rendered.find(XTicks)).to.have.length(1);
    expect(line).to.have.length(1);
    expect(line.props().x1).to.be.a('number');
    expect(line.props().x2).to.be.a('number');
    expect(line.props().y1).to.be.a('number');
    expect(line.props().y2).to.be.a('number');
  });

  it('handles mouse events', () => {
    const onMouseEnterAxis = sinon.spy();
    const onMouseLeaveAxis = sinon.spy();
    const onMouseClickAxis = sinon.spy();

    const tree = (
      <XYPlot {...props} xDomain={[0, 10]} yDomain={[0, 10]}>
        <XAxis
          onMouseEnterAxis={onMouseEnterAxis}
          onMouseLeaveAxis={onMouseLeaveAxis}
          onMouseClickAxis={onMouseClickAxis}
          ticks={[-5, 0, 5]}
        />
      </XYPlot>
    );
    const rendered = mount(tree);
    const xAxis = rendered.find(XAxis);

    expect(onMouseEnterAxis).not.to.have.been.called;
    xAxis.simulate('mouseenter');
    expect(onMouseEnterAxis).to.have.been.calledOnce;

    expect(onMouseLeaveAxis).not.to.have.been.called;
    xAxis.simulate('mouseleave');
    expect(onMouseLeaveAxis).to.have.been.calledOnce;

    expect(onMouseClickAxis).not.to.have.been.called;
    xAxis.simulate('click');
    expect(onMouseClickAxis).to.have.been.calledOnce;
  });
});
