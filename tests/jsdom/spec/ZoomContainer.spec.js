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
    ...{ uncontrolledProps },
    controlled: true
  };

  it("passes props correctly", () => {
    const zoomContainer = mount(<ZoomContainer {...uncontrolledProps} />);

    const group = zoomContainer.find("g");
  });
});
