import React from "react";
import * as d3 from "d3";
import _ from "lodash";
import { mount, shallow } from "enzyme";
import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
chai.use(sinonChai);
const { expect } = chai;

// use rewire to test internal SankeyNode/Link/etc. components
const rewire = require("rewire");
const Sankey = rewire("../../../src/SankeyDiagram");
const SankeyDiagram = Sankey.default;
const SankeyNode = Sankey.__get__("SankeyNode");
const SankeyLink = Sankey.__get__("SankeyLink");
const SankeyNodeTerminal = Sankey.__get__("SankeyLink");
const SankeyNodeLabel = Sankey.__get__("SankeyNodeLabel");
const SankeyLinkLabel = Sankey.__get__("SankeyLinkLabel");

function getSampleData() {
  return {
    nodes: [
      { name: "Apples" },
      { name: "Bananas" },
      { name: "Cherries" },
      { name: "Dates" },
      { name: "Elderberries" }
    ],
    links: [
      { source: 0, target: 2, value: 0.5 },
      { source: 0, target: 3, value: 0.5 },
      { source: 1, target: 2, value: 0.5 },
      { source: 1, target: 3, value: 0.5 },
      { source: 2, target: 4, value: 1 },
      { source: 3, target: 4, value: 1 }
    ]
  };
}

function getSampleDataWithId() {
  return {
    nodes: [
      { id: "a", label: "Apples" },
      { id: "b", label: "Bananas" },
      { id: "c", label: "Cherries" },
      { id: "d", label: "Dates" },
      { id: "e", label: "Elderberries" }
    ],
    links: [
      { source: "a", target: "c", value: 0.5 },
      { source: "a", target: "d", value: 0.5 },
      { source: "b", target: "c", value: 0.5 },
      { source: "b", target: "d", value: 0.5 },
      { source: "c", target: "e", value: 1 },
      { source: "d", target: "e", value: 1 }
    ]
  };
}

