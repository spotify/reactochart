import chai, { expect } from "chai";
import { mount } from "enzyme";
import React from "react";
import sinonChai from "sinon-chai";
import { XAxisTitle, XYPlot } from "src/index.js";
chai.use(sinonChai);

// XAxisTitle tests must run in browser since XAxisLabels uses measureText

describe("XAxisTitle", () => {
  it("Check how many labels are created and where", () => {
    const xyProps = {
      width: 500,
      height: 360,
      xDomain: [0, 100],
      yDomain: [0, 100]
    };

    const tree = (
      <XYPlot {...xyProps}>
        <XAxisTitle title="CCCC" alignment="right" />

        <XAxisTitle title="DDDD" alignment="left" placement="above" />

        <XAxisTitle title="HHHH" alignment="center" rotate />

        <XAxisTitle
          title="JJJJ"
          alignment="left"
          placement="above"
          rotate
        />

        <XAxisTitle title="MMMM" position="top" alignment="left" />

        <XAxisTitle
          title="PPPP"
          position="top"
          alignment="left"
          placement="below"
        />
        <XAxisTitle
          title="SSSS"
          position="top"
          alignment="left"
          rotate
        />
      </XYPlot>
    );
    const rendered = mount(tree).find(XAxisTitle);
    expect(rendered.at(0).props().alignment).to.equal("right");
    expect(
      rendered
        .at(0)
        .getDOMNode()
        .getAttribute("transform")
    ).to.equal("translate(500,220)");
    expect(rendered.at(1).props().placement).to.equal("above");
    expect(
      rendered
        .at(1)
        .getDOMNode()
        .getAttribute("transform")
    ).to.equal("translate(0,210)");
    expect(rendered.at(2).props().rotate).to.equal(true);
    expect(
      rendered
        .at(2)
        .getDOMNode()
        .getAttribute("transform")
    ).to.equal("translate(250,220)");
    expect(rendered.at(3).props().rotate).to.equal(true);
    expect(
      rendered
        .at(3)
        .find("text")
        .first()
        .getDOMNode()
        .getAttribute("transform")
    ).to.equal("rotate(-90)");
    expect(
      rendered
        .at(4)
        .getDOMNode()
        .getAttribute("transform")
    ).to.equal("translate(0,-5)");
    expect(
      rendered
        .at(5)
        .getDOMNode()
        .getAttribute("transform")
    ).to.equal("translate(0,5)");
    expect(
      rendered
        .at(6)
        .getDOMNode()
        .getAttribute("transform")
    ).to.equal("translate(0,-5)");
    expect(
      rendered
        .at(6)
        .find("text")
        .first()
        .getDOMNode()
        .getAttribute("transform")
    ).to.equal("rotate(-90)");
  });
});
