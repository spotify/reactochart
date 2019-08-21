import chai, { expect } from "chai";
import { mount } from "enzyme";
import React from "react";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { XYPlot, YAxisLabels } from "src/index.js";
chai.use(sinonChai);

// YAxisLabels tests must run in browser since YAxisLabels uses measureText

describe("YAxisLabel", () => {
  const width = 500;
  const height = 300;
  const props = {
    width,
    height,
    xScaleType: "linear",
    yScaleType: "linear",
    marginTop: 11,
    marginBottom: 22,
    marginLeft: 33,
    marginRight: 44,
    offset: 5
  };

  it("Check how many labels are created and where", () => {
    const chartStyle = { marginBottom: "10px" };
    const functions = {
      onMouseEnterLabel: sinon.spy(),
      onMouseMoveLabel: sinon.spy(),
      onMouseLeaveLabel: sinon.spy(),
      onMouseClickLabel: sinon.spy()
    };
    const tree = (
      <div>
        <div style={chartStyle}>
          <XYPlot
            width={300}
            height={300}
            xDomain={[-20, 20]}
            yDomain={[-20, 20]}
          >
            <YAxisLabels {...functions} />
            <YAxisLabels position="right" tickCount={5} />
          </XYPlot>
        </div>
      </div>
    );
    const rendered = mount(tree).find(YAxisLabels);
    const first = rendered.first();
    // each tick is a g and there's a wrapper around all g's, hence the 10 and 6
    expect(first.find("g")).to.have.length(10);
    expect(rendered.at(1).find("g")).to.have.length(6);

    expect(rendered.at(1).props().position).to.equal("right");
    expect(first.props().position).to.equal("left");

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

    expect(first.props().onMouseClickLabel).not.to.have.been.called;
    firstChild.simulate("click");
    expect(first.props().onMouseClickLabel).to.have.been.calledOnce;
  });

  it("Renders labels with given format and styles", () => {
    const tree = (
      <XYPlot width={400} height={150} xDomain={[-20, 20]} yDomain={[-20, 20]}>
        <YAxisLabels
          format={d => `${d  }%`}
          position="left"
          distance={2}
          tickCount={5}
          labelStyle={label => {
            return {
              fill: label.text === "0%" ? "green" : "blue"
            };
          }}
        />
      </XYPlot>
    );

    const rendered = mount(tree).find(YAxisLabels);
    const labelWrapper = rendered.first("g");
    const labels = labelWrapper.children().find("text");

    const correctTickLabels = ["-20%", "-10%", "0%", "10%", "20%"];

    const renderedTickLabels = labels.map(label => {
      const instance = label.instance();
      const textContent = instance.textContent;
      const expectedStyles = Object.assign(
        YAxisLabels.defaultProps.labelStyle,
        {
          fill: textContent === "0%" ? "green" : "blue"
        }
      );

      Object.keys(expectedStyles).forEach(styleKey => {
        // Parse to int if lineHeight
        const styleValue =
          styleKey === "lineHeight"
            ? parseInt(instance.style[styleKey], 10)
            : instance.style[styleKey];

        expect(expectedStyles[styleKey]).to.equal(styleValue);
      });

      return textContent;
    });

    expect(renderedTickLabels).to.eql(correctTickLabels);
  });

  it("Renders date labels given formats array", () => {
    const tree = (
      <XYPlot
        width={400}
        height={150}
        yDomain={[new Date("01/01/2015"), new Date("01/01/2019")]}
        xDomain={[-20, 20]}
      >
        <YAxisLabels
          formats={["%B %d, %Y", "%m/%Y"]}
          position="left"
          distance={2}
          tickCount={5}
        />
      </XYPlot>
    );

    const rendered = mount(tree).find(YAxisLabels);
    const labelWrapper = rendered.first("g");
    const labels = labelWrapper.children().find("text");

    // Logic should pick our first format "%B %d, %Y"
    // which would format the labels like so January 30, 2015
    // because YAxisLabels (rendered vertically) wouldn't have collisions
    const correctTickLabels = [
      "January 01, 2015",
      "January 01, 2016",
      "January 01, 2017",
      "January 01, 2018",
      "January 01, 2019"
    ];

    const renderedTickLabels = labels.map(label => {
      const instance = label.instance();
      const textContent = instance.textContent;
      return textContent;
    });

    expect(renderedTickLabels).to.eql(correctTickLabels);
  });

  it("Renders number labels given formats array", () => {
    const tree = (
      <XYPlot width={400} height={150} xDomain={[-20, 20]} yDomain={[-1, 1]}>
        <YAxisLabels
          formats={[".1%", ".0%"]}
          position="left"
          distance={2}
          tickCount={5}
        />
      </XYPlot>
    );

    const rendered = mount(tree).find(YAxisLabels);
    const labelWrapper = rendered.first("g");
    const labels = labelWrapper.children().find("text");

    // Logic should pick our first format ".1%"
    // which would format the labels like so: 1.0%
    // because YAxisLabels (rendered vertically) wouldn't have collisions
    const correctTickLabels = ["-100.0%", "-50.0%", "0.0%", "50.0%", "100.0%"];

    const renderedTickLabels = labels.map(label => {
      const instance = label.instance();
      const textContent = instance.textContent;
      return textContent;
    });

    expect(renderedTickLabels).to.eql(correctTickLabels);
  });
});
