import React from "react";
import * as d3 from "d3";
import { expect } from "chai";
import { mount } from "enzyme";

import { XYPlot, ZoomContainer } from "../../../src/index.js";
import { getValue } from "../../../src/utils/Data.js";

describe("ZoomContainer", () => {
  const uncontrolledProps = {
    width: 500,
    height: 500,
    scaleExtent: [0.5, 2]
  };

  const controlledProps = {
    ...uncontrolledProps,
    controlled: true
  };

  it("passes props correctly to DOM", () => {
    const zoomContainer = mount(<ZoomContainer {...uncontrolledProps} />);

    let svg = zoomContainer.find("svg").instance();
    let group = zoomContainer.find("g").instance();

    expect(parseInt(svg.getAttribute("width"))).to.equal(
      uncontrolledProps.width
    );
    expect(parseInt(svg.getAttribute("height"))).to.equal(
      uncontrolledProps.height
    );
    expect(parseInt(group.getAttribute("width"))).to.equal(
      uncontrolledProps.width
    );
    expect(parseInt(group.getAttribute("height"))).to.equal(
      uncontrolledProps.height
    );

    const controlledZoomContainer = mount(
      <ZoomContainer {...controlledProps} />
    );

    svg = controlledZoomContainer.find("svg").instance();
    group = controlledZoomContainer.find("g").instance();

    expect(parseInt(svg.getAttribute("width"))).to.equal(controlledProps.width);
    expect(parseInt(svg.getAttribute("height"))).to.equal(
      controlledProps.height
    );
    expect(parseInt(group.getAttribute("width"))).to.equal(
      controlledProps.width
    );
    expect(parseInt(group.getAttribute("height"))).to.equal(
      controlledProps.height
    );
  });

  it("passes props correctly to d3 zoom", () => {
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
      wheelDelta: () => {}
    };

    const zoomContainer = mount(
      <ZoomContainer {...uncontrolledProps} {...d3Props} />
    );

    const d3Zoom = zoomContainer.instance().zoom;

    expect(d3Zoom.extent).to.be.a("function");
    expect(d3Zoom.scaleExtent).to.be.a("function");
    expect(d3Zoom.translateExtent).to.be.a("function");
    expect(d3Zoom.clickDistance).to.be.a("function");
    expect(d3Zoom.duration).to.be.a("function");
    expect(d3Zoom.interpolate).to.be.a("function");
    expect(d3Zoom.constrain).to.be.a("function");
    expect(d3Zoom.filter).to.be.a("function");
    expect(d3Zoom.touchable).to.be.a("function");
    expect(d3Zoom.wheelDelta).to.be.a("function");
  });

  it("passes zoom props correctly when controlled", () => {
    const zoomContainer = mount(<ZoomContainer {...controlledProps} />);

    expect(zoomContainer.prop("zoomX")).to.equal(0);
    expect(zoomContainer.prop("zoomY")).to.equal(0);
    expect(zoomContainer.prop("zoomScale")).to.equal(1);
    expect(zoomContainer.state("lastZoomTransform").k).to.eql(1);
    expect(zoomContainer.state("lastZoomTransform").x).to.eql(0);
    expect(zoomContainer.state("lastZoomTransform").y).to.eql(0);

    zoomContainer.setProps({ zoomX: 100, zoomY: 100, zoomScale: 2 });

    expect(zoomContainer.state("lastZoomTransform").k).to.eql(2);
    expect(zoomContainer.state("lastZoomTransform").x).to.eql(100);
    expect(zoomContainer.state("lastZoomTransform").y).to.eql(100);
  });

  it("renders correctly", () => {
    const zoomContainer = mount(<ZoomContainer {...uncontrolledProps} />);

    let svg = zoomContainer.find("svg");
    let group = zoomContainer.find("g");

    expect(svg.length).to.equal(1);
    expect(group.length).to.equal(1);

    const controlledZoomContainer = mount(
      <ZoomContainer {...controlledProps} />
    );

    svg = controlledZoomContainer.find("svg");
    group = controlledZoomContainer.find("g");

    expect(svg.length).to.equal(1);
    expect(group.length).to.equal(1);
  });
});