describe("SankeyDiagram", () => {
  it("renders a Sankey Diagram", () => {
    const { nodes, links } = getSampleData();
    const props = { width: 600, height: 400, nodes, links };
    const chart = mount(<SankeyDiagram {...props} />);
    const svg = chart.find("svg");
    expect(svg).to.have.length(1);

    // todo check shouldClone
    // get sampleData again since it has been mutated by the component
    const sampleData = getSampleData();
    const sankeyNodes = chart.find(SankeyNode);
    const sankeyLinks = chart.find(SankeyLink);
    expect(sankeyNodes).to.have.length(5);
    expect(sankeyLinks).to.have.length(6);

    sankeyNodes.forEach((node, i) => {
      const nodeProps = node.props();
      expect(nodeProps.graph).to.be.an("object");
      expect(nodeProps.node).to.be.an("object");
      expect(nodeProps.node.index).to.be.finite;
      expect(nodeProps.node.index).to.equal(i);
      expect(nodeProps.node.name).to.be.a("string");
      expect(nodeProps.node.name).to.equal(nodes[i].name);
      const sourceLinks = sampleData.links.filter(link => link.source === i);
      const targetLinks = sampleData.links.filter(link => link.target === i);
      expect(nodeProps.node.sourceLinks).to.be.an("array");
      expect(nodeProps.node.sourceLinks).to.have.length(sourceLinks.length);
      expect(nodeProps.node.targetLinks).to.be.an("array");
      expect(nodeProps.node.targetLinks).to.have.length(targetLinks.length);
      const expectedNodeValue = Math.max(
        _.sumBy(sourceLinks, l => l.value),
        _.sumBy(targetLinks, l => l.value)
      );
      expect(nodeProps.node.value).to.equal(expectedNodeValue);
      expect(nodeProps.node.x0).to.be.finite;
      expect(nodeProps.node.x1).to.be.finite;
      expect(nodeProps.node.x0).not.to.equal(nodeProps.node.x1);
      expect(nodeProps.node.y0).to.be.finite;
      expect(nodeProps.node.y1).to.be.finite;
      expect(nodeProps.node.y0).not.to.equal(nodeProps.node.y1);
    });
    expect(sankeyNodes.at(0).props().node.depth).to.equal(0);
    expect(sankeyNodes.at(2).props().node.depth).to.equal(1);
    expect(sankeyNodes.at(4).props().node.depth).to.equal(2);

    sankeyLinks.forEach((link, i) => {
      const linkProps = link.props();
      expect(linkProps.graph).to.be.an("object");
      expect(linkProps.linkPath).to.be.a("string");
      expect(linkProps.linkPath.length).to.be.above(2);
      expect(linkProps.linkPath).to.contain("M");
      expect(linkProps.linkPath).to.contain("C");
      expect(linkProps.link).to.be.an("object");
      expect(linkProps.link.index).to.be.finite;
      expect(linkProps.link.index).to.equal(i);
      expect(linkProps.link.source).to.be.an("object");
      expect(linkProps.link.source.index).to.equal(sampleData.links[i].source);
      expect(linkProps.link.target).to.be.an("object");
      expect(linkProps.link.target.index).to.equal(sampleData.links[i].target);
      expect(linkProps.link.value).to.be.finite;
      expect(linkProps.link.value).to.equal(sampleData.links[i].value);
      expect(linkProps.link.width).to.be.finite;
      expect(linkProps.link.width).not.to.equal(0);
    });
  });

  it("passes width, height, style and className props through to the SVG", () => {
    const props = {
      ...getSampleData(),
      width: 600,
      height: 400,
      className: "woof",
      style: { paddingLeft: 30 }
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const svg = chart.find("svg");
    expect(svg).to.have.length(1);
    expect(svg.props().width).to.equal(600);
    expect(svg.props().height).to.equal(400);
    expect(svg.props().className).to.contain("woof");
    expect(svg.props().style).to.be.an("object");
    expect(svg.props().style.paddingLeft).to.equal(30);
  });

  it("uses shouldClone prop to determine whether to clone or mutate nodes/links data", () => {
    const dataToClone = getSampleData();
    const cloneProps = {
      ...dataToClone,
      width: 600,
      height: 400,
      shouldClone: true
    };
    const cloneChart = mount(<SankeyDiagram {...cloneProps} />);
    expect(dataToClone).to.deep.equal(getSampleData());

    const dataToMutate = getSampleData();
    const mutateProps = {
      ...dataToMutate,
      width: 600,
      height: 400,
      shouldClone: false
    };
    const mutateChart = mount(<SankeyDiagram {...mutateProps} />);
    expect(dataToMutate).not.to.deep.equal(getSampleData());
    expect(dataToMutate.links[0].source).to.deep.equal(dataToMutate.nodes[0]);
  });

  it("uses nodeId accessor prop to determine node IDs", () => {
    const props = {
      width: 600,
      height: 400,
      ...getSampleDataWithId(),
      nodeId: (node, graph) => node.id
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const svg = chart.find("svg");
    expect(svg).to.have.length(1);

    // get sampleData again since it has been mutated by the component
    const sampleData = getSampleDataWithId();
    const sankeyNodes = chart.find(SankeyNode);
    const sankeyLinks = chart.find(SankeyLink);
    expect(sankeyNodes).to.have.length(5);
    expect(sankeyLinks).to.have.length(6);

    sankeyNodes.forEach((node, i) => {
      const nodeProps = node.props();
      expect(nodeProps.node).to.be.an("object");
      const sourceLinks = sampleData.links.filter(
        link => link.source === nodeProps.node.id
      );
      const targetLinks = sampleData.links.filter(
        link => link.target === nodeProps.node.id
      );
      expect(nodeProps.node.sourceLinks).to.be.an("array");
      expect(nodeProps.node.sourceLinks).to.have.length(sourceLinks.length);
      expect(nodeProps.node.targetLinks).to.be.an("array");
      expect(nodeProps.node.targetLinks).to.have.length(targetLinks.length);
      const expectedNodeValue = Math.max(
        _.sumBy(sourceLinks, l => l.value),
        _.sumBy(targetLinks, l => l.value)
      );
      expect(nodeProps.node.value).to.equal(expectedNodeValue);
      expect(nodeProps.node.x0).to.be.finite;
      expect(nodeProps.node.x1).to.be.finite;
      expect(nodeProps.node.x0).not.to.equal(nodeProps.node.x1);
      expect(nodeProps.node.y0).to.be.finite;
      expect(nodeProps.node.y1).to.be.finite;
      expect(nodeProps.node.y0).not.to.equal(nodeProps.node.y1);
    });
    expect(sankeyNodes.at(0).props().node.depth).to.equal(0);
    expect(sankeyNodes.at(2).props().node.depth).to.equal(1);
    expect(sankeyNodes.at(4).props().node.depth).to.equal(2);

    sankeyLinks.forEach((link, i) => {
      const linkProps = link.props();
      expect(linkProps.graph).to.be.an("object");
      expect(linkProps.linkPath).to.be.a("string");
      expect(linkProps.linkPath.length).to.be.above(2);
      expect(linkProps.linkPath).to.contain("M");
      expect(linkProps.linkPath).to.contain("C");
      expect(linkProps.link).to.be.an("object");
      expect(linkProps.link.source).to.be.an("object");
      expect(linkProps.link.source.id).to.equal(sampleData.links[i].source);
      expect(linkProps.link.target).to.be.an("object");
      expect(linkProps.link.target.id).to.equal(sampleData.links[i].target);
      expect(linkProps.link.value).to.be.finite;
      expect(linkProps.link.value).to.equal(sampleData.links[i].value);
      expect(linkProps.link.width).to.be.finite;
      expect(linkProps.link.width).not.to.equal(0);
    });
  });

  it("uses showNodes boolean or accessor prop to determine whether to render nodes", () => {
    const size = { width: 600, height: 400 };
    const showNodesProps = {
      ...size,
      ...getSampleData(),
      showNodes: true
    };
    const showNodesChart = mount(<SankeyDiagram {...showNodesProps} />);
    expect(showNodesChart.find(SankeyNode)).to.have.length(5);

    const hideNodesProps = {
      ...size,
      ...getSampleData(),
      showNodes: false
    };
    const hideNodesChart = mount(<SankeyDiagram {...hideNodesProps} />);
    expect(hideNodesChart.find(SankeyNode)).to.have.length(0);

    const showSomeNodesProps = {
      ...size,
      ...getSampleData(),
      showNodes: node => node.index < 3
    };
    const showSomeNodesChart = mount(<SankeyDiagram {...showSomeNodesProps} />);
    expect(showSomeNodesChart.find(SankeyNode)).to.have.length(3);
  });

  it("uses showLinks boolean or accessor prop to determine whether to render links", () => {
    const size = { width: 600, height: 400 };
    const showLinksProps = {
      ...size,
      ...getSampleData(),
      showLinks: true
    };
    const showLinksChart = mount(<SankeyDiagram {...showLinksProps} />);
    expect(showLinksChart.find(SankeyLink)).to.have.length(6);

    const hideLinksProps = {
      ...size,
      ...getSampleData(),
      showLinks: false
    };
    const hideLinksChart = mount(<SankeyDiagram {...hideLinksProps} />);
    expect(hideLinksChart.find(SankeyLink)).to.have.length(0);

    const showSomeLinksProps = {
      ...size,
      ...getSampleData(),
      showLinks: (link, graph) => link.target.index === 2
    };
    const showSomeLinksChart = mount(<SankeyDiagram {...showSomeLinksProps} />);
    expect(showSomeLinksChart.find(SankeyLink)).to.have.length(2);
  });

  it("uses nodeWidth prop to control the width of the node rectangles", () => {
    const props = {
      ...getSampleData(),
      width: 600,
      height: 400,
      nodeWidth: 19
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const sankeyNodes = chart.find(SankeyNode);
    expect(sankeyNodes).to.have.length(5);

    sankeyNodes.forEach((node, i) => {
      const nodeProps = node.props();
      expect(nodeProps.node).to.be.an("object");
      expect(nodeProps.node.x0).to.be.finite;
      expect(nodeProps.node.x1).to.be.finite;
      expect(nodeProps.node.x1 - nodeProps.node.x0).to.equal(19);
      expect(nodeProps.node.y0).to.be.finite;
      expect(nodeProps.node.y1).to.be.finite;
      expect(nodeProps.node.y0).not.to.equal(nodeProps.node.y1);
    });
  });

  it("uses nodePadding to control vertical space between node rectangles", () => {
    const props = {
      ...getSampleData(),
      width: 600,
      height: 400,
      nodePadding: 37
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const sankeyNodes = chart.find(SankeyNode);
    expect(sankeyNodes).to.have.length(5);
    expect(
      sankeyNodes.at(1).props().node.y0 - sankeyNodes.at(0).props().node.y1
    ).to.equal(37);
    expect(
      sankeyNodes.at(3).props().node.y0 - sankeyNodes.at(2).props().node.y1
    ).to.equal(37);
  });

  // todo: test nodeAlignment? how?

  it("passes nodeClassName, nodeStyle and node mouse event handlers through to nodes", () => {
    const props = {
      ...getSampleData(),
      width: 600,
      height: 400,
      nodeClassName: "doggo",
      nodeStyle: { fill: "orange" },
      onMouseEnterNode: sinon.spy(),
      onMouseLeaveNode: sinon.spy(),
      onMouseMoveNode: sinon.spy(),
      onMouseDownNode: sinon.spy(),
      onMouseUpNode: sinon.spy(),
      onClickNode: sinon.spy()
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const sankeyNodes = chart.find(SankeyNode);
    expect(sankeyNodes).to.have.length(5);

    sankeyNodes.forEach((node, i) => {
      const nodeProps = node.props();
      expect(nodeProps.nodeClassName).to.equal("doggo");
      expect(nodeProps.nodeStyle).to.be.an("object");
      expect(nodeProps.nodeStyle.fill).to.equal("orange");
      expect(nodeProps.onMouseEnterNode).to.equal(props.onMouseEnterNode);
      expect(nodeProps.onMouseLeaveNode).to.equal(props.onMouseLeaveNode);
      expect(nodeProps.onMouseMoveNode).to.equal(props.onMouseMoveNode);
      expect(nodeProps.onMouseDownNode).to.equal(props.onMouseDownNode);
      expect(nodeProps.onMouseUpNode).to.equal(props.onMouseUpNode);
      expect(nodeProps.onClickNode).to.equal(props.onClickNode);
    });
  });

  it("passes linkClassName, linkStyle and link mouse event handlers through to nodes", () => {
    const props = {
      ...getSampleData(),
      width: 600,
      height: 400,
      linkClassName: "kitten",
      linkStyle: { fill: "tomato" },
      onMouseEnterLink: sinon.spy(),
      onMouseLeaveLink: sinon.spy(),
      onMouseMoveLink: sinon.spy(),
      onMouseDownLink: sinon.spy(),
      onMouseUpLink: sinon.spy(),
      onClickLink: sinon.spy()
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const sankeyLinks = chart.find(SankeyLink);
    expect(sankeyLinks).to.have.length(6);

    sankeyLinks.forEach((link, i) => {
      const linkProps = link.props();
      expect(linkProps.linkClassName).to.equal("kitten");
      expect(linkProps.linkStyle).to.be.an("object");
      expect(linkProps.linkStyle.fill).to.equal("tomato");
      expect(linkProps.onMouseEnterLink).to.equal(props.onMouseEnterLink);
      expect(linkProps.onMouseLeaveLink).to.equal(props.onMouseLeaveLink);
      expect(linkProps.onMouseMoveLink).to.equal(props.onMouseMoveLink);
      expect(linkProps.onMouseDownLink).to.equal(props.onMouseDownLink);
      expect(linkProps.onMouseUpLink).to.equal(props.onMouseUpLink);
      expect(linkProps.onClickLink).to.equal(props.onClickLink);
    });
  });

  it("uses showNodeLabels boolean or accessor prop to determine whether to render node labels", () => {
    const size = { width: 600, height: 400 };
    const showNodeLabelsProps = {
      ...size,
      ...getSampleData(),
      showNodeLabels: true
    };
    const showNodeLabelsChart = mount(
      <SankeyDiagram {...showNodeLabelsProps} />
    );
    expect(showNodeLabelsChart.find(SankeyNodeLabel)).to.have.length(5);

    const hideNodeLabelsProps = {
      ...size,
      ...getSampleData(),
      showNodeLabels: false
    };
    const hideNodeLabelsChart = mount(
      <SankeyDiagram {...hideNodeLabelsProps} />
    );
    expect(hideNodeLabelsChart.find(SankeyNodeLabel)).to.have.length(0);

    const showSomeNodeLabelsProps = {
      ...size,
      ...getSampleData(),
      showNodeLabels: node => node.index < 3
    };
    const showSomeNodeLabelsChart = mount(
      <SankeyDiagram {...showSomeNodeLabelsProps} />
    );
    expect(showSomeNodeLabelsChart.find(SankeyNodeLabel)).to.have.length(3);
  });

  it("uses showLinkLabels boolean or accessor prop to determine whether to render link labels", () => {
    const size = { width: 600, height: 400 };
    const showLinkLabelsProps = {
      ...size,
      ...getSampleData(),
      showLinkLabels: true
    };
    const showLinkLabelsChart = mount(
      <SankeyDiagram {...showLinkLabelsProps} />
    );
    expect(showLinkLabelsChart.find(SankeyLinkLabel)).to.have.length(6);

    const hideLinkLabelsProps = {
      ...size,
      ...getSampleData(),
      showLinkLabels: false
    };
    const hideLinkLabelsChart = mount(
      <SankeyDiagram {...hideLinkLabelsProps} />
    );
    expect(hideLinkLabelsChart.find(SankeyLinkLabel)).to.have.length(0);

    const showSomeLinkLabelsProps = {
      ...size,
      ...getSampleData(),
      showLinkLabels: (link, graph) => link.target.index === 2
    };
    const showSomeLinkLabelsChart = mount(
      <SankeyDiagram {...showSomeLinkLabelsProps} />
    );
    expect(showSomeLinkLabelsChart.find(SankeyLinkLabel)).to.have.length(2);
  });

  describe("SankeyNode", () => {
    const basicNodeObj = {
      index: 5,
      x0: 30,
      x1: 50,
      y0: 25,
      y1: 100
    };
    it("renders a rectangle with the position & size of the current node", () => {
      const node = mount(<SankeyNode {...{ node: basicNodeObj }} />);
      const rect = node.find("rect");
      expect(rect).to.have.length(1);
      expect(rect.props().x).to.equal(30);
      expect(rect.props().y).to.equal(25);
      expect(rect.props().width).to.equal(20);
      expect(rect.props().height).to.equal(75);
      expect(rect.props().className).to.contain("sankey-node");
    });
    it("passes nodeClassName and nodeStyle through to the node rectangle element", () => {
      const className = "foo-bar-node";
      const style = { fill: "coral" };
      const nodeProps = {
        node: basicNodeObj,
        nodeClassName: className,
        nodeStyle: style
      };
      const node = mount(<SankeyNode {...nodeProps} />);
      const rect = node.find("rect");
      expect(rect.props().className).to.contain(className);
      expect(rect.props().style).to.be.an("object");
      expect(rect.props().style.fill).to.equal("coral");
    });
    it("calls nodeClassName & nodeStyle to get class & style, if they are functions", () => {
      const className = (node, graph) => `i-${node.index}-x0-${node.x0}`;
      const style = (node, graph) => ({ strokeWidth: `${node.x1}px` });
      const nodeProps = {
        node: basicNodeObj,
        nodeClassName: className,
        nodeStyle: style
      };
      const node = mount(<SankeyNode {...nodeProps} />);
      const rect = node.find("rect");
      expect(rect.props().className).to.contain("i-5-x0-30");
      expect(rect.props().style).to.be.an("object");
      expect(rect.props().style.strokeWidth).to.equal("50px");
    });
    it("attaches mouse event handlers (enter, leave, move, down, up, click) to the node rectangle", () => {
      const nodeProps = {
        node: basicNodeObj,
        graph: { nodes: [], links: [] },
        onMouseEnterNode: sinon.spy(),
        onMouseLeaveNode: sinon.spy(),
        onMouseMoveNode: sinon.spy(),
        onMouseDownNode: sinon.spy(),
        onMouseUpNode: sinon.spy(),
        onClickNode: sinon.spy()
      };
      const node = mount(<SankeyNode {...nodeProps} />);
      const rect = node.find("rect");

      expect(rect.props().onMouseEnter).to.be.a("function");
      expect(rect.props().onMouseLeave).to.be.a("function");
      expect(rect.props().onMouseMove).to.be.a("function");
      expect(rect.props().onMouseDown).to.be.a("function");
      expect(rect.props().onMouseUp).to.be.a("function");
      expect(rect.props().onClick).to.be.a("function");

      expect(nodeProps.onMouseEnterNode).not.to.have.been.called;
      rect.simulate("mouseenter");
      expect(nodeProps.onMouseEnterNode).to.have.been.called;
      expect(nodeProps.onMouseLeaveNode).not.to.have.been.called;
      rect.simulate("mouseleave");
      expect(nodeProps.onMouseLeaveNode).to.have.been.called;
      expect(nodeProps.onMouseMoveNode).not.to.have.been.called;
      rect.simulate("mousemove");
      expect(nodeProps.onMouseMoveNode).to.have.been.called;
      expect(nodeProps.onMouseDownNode).not.to.have.been.called;
      rect.simulate("mousedown");
      expect(nodeProps.onMouseDownNode).to.have.been.called;
      expect(nodeProps.onMouseUpNode).not.to.have.been.called;
      rect.simulate("mouseup");
      expect(nodeProps.onMouseUpNode).to.have.been.called;
      expect(nodeProps.onClickNode).not.to.have.been.called;
      rect.simulate("click");
      expect(nodeProps.onClickNode).to.have.been.called;

      // make sure callbacks are called with (event, {link, graph})
      expect(nodeProps.onClickNode.args[0]).to.have.length(2);
      const eventArg = nodeProps.onClickNode.args[0][0];
      const infoArg = nodeProps.onClickNode.args[0][1];
      expect(eventArg).to.be.an("object");
      expect(eventArg).to.have.property("target");
      expect(eventArg.target).to.be.an("object");
      expect(infoArg).to.be.an("object");
      expect(infoArg.node).to.equal(basicNodeObj);
      expect(infoArg.graph).to.equal(nodeProps.graph);
    });
  });

  describe("SankeyLink", () => {
    const linkPath = "M10 10";
    const linkObj = { width: 20 };
    it("renders a link path", () => {
      const link = mount(<SankeyLink {...{ link: linkObj, linkPath }} />);
      const path = link.find("path");
      expect(path).to.have.length(1);
      expect(path.props().d).to.equal(linkPath);
      expect(path.props().style).to.be.an("object");
      expect(path.props().style.strokeWidth).to.equal(20);
    });
    it("passes linkClassName and linkStyle through to the path element", () => {
      const linkClassName = "foo-bar-link";
      const linkStyle = { fill: "thistle" };
      const link = mount(
        <SankeyLink
          {...{ link: linkObj, linkPath, linkClassName, linkStyle }}
        />
      );
      const path = link.find("path");
      expect(path.props().className).to.contain(linkClassName);
      expect(path.props().style).to.be.an("object");
      expect(path.props().style.fill).to.equal("thistle");
    });
    it("calls linkClassName & linkStyle to get class & style, if they are functions", () => {
      const linkClassName = (link, graph) => `w-${link.width}`;
      const linkStyle = (link, graph) => ({ borderWidth: link.width });
      const linkProps = { link: linkObj, linkClassName, linkStyle };
      const link = mount(<SankeyLink {...linkProps} />);
      const path = link.find("path");
      expect(path.props().className).to.contain("w-20");
      expect(path.props().style).to.be.an("object");
      expect(path.props().style.borderWidth).to.equal(20);
    });
    it("attaches mouse event handlers (enter, leave, move, down, up, click) to the link path", () => {
      const linkProps = {
        link: linkObj,
        graph: { nodes: [], links: [] },
        onMouseEnterLink: sinon.spy(),
        onMouseLeaveLink: sinon.spy(),
        onMouseMoveLink: sinon.spy(),
        onMouseDownLink: sinon.spy(),
        onMouseUpLink: sinon.spy(),
        onClickLink: sinon.spy()
      };
      const link = mount(<SankeyLink {...linkProps} />);
      const path = link.find("path");

      expect(path.props().onMouseEnter).to.be.a("function");
      expect(path.props().onMouseLeave).to.be.a("function");
      expect(path.props().onMouseMove).to.be.a("function");
      expect(path.props().onMouseDown).to.be.a("function");
      expect(path.props().onMouseUp).to.be.a("function");
      expect(path.props().onClick).to.be.a("function");

      expect(linkProps.onMouseEnterLink).not.to.have.been.called;
      path.simulate("mouseenter");
      expect(linkProps.onMouseEnterLink).to.have.been.called;
      expect(linkProps.onMouseLeaveLink).not.to.have.been.called;
      path.simulate("mouseleave");
      expect(linkProps.onMouseLeaveLink).to.have.been.called;
      expect(linkProps.onMouseMoveLink).not.to.have.been.called;
      path.simulate("mousemove");
      expect(linkProps.onMouseMoveLink).to.have.been.called;
      expect(linkProps.onMouseDownLink).not.to.have.been.called;
      path.simulate("mousedown");
      expect(linkProps.onMouseDownLink).to.have.been.called;
      expect(linkProps.onMouseUpLink).not.to.have.been.called;
      path.simulate("mouseup");
      expect(linkProps.onMouseUpLink).to.have.been.called;
      expect(linkProps.onClickLink).not.to.have.been.called;
      path.simulate("click");
      expect(linkProps.onClickLink).to.have.been.called;

      // make sure callbacks are called with (event, {link, graph})
      expect(linkProps.onClickLink.args[0]).to.have.length(2);
      const eventArg = linkProps.onClickLink.args[0][0];
      const infoArg = linkProps.onClickLink.args[0][1];
      expect(eventArg).to.be.an("object");
      expect(eventArg).to.have.property("target");
      expect(eventArg.target).to.be.an("object");
      expect(infoArg).to.be.an("object");
      expect(infoArg.link).to.equal(linkObj);
      expect(infoArg.graph).to.equal(linkProps.graph);
    });
  });

  describe("SankeyNodeLabel", () => {
    const basicNodeObj = {
      x0: 30,
      x1: 50,
      y0: 40,
      y1: 100,
      id: "lemons",
      name: "Sour Lemons"
    };
    it("renders a node label in a <text> element", () => {
      const label = mount(
        <SankeyNodeLabel
          {...{ node: basicNodeObj, nodeLabelText: () => "ok" }}
        />
      );
      const text = label.find("text");
      expect(text).to.have.length(1);
      expect(text.props().x).to.be.finite;
      expect(text.props().y).to.be.finite;
    });
    it("uses nodeLabelText accessor prop to create label text, falls back to nodeId if nodeLabelText not provided", () => {
      const labelWithName = mount(
        <SankeyNodeLabel
          {...{
            node: basicNodeObj,
            nodeLabelText: node => node.name,
            nodeId: node => node.id
          }}
        />
      );
      const textWithName = labelWithName.find("text");
      expect(textWithName).to.have.length(1);
      expect(textWithName.text()).to.equal("Sour Lemons");

      const labelWithId = mount(
        <SankeyNodeLabel
          {...{
            node: basicNodeObj,
            nodeId: node => node.id
          }}
        />
      );
      const textWithId = labelWithId.find("text");
      expect(textWithId).to.have.length(1);
      expect(textWithId.text()).to.equal("lemons");
    });
    it("renders nodeLabelText as-is (not wrapped in <text>), if it returns an element instead of string", () => {
      const label = mount(
        <SankeyNodeLabel
          {...{
            node: basicNodeObj,
            nodeLabelText: node => (
              <rect x={node.x0} y={node.y0} width={50} height={20} />
            )
          }}
        />
      );
      expect(label.find("text")).to.have.length(0);
      expect(label.find("rect")).to.have.length(1);
      expect(label.find("rect").props().width).to.equal(50);
    });

    it("passes nodeLabelClassName and nodeLabelStyle through to the text element", () => {
      const nodeLabelClassName = "my-fun-node-label";
      const nodeLabelStyle = { fill: "salmon" };
      const nodeLabelText = node => node.name;
      const label = mount(
        <SankeyNodeLabel
          {...{
            node: basicNodeObj,
            nodeLabelText,
            nodeLabelClassName,
            nodeLabelStyle
          }}
        />
      );
      const text = label.find("text");
      expect(text).to.have.length(1);
      expect(text.props().className).to.contain("my-fun-node-label");
      expect(text.props().style).to.be.an("object");
      expect(text.props().style.fill).to.equal("salmon");
    });
    it("calls nodeLabelClassName & nodeLabelStyle to get class & style, if they are functions", () => {
      const nodeLabelClassName = node => `node-label-${node.id}`;
      const nodeLabelStyle = node => ({
        fill: node.id === "lemons" ? "orange" : "purple"
      });
      const nodeLabelText = node => node.name;
      const label = mount(
        <SankeyNodeLabel
          {...{
            node: basicNodeObj,
            nodeLabelText,
            nodeLabelClassName,
            nodeLabelStyle
          }}
        />
      );
      const text = label.find("text");
      expect(text).to.have.length(1);
      expect(text.props().className).to.contain("node-label-lemons");
      expect(text.props().style).to.be.an("object");
      expect(text.props().style.fill).to.equal("orange");
    });
    it("uses nodeLabelPlacement to determine the label's position", () => {
      const nodeLabelText = node => node.name;
      const commonProps = { node: basicNodeObj, nodeLabelText };

      const labelBefore = mount(
        <SankeyNodeLabel
          {...{ ...commonProps, nodeLabelPlacement: "before" }}
        />
      );
      const labelBeforeText = labelBefore.find("text");
      expect(labelBeforeText.props().x).to.be.at.most(30);
      expect(labelBeforeText.props().y).to.equal(70);
      expect(labelBeforeText.props().style.alignmentBaseline).to.equal(
        "middle"
      );
      expect(labelBeforeText.props().style.textAnchor).to.equal("end");

      const labelAfter = mount(
        <SankeyNodeLabel {...{ ...commonProps, nodeLabelPlacement: "after" }} />
      );
      const labelAfterText = labelAfter.find("text");
      expect(labelAfterText.props().x).to.be.at.least(50);
      expect(labelAfterText.props().y).to.equal(70);
      expect(labelAfterText.props().style.alignmentBaseline).to.equal("middle");
      expect(labelAfterText.props().style.textAnchor).to.equal("start");

      const labelAbove = mount(
        <SankeyNodeLabel {...{ ...commonProps, nodeLabelPlacement: "above" }} />
      );
      const labelAboveText = labelAbove.find("text");
      expect(labelAboveText.props().x).to.equal(40);
      expect(labelAboveText.props().y).to.be.at.most(40);
      expect(labelAboveText.props().style.alignmentBaseline).to.equal(
        "baseline"
      );
      expect(labelAboveText.props().style.textAnchor).to.equal("middle");

      const labelBelow = mount(
        <SankeyNodeLabel {...{ ...commonProps, nodeLabelPlacement: "below" }} />
      );
      const labelBelowText = labelBelow.find("text");
      expect(labelBelowText.props().x).to.equal(40);
      expect(labelBelowText.props().y).to.be.at.least(100);
      expect(labelBelowText.props().style.alignmentBaseline).to.equal(
        "hanging"
      );
      expect(labelBelowText.props().style.textAnchor).to.equal("middle");

      const conditionalPlacement = node =>
        node.id === "lemons" ? "below" : "above";
      const labelConditional = mount(
        <SankeyNodeLabel
          {...{ ...commonProps, nodeLabelPlacement: conditionalPlacement }}
        />
      );
      // should resolve to 'below', so use same tests as 'below'
      const labelConditionalText = labelConditional.find("text");
      expect(labelConditionalText.props().x).to.equal(40);
      expect(labelConditionalText.props().y).to.be.at.least(100);
      expect(labelConditionalText.props().style.alignmentBaseline).to.equal(
        "hanging"
      );
      expect(labelConditionalText.props().style.textAnchor).to.equal("middle");
    });
    it("uses nodeLabelDistance to determine node label's distance from the node", () => {
      const nodeLabelText = node => node.name;
      const commonProps = {
        node: basicNodeObj,
        nodeLabelText,
        nodeLabelDistance: 9
      };

      const labelBefore = mount(
        <SankeyNodeLabel
          {...{ ...commonProps, nodeLabelPlacement: "before" }}
        />
      );
      const labelBeforeText = labelBefore.find("text");
      expect(labelBeforeText.props().x).to.equal(21);

      const labelAfter = mount(
        <SankeyNodeLabel {...{ ...commonProps, nodeLabelPlacement: "after" }} />
      );
      const labelAfterText = labelAfter.find("text");
      expect(labelAfterText.props().x).to.equal(59);

      const labelAbove = mount(
        <SankeyNodeLabel {...{ ...commonProps, nodeLabelPlacement: "above" }} />
      );
      const labelAboveText = labelAbove.find("text");
      expect(labelAboveText.props().y).to.equal(31);

      const labelBelow = mount(
        <SankeyNodeLabel {...{ ...commonProps, nodeLabelPlacement: "below" }} />
      );
      const labelBelowText = labelBelow.find("text");
      expect(labelBelowText.props().y).to.equal(109);

      const getDistance = node => 7;

      const labelDynamic = mount(
        <SankeyNodeLabel
          {...{
            ...commonProps,
            nodeLabelDistance: getDistance,
            nodeLabelPlacement: "below"
          }}
        />
      );
      const labelDynamicText = labelDynamic.find("text");
      expect(labelDynamicText.props().y).to.equal(107);
    });
  });

  describe("SankeyLinkLabel", () => {
    const basicLinkObj = { source: 2, target: 5, value: 99 };

    it("renders a link label", () => {
      const props = {
        link: basicLinkObj,
        linkPathId: "myLinkPath",
        linkLabelText: () => "r2d2"
      };
      const label = mount(<SankeyLinkLabel {...props} />);
      const text = label.find("text");
      expect(text).to.have.length(1);
      const textPath = text.find("textPath");
      expect(textPath).to.have.length(1);
      expect(textPath.text()).to.equal("r2d2");
      expect(textPath.props().xlinkHref).to.equal("#myLinkPath");
    });
    it("passes linkLabelClassName, linkLabelStyle & linkLabelAttributes through to the text element", () => {
      const props = {
        link: basicLinkObj,
        linkPathId: "myLinkPath",
        linkLabelText: () => "r2d2",
        linkLabelClassName: "link-zelda",
        linkLabelStyle: { fill: "orange" },
        linkLabelAttributes: { textAnchor: "end" }
      };
      const label = mount(<SankeyLinkLabel {...props} />);
      const text = label.find("text");
      expect(text).to.have.length(1);
      expect(text.props().className).to.contain("link-zelda");
      expect(text.props().style).to.be.an("object");
      expect(text.props().style.fill).to.equal("orange");
      expect(text.props().textAnchor).to.equal("end");
    });
    it("calls linkLabelClassName, linkLabelStyle & linkLabelAttributes if they are functions", () => {
      const props = {
        link: basicLinkObj,
        linkPathId: "myLinkPath",
        linkLabelText: () => "r2d2",
        linkLabelClassName: link => `link-${link.source}-${link.target}`,
        linkLabelStyle: () => ({ fill: "thistle" }),
        linkLabelAttributes: () => ({ textAnchor: "start" })
      };
      const label = mount(<SankeyLinkLabel {...props} />);
      const text = label.find("text");
      expect(text).to.have.length(1);
      expect(text.props().className).to.contain("link-2-5");
      expect(text.props().style).to.be.an("object");
      expect(text.props().style.fill).to.equal("thistle");
      expect(text.props().textAnchor).to.equal("start");
    });
    it("passes linkLabelStartOffset to the label's textPath as startOffset attribute", () => {
      const props = {
        link: basicLinkObj,
        linkPathId: "myLinkPath",
        linkLabelText: () => "r2d2",
        linkLabelStartOffset: "27%"
      };
      const label = mount(<SankeyLinkLabel {...props} />);
      const text = label.find("text");
      expect(text).to.have.length(1);
      const textPath = text.find("textPath");
      expect(textPath).to.have.length(1);
      expect(textPath.props().startOffset).to.equal("27%");
    });
  });
  // todo test terminals
  // test their properties & rendered correctly
});
