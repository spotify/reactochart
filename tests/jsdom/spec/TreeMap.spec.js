import React from "react";
import * as d3 from "d3";
import _ from "lodash";
import { expect } from "chai";
import sinon from "sinon";
import { mount } from "enzyme";

import { TreeMap } from "../../../src/index.js";
import { TreeMapNode, TreeMapNodeLabel } from "../../../src/TreeMap.js";

describe("TreeMap", () => {
  const data = {
    children: _.range(1, 5).map(n => ({
      size: n * 5,
      name: `Name: ${n}`
    }))
  };

  const props = {
    data,
    nodeStyle: { border: "1px solid #333" },
    getLabel: d => d.name,
    getValue: d => d.size,
    onClickNode: sinon.spy(),
    onMouseEnterNode: sinon.spy(),
    onMouseLeaveNode: sinon.spy(),
    onMouseMoveNode: sinon.spy(),
    width: 400,
    height: 500
  };

  it("passes props correctly to nodes", () => {
    const chart = mount(<TreeMap {...props} />);
    const nodes = chart.find(TreeMapNode);

    nodes.forEach(node => {
      expect(node.props().nodeStyle.border).to.eql(props.nodeStyle.border);
    });
  });

  it("renders correct amount of nodes and labels", () => {
    const chart = mount(<TreeMap {...props} />);
    const nodes = chart.find(TreeMapNode);
    const labels = chart.find(TreeMapNodeLabel);

    expect(nodes).to.have.lengthOf(5);

    nodes.forEach(node => {
      expect(node.find(TreeMapNodeLabel)).to.have.lengthOf(1);
    });
  });

  it("recreates tree when sticky is false, and keeps tree when true", () => {
    let chart = mount(<TreeMap {...props} />);
    let tree = chart.getNode()._tree;

    chart.setProps({ data });
    expect(tree).to.not.equal(chart.getNode()._tree);

    chart = mount(<TreeMap {...props} sticky={true} />);
    tree = chart.getNode()._tree;
    chart.setProps({ data });
    expect(tree).to.eql(chart.getNode()._tree);
  });

  it("triggers event handlers", () => {
    const chart = mount(<TreeMap {...props} />);
    const nodes = chart.find(TreeMapNode);

    expect(props.onMouseMoveNode).not.to.have.been.called;
    nodes.at(1).simulate("mousemove");
    expect(props.onMouseMoveNode).to.have.been.called;
    expect(props.onMouseEnterNode).not.to.have.been.called;
    nodes.at(1).simulate("mouseenter");
    expect(props.onMouseEnterNode).to.have.been.called;
    expect(props.onMouseLeaveNode).not.to.have.been.called;
    nodes.at(1).simulate("mouseleave");
    expect(props.onMouseLeaveNode).to.have.been.called;
  });
});
