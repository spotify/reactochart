import chai, { expect } from "chai";
import { mount } from "enzyme";
import React from "react";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { XAxisLabels, XYPlot } from "src/index.js";
chai.use(sinonChai);

// XAxisLabels tests must run in browser since XAxisLabels uses measureText

describe("XAxisLabel", () => {
  const width = 500;
  const height = 300;

  it("Check how many labels are created and where", () => {
    const props = {
      width,
      height,
      scaleType: { x: "linear", y: "linear" },
      margin: { top: 11, bottom: 22, left: 33, right: 44 }
    };
    const chartStyle = { marginBottom: "10px" };
    const functions = {
      onMouseEnterLabel: sinon.spy(),
      onMouseMoveLabel: sinon.spy(),
      onMouseLeaveLabel: sinon.spy()
    };
    const tree = (
      <div>
        <div style={chartStyle}>
          <XYPlot
            width={400}
            height={150}
            xDomain={[-20, 20]}
            yDomain={[-20, 20]}
          >
            <XAxisLabels {...functions} />
            <XAxisLabels position="top" distance={2} tickCount={5} />
          </XYPlot>
        </div>
      </div>
    );
    const rendered = mount(tree).find(XAxisLabels);
    const first = rendered.first();
    // each tick is a g and there's a wrapper around all g's, hence the 10 and 6
    expect(first.find("g")).to.have.length(10);
    expect(rendered.at(1).find("g")).to.have.length(6);

    expect(rendered.at(1).props().position).to.equal("top");
    expect(first.props().position).to.equal("bottom");

    const firstChild = first.find("g").at(2);

    expect(first.props().onMouseEnterLabel).not.to.have.been.called;
    firstChild.simulate("mouseenter");
    expect(first.props().onMouseEnterLabel).to.have.been.calledOnce;

    expect(first.props().onMouseMoveLabel).not.to.have.been.called;
    firstChild.simulate("mousemove");
    expect(first.props().onMouseMoveLabel).to.have.been.calledOnce;

    expect(first.props().onMouseLeaveLabel).not.to.have.been.called;
    firstChild.simulate("mouseleave");
    expect(first.props().onMouseLeaveLabel).to.have.been.calledOnce;
  });
});
