import React from 'react';
import _ from 'lodash';
import {mount} from 'enzyme';

// use rewire to test internal SankeyNode/Link/etc. components

const Sankey = require('../../../src/SankeyDiagram');
const SankeyDiagram = Sankey.default;
const SankeyNode = Sankey.__get__('SankeyNode');
const SankeyLink = Sankey.__get__('SankeyLink');
const SankeyNodeTerminal = Sankey.__get__('SankeyNodeTerminal');
const SankeyNodeLabel = Sankey.__get__('SankeyNodeLabel');
const SankeyLinkLabel = Sankey.__get__('SankeyLinkLabel');
const SankeyStepLabel = Sankey.__get__('SankeyStepLabel');

function getSampleData() {
  return {
    nodes: [
      { name: 'Apples' },
      { name: 'Bananas' },
      { name: 'Cherries' },
      { name: 'Dates' },
      { name: 'Elderberries' },
    ],
    links: [
      { source: 0, target: 2, value: 0.5 },
      { source: 0, target: 3, value: 0.5 },
      { source: 1, target: 2, value: 0.5 },
      { source: 1, target: 3, value: 0.5 },
      { source: 2, target: 4, value: 1 },
      { source: 3, target: 4, value: 1 },
    ],
  };
}

function getSampleDataWithId() {
  return {
    nodes: [
      { id: 'a', label: 'Apples' },
      { id: 'b', label: 'Bananas' },
      { id: 'c', label: 'Cherries' },
      { id: 'd', label: 'Dates' },
      { id: 'e', label: 'Elderberries' },
    ],
    links: [
      { source: 'a', target: 'c', value: 0.5 },
      { source: 'a', target: 'd', value: 0.5 },
      { source: 'b', target: 'c', value: 0.5 },
      { source: 'b', target: 'd', value: 0.5 },
      { source: 'c', target: 'e', value: 1 },
      { source: 'd', target: 'e', value: 1 },
    ],
  };
}

describe('SankeyDiagram', () => {
  it('renders a Sankey Diagram', () => {
    const { nodes, links } = getSampleData();
    const props = { width: 600, height: 400, nodes, links };
    const chart = mount(<SankeyDiagram {...props} />);
    const svg = chart.find('svg');
    expect(svg).toHaveLength(1);

    // todo check shouldClone
    // get sampleData again since it has been mutated by the component
    const sampleData = getSampleData();
    const sankeyNodes = chart.find(SankeyNode);
    const sankeyLinks = chart.find(SankeyLink);
    expect(sankeyNodes).toHaveLength(5);
    expect(sankeyLinks).toHaveLength(6);

    sankeyNodes.forEach((node, i) => {
      const nodeProps = node.props();
      expect(nodeProps.graph).toBeInstanceOf(Object);
      expect(nodeProps.node).toBeInstanceOf(Object);
      expect(Number.isFinite(nodeProps.node.index)).toBe(true);
      expect(nodeProps.node.index).toEqual(i);
      expect(typeof nodeProps.node.name).toBe('string');
      expect(nodeProps.node.name).toEqual(nodes[i].name);
      const sourceLinks = sampleData.links.filter(link => link.source === i);
      const targetLinks = sampleData.links.filter(link => link.target === i);
      expect(nodeProps.node.sourceLinks).toBeInstanceOf(Array);
      expect(nodeProps.node.sourceLinks).toHaveLength(sourceLinks.length);
      expect(nodeProps.node.targetLinks).toBeInstanceOf(Array);
      expect(nodeProps.node.targetLinks).toHaveLength(targetLinks.length);
      const expectedNodeValue = Math.max(
        _.sumBy(sourceLinks, l => l.value),
        _.sumBy(targetLinks, l => l.value),
      );
      expect(nodeProps.node.value).toEqual(expectedNodeValue);
      expect(Number.isFinite(nodeProps.node.x0)).toBe(true);
      expect(Number.isFinite(nodeProps.node.x1)).toBe(true);
      expect(nodeProps.node.x0).not.toEqual(nodeProps.node.x1);
      expect(Number.isFinite(nodeProps.node.y0)).toBe(true);
      expect(Number.isFinite(nodeProps.node.y1)).toBe(true);
      expect(nodeProps.node.y0).not.toEqual(nodeProps.node.y1);
    });
    expect(sankeyNodes.at(0).props().node.depth).toEqual(0);
    expect(sankeyNodes.at(2).props().node.depth).toEqual(1);
    expect(sankeyNodes.at(4).props().node.depth).toEqual(2);

    sankeyLinks.forEach((link, i) => {
      const linkProps = link.props();
      expect(linkProps.graph).toBeInstanceOf(Object);
      expect(typeof linkProps.linkPath).toBe('string');
      expect(linkProps.linkPath.length).toBeGreaterThan(2);
      expect(linkProps.linkPath).toContain('M');
      expect(linkProps.linkPath).toContain('C');
      expect(linkProps.link).toBeInstanceOf(Object);
      expect(Number.isFinite(linkProps.link.index)).toBe(true);
      expect(linkProps.link.index).toEqual(i);
      expect(linkProps.link.source).toBeInstanceOf(Object);
      expect(linkProps.link.source.index).toEqual(sampleData.links[i].source);
      expect(linkProps.link.target).toBeInstanceOf(Object);
      expect(linkProps.link.target.index).toEqual(sampleData.links[i].target);
      expect(Number.isFinite(linkProps.link.value)).toBe(true);
      expect(linkProps.link.value).toEqual(sampleData.links[i].value);
      expect(Number.isFinite(linkProps.link.width)).toBe(true);
      expect(linkProps.link.width).not.toEqual(0);
    });
  });

  it('passes width, height, style and className props through to the SVG', () => {
    const props = {
      ...getSampleData(),
      width: 600,
      height: 400,
      className: 'woof',
      style: { paddingLeft: 30 },
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const svg = chart.find('svg');
    expect(svg).toHaveLength(1);
    expect(svg.props().width).toEqual(600);
    expect(svg.props().height).toEqual(400);
    expect(svg.props().className).toContain('woof');
    expect(svg.props().style).toBeInstanceOf(Object);
    expect(svg.props().style.paddingLeft).toEqual(30);
  });

  it('uses shouldClone prop to determine whether to clone or mutate nodes/links data', () => {
    const dataToClone = getSampleData();
    const cloneProps = {
      ...dataToClone,
      width: 600,
      height: 400,
      shouldClone: true,
    };
    // mount Sankey and check that dataToClone is deeply equal to sample data
    mount(<SankeyDiagram {...cloneProps} />);
    expect(dataToClone).toEqual(getSampleData());

    const dataToMutate = getSampleData();
    const mutateProps = {
      ...dataToMutate,
      width: 600,
      height: 400,
      shouldClone: false,
    };
    // mount Sankey and check that dataToMutate is not deeply equal to sample data
    mount(<SankeyDiagram {...mutateProps} />);
    expect(dataToMutate).not.toEqual(getSampleData());
    expect(dataToMutate.links[0].source).toEqual(dataToMutate.nodes[0]);
  });

  it('uses nodeId accessor prop to determine node IDs', () => {
    const props = {
      width: 600,
      height: 400,
      ...getSampleDataWithId(),
      nodeId: node => node.id,
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const svg = chart.find('svg');
    expect(svg).toHaveLength(1);

    // get sampleData again since it has been mutated by the component
    const sampleData = getSampleDataWithId();
    const sankeyNodes = chart.find(SankeyNode);
    const sankeyLinks = chart.find(SankeyLink);
    expect(sankeyNodes).toHaveLength(5);
    expect(sankeyLinks).toHaveLength(6);

    sankeyNodes.forEach(node => {
      const nodeProps = node.props();
      expect(nodeProps.node).toBeInstanceOf(Object);
      const sourceLinks = sampleData.links.filter(
        link => link.source === nodeProps.node.id,
      );
      const targetLinks = sampleData.links.filter(
        link => link.target === nodeProps.node.id,
      );
      expect(nodeProps.node.sourceLinks).toBeInstanceOf(Array);
      expect(nodeProps.node.sourceLinks).toHaveLength(sourceLinks.length);
      expect(nodeProps.node.targetLinks).toBeInstanceOf(Array);
      expect(nodeProps.node.targetLinks).toHaveLength(targetLinks.length);
      const expectedNodeValue = Math.max(
        _.sumBy(sourceLinks, l => l.value),
        _.sumBy(targetLinks, l => l.value),
      );
      expect(nodeProps.node.value).toEqual(expectedNodeValue);
      expect(Number.isFinite(nodeProps.node.x0)).toBe(true);
      expect(Number.isFinite(nodeProps.node.x1)).toBe(true);
      expect(nodeProps.node.x0).not.toEqual(nodeProps.node.x1);
      expect(Number.isFinite(nodeProps.node.y0)).toBe(true);
      expect(Number.isFinite(nodeProps.node.y1)).toBe(true);
      expect(nodeProps.node.y0).not.toEqual(nodeProps.node.y1);
    });
    expect(sankeyNodes.at(0).props().node.depth).toEqual(0);
    expect(sankeyNodes.at(2).props().node.depth).toEqual(1);
    expect(sankeyNodes.at(4).props().node.depth).toEqual(2);

    sankeyLinks.forEach((link, i) => {
      const linkProps = link.props();
      expect(linkProps.graph).toBeInstanceOf(Object);
      expect(typeof linkProps.linkPath).toBe('string');
      expect(linkProps.linkPath.length).toBeGreaterThan(2);
      expect(linkProps.linkPath).toContain('M');
      expect(linkProps.linkPath).toContain('C');
      expect(linkProps.link).toBeInstanceOf(Object);
      expect(linkProps.link.source).toBeInstanceOf(Object);
      expect(linkProps.link.source.id).toEqual(sampleData.links[i].source);
      expect(linkProps.link.target).toBeInstanceOf(Object);
      expect(linkProps.link.target.id).toEqual(sampleData.links[i].target);
      expect(Number.isFinite(linkProps.link.value)).toBe(true);
      expect(linkProps.link.value).toEqual(sampleData.links[i].value);
      expect(Number.isFinite(linkProps.link.width)).toBe(true);
      expect(linkProps.link.width).not.toEqual(0);
    });
  });

  it('uses showNodes boolean or accessor prop to determine whether to render nodes', () => {
    const size = { width: 600, height: 400 };
    const showNodesProps = {
      ...size,
      ...getSampleData(),
      showNodes: true,
    };
    const showNodesChart = mount(<SankeyDiagram {...showNodesProps} />);
    expect(showNodesChart.find(SankeyNode)).toHaveLength(5);

    const hideNodesProps = {
      ...size,
      ...getSampleData(),
      showNodes: false,
    };
    const hideNodesChart = mount(<SankeyDiagram {...hideNodesProps} />);
    expect(hideNodesChart.find(SankeyNode)).toHaveLength(0);

    const showSomeNodesProps = {
      ...size,
      ...getSampleData(),
      showNodes: node => node.index < 3,
    };
    const showSomeNodesChart = mount(<SankeyDiagram {...showSomeNodesProps} />);
    expect(showSomeNodesChart.find(SankeyNode)).toHaveLength(3);
  });

  it('uses showLinks boolean or accessor prop to determine whether to render links', () => {
    const size = { width: 600, height: 400 };
    const showLinksProps = {
      ...size,
      ...getSampleData(),
      showLinks: true,
    };
    const showLinksChart = mount(<SankeyDiagram {...showLinksProps} />);
    expect(showLinksChart.find(SankeyLink)).toHaveLength(6);

    const hideLinksProps = {
      ...size,
      ...getSampleData(),
      showLinks: false,
    };
    const hideLinksChart = mount(<SankeyDiagram {...hideLinksProps} />);
    expect(hideLinksChart.find(SankeyLink)).toHaveLength(0);

    const showSomeLinksProps = {
      ...size,
      ...getSampleData(),
      showLinks: link => link.target.index === 2,
    };
    const showSomeLinksChart = mount(<SankeyDiagram {...showSomeLinksProps} />);
    expect(showSomeLinksChart.find(SankeyLink)).toHaveLength(2);
  });

  it('uses nodeWidth prop to control the width of the node rectangles', () => {
    const props = {
      ...getSampleData(),
      width: 600,
      height: 400,
      nodeWidth: 19,
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const sankeyNodes = chart.find(SankeyNode);
    expect(sankeyNodes).toHaveLength(5);

    sankeyNodes.forEach(node => {
      const nodeProps = node.props();
      expect(nodeProps.node).toBeInstanceOf(Object);
      expect(Number.isFinite(nodeProps.node.x0)).toBe(true);
      expect(Number.isFinite(nodeProps.node.x1)).toBe(true);
      expect(nodeProps.node.x1 - nodeProps.node.x0).toEqual(19);
      expect(Number.isFinite(nodeProps.node.y0)).toBe(true);
      expect(Number.isFinite(nodeProps.node.y1)).toBe(true);
      expect(nodeProps.node.y0).not.toEqual(nodeProps.node.y1);
    });
  });

  it('uses nodePadding to control vertical space between node rectangles', () => {
    const props = {
      ...getSampleData(),
      width: 600,
      height: 400,
      nodePadding: 37,
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const sankeyNodes = chart.find(SankeyNode);
    expect(sankeyNodes).toHaveLength(5);
    expect(
      sankeyNodes.at(1).props().node.y0 - sankeyNodes.at(0).props().node.y1,
    ).toEqual(37);
    expect(
      sankeyNodes.at(3).props().node.y0 - sankeyNodes.at(2).props().node.y1,
    ).toEqual(37);
  });

  // todo: test nodeAlignment? how?

  it('passes nodeClassName, nodeStyle and node mouse event handlers through to nodes', () => {
    const props = {
      ...getSampleData(),
      width: 600,
      height: 400,
      nodeClassName: 'doggo',
      nodeStyle: { fill: 'orange' },
      onMouseEnterNode: jest.fn(),
      onMouseLeaveNode: jest.fn(),
      onMouseMoveNode: jest.fn(),
      onMouseDownNode: jest.fn(),
      onMouseUpNode: jest.fn(),
      onClickNode: jest.fn(),
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const sankeyNodes = chart.find(SankeyNode);
    expect(sankeyNodes).toHaveLength(5);

    sankeyNodes.forEach(node => {
      const nodeProps = node.props();
      expect(nodeProps.nodeClassName).toEqual('doggo');
      expect(nodeProps.nodeStyle).toBeInstanceOf(Object);
      expect(nodeProps.nodeStyle.fill).toEqual('orange');
      expect(nodeProps.onMouseEnterNode).toEqual(props.onMouseEnterNode);
      expect(nodeProps.onMouseLeaveNode).toEqual(props.onMouseLeaveNode);
      expect(nodeProps.onMouseMoveNode).toEqual(props.onMouseMoveNode);
      expect(nodeProps.onMouseDownNode).toEqual(props.onMouseDownNode);
      expect(nodeProps.onMouseUpNode).toEqual(props.onMouseUpNode);
      expect(nodeProps.onClickNode).toEqual(props.onClickNode);
    });
  });

  it('passes linkClassName, linkStyle and link mouse event handlers through to nodes', () => {
    const props = {
      ...getSampleData(),
      width: 600,
      height: 400,
      linkClassName: 'kitten',
      linkStyle: { fill: 'tomato' },
      onMouseEnterLink: jest.fn(),
      onMouseLeaveLink: jest.fn(),
      onMouseMoveLink: jest.fn(),
      onMouseDownLink: jest.fn(),
      onMouseUpLink: jest.fn(),
      onClickLink: jest.fn(),
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const sankeyLinks = chart.find(SankeyLink);
    expect(sankeyLinks).toHaveLength(6);

    sankeyLinks.forEach(link => {
      const linkProps = link.props();
      expect(linkProps.linkClassName).toEqual('kitten');
      expect(linkProps.linkStyle).toBeInstanceOf(Object);
      expect(linkProps.linkStyle.fill).toEqual('tomato');
      expect(linkProps.onMouseEnterLink).toEqual(props.onMouseEnterLink);
      expect(linkProps.onMouseLeaveLink).toEqual(props.onMouseLeaveLink);
      expect(linkProps.onMouseMoveLink).toEqual(props.onMouseMoveLink);
      expect(linkProps.onMouseDownLink).toEqual(props.onMouseDownLink);
      expect(linkProps.onMouseUpLink).toEqual(props.onMouseUpLink);
      expect(linkProps.onClickLink).toEqual(props.onClickLink);
    });
  });

  it('passes stepLabelText, stepLabelClassName, stepLabelPadding and stepLabelStyle through to SankeyStepLabel', () => {
    const props = {
      ...getSampleData(),
      width: 600,
      height: 400,
      stepLabelText: 'text',
      stepLabelClassName: 'scoop',
      stepLabelStyle: { fill: 'orange' },
      stepLabelPadding: 16,
    };
    const chart = mount(<SankeyDiagram {...props} />);
    const sankeyStepLabels = chart.find(SankeyStepLabel);
    expect(sankeyStepLabels).toHaveLength(3);

    sankeyStepLabels.forEach(label => {
      const stepLabelProps = label.props();
      expect(stepLabelProps.stepLabelText).toEqual('text');
      expect(stepLabelProps.stepLabelClassName).toEqual('scoop');
      expect(stepLabelProps.stepLabelPadding).toEqual(16);
      expect(stepLabelProps.stepLabelStyle).toBeInstanceOf(Object);
      expect(stepLabelProps.stepLabelStyle.fill).toEqual('orange');
    });
  });

  it('uses showNodeLabels boolean or accessor prop to determine whether to render node labels', () => {
    const size = { width: 600, height: 400 };
    const showNodeLabelsProps = {
      ...size,
      ...getSampleData(),
      showNodeLabels: true,
    };
    const showNodeLabelsChart = mount(
      <SankeyDiagram {...showNodeLabelsProps} />,
    );
    expect(showNodeLabelsChart.find(SankeyNodeLabel)).toHaveLength(5);

    const hideNodeLabelsProps = {
      ...size,
      ...getSampleData(),
      showNodeLabels: false,
    };
    const hideNodeLabelsChart = mount(
      <SankeyDiagram {...hideNodeLabelsProps} />,
    );
    expect(hideNodeLabelsChart.find(SankeyNodeLabel)).toHaveLength(0);

    const showSomeNodeLabelsProps = {
      ...size,
      ...getSampleData(),
      showNodeLabels: node => node.index < 3,
    };
    const showSomeNodeLabelsChart = mount(
      <SankeyDiagram {...showSomeNodeLabelsProps} />,
    );
    expect(showSomeNodeLabelsChart.find(SankeyNodeLabel)).toHaveLength(3);
  });

  it('uses showLinkLabels boolean or accessor prop to determine whether to render link labels', () => {
    const size = { width: 600, height: 400 };
    const showLinkLabelsProps = {
      ...size,
      ...getSampleData(),
      showLinkLabels: true,
    };
    const showLinkLabelsChart = mount(
      <SankeyDiagram {...showLinkLabelsProps} />,
    );
    expect(showLinkLabelsChart.find(SankeyLinkLabel)).toHaveLength(6);

    const hideLinkLabelsProps = {
      ...size,
      ...getSampleData(),
      showLinkLabels: false,
    };
    const hideLinkLabelsChart = mount(
      <SankeyDiagram {...hideLinkLabelsProps} />,
    );
    expect(hideLinkLabelsChart.find(SankeyLinkLabel)).toHaveLength(0);

    const showSomeLinkLabelsProps = {
      ...size,
      ...getSampleData(),
      showLinkLabels: link => link.target.index === 2,
    };
    const showSomeLinkLabelsChart = mount(
      <SankeyDiagram {...showSomeLinkLabelsProps} />,
    );
    expect(showSomeLinkLabelsChart.find(SankeyLinkLabel)).toHaveLength(2);
  });

  it('uses stepLabelText text or accessor prop to determine whether to render SankeyStepLabels', () => {
    const size = { width: 600, height: 400 };
    const stepLabelsProps = {
      ...size,
      ...getSampleData(),
      stepLabelText: step => `Step: ${step}`,
    };
    const stepLabelsChart = mount(<SankeyDiagram {...stepLabelsProps} />);
    expect(stepLabelsChart.find(SankeyStepLabel)).toHaveLength(3);
  });

  describe('SankeyNode', () => {
    const basicNodeObj = {
      index: 5,
      x0: 30,
      x1: 50,
      y0: 25,
      y1: 100,
    };
    it('renders a rectangle with the position & size of the current node', () => {
      const node = mount(<SankeyNode {...{ node: basicNodeObj }} />);
      const rect = node.find('rect');
      expect(rect).toHaveLength(1);
      expect(rect.props().x).toEqual(30);
      expect(rect.props().y).toEqual(25);
      expect(rect.props().width).toEqual(20);
      expect(rect.props().height).toEqual(75);
      expect(rect.props().className).toContain('sankey-node');
    });
    it('passes nodeClassName and nodeStyle through to the node rectangle element', () => {
      const className = 'foo-bar-node';
      const style = { fill: 'coral' };
      const nodeProps = {
        node: basicNodeObj,
        nodeClassName: className,
        nodeStyle: style,
      };
      const node = mount(<SankeyNode {...nodeProps} />);
      const rect = node.find('rect');
      expect(rect.props().className).toContain(className);
      expect(rect.props().style).toBeInstanceOf(Object);
      expect(rect.props().style.fill).toEqual('coral');
    });
    it('calls nodeClassName & nodeStyle to get class & style, if they are functions', () => {
      const className = node => `i-${node.index}-x0-${node.x0}`;
      const style = node => ({ strokeWidth: `${node.x1}px` });
      const nodeProps = {
        node: basicNodeObj,
        nodeClassName: className,
        nodeStyle: style,
      };
      const node = mount(<SankeyNode {...nodeProps} />);
      const rect = node.find('rect');
      expect(rect.props().className).toContain('i-5-x0-30');
      expect(rect.props().style).toBeInstanceOf(Object);
      expect(rect.props().style.strokeWidth).toEqual('50px');
    });
    it('attaches mouse event handlers (enter, leave, move, down, up, click) to the node rectangle', () => {
      const nodeProps = {
        node: basicNodeObj,
        graph: { nodes: [], links: [] },
        onMouseEnterNode: jest.fn(),
        onMouseLeaveNode: jest.fn(),
        onMouseMoveNode: jest.fn(),
        onMouseDownNode: jest.fn(),
        onMouseUpNode: jest.fn(),
        onClickNode: jest.fn(),
      };
      const node = mount(<SankeyNode {...nodeProps} />);
      const rect = node.find('rect');

      expect(rect.props().onMouseEnter).toBeInstanceOf(Function);
      expect(rect.props().onMouseLeave).toBeInstanceOf(Function);
      expect(rect.props().onMouseMove).toBeInstanceOf(Function);
      expect(rect.props().onMouseDown).toBeInstanceOf(Function);
      expect(rect.props().onMouseUp).toBeInstanceOf(Function);
      expect(rect.props().onClick).toBeInstanceOf(Function);

      expect(nodeProps.onMouseEnterNode).not.toHaveBeenCalled();
      rect.simulate('mouseenter');
      expect(nodeProps.onMouseEnterNode).toHaveBeenCalled();
      expect(nodeProps.onMouseLeaveNode).not.toHaveBeenCalled();
      rect.simulate('mouseleave');
      expect(nodeProps.onMouseLeaveNode).toHaveBeenCalled();
      expect(nodeProps.onMouseMoveNode).not.toHaveBeenCalled();
      rect.simulate('mousemove');
      expect(nodeProps.onMouseMoveNode).toHaveBeenCalled();
      expect(nodeProps.onMouseDownNode).not.toHaveBeenCalled();
      rect.simulate('mousedown');
      expect(nodeProps.onMouseDownNode).toHaveBeenCalled();
      expect(nodeProps.onMouseUpNode).not.toHaveBeenCalled();
      rect.simulate('mouseup');
      expect(nodeProps.onMouseUpNode).toHaveBeenCalled();
      expect(nodeProps.onClickNode).not.toHaveBeenCalled();
      rect.simulate('click');
      expect(nodeProps.onClickNode).toHaveBeenCalled();

      // make sure callbacks are called with (event, {link, graph})
      expect(nodeProps.onClickNode.mock.calls[0]).toHaveLength(2);
      const eventArg = nodeProps.onClickNode.mock.calls[0][0];
      const infoArg = nodeProps.onClickNode.mock.calls[0][1];
      expect(eventArg).toBeInstanceOf(Object);
      expect(eventArg).toHaveProperty('target');
      // SVG <rects> are treated as HTMLUnknownElement since jsdom doesn't support SVG
      expect(eventArg.target.constructor.name).toBe('HTMLUnknownElement');
      expect(infoArg).toBeInstanceOf(Object);
      expect(infoArg.node).toEqual(basicNodeObj);
      expect(infoArg.graph).toEqual(nodeProps.graph);
    });
  });

  describe('SankeyLink', () => {
    const linkPath = 'M10 10';
    const linkObj = { width: 20 };
    it('renders a link path', () => {
      const link = mount(<SankeyLink {...{ link: linkObj, linkPath }} />);
      const path = link.find('path');
      expect(path).toHaveLength(1);
      expect(path.props().d).toEqual(linkPath);
      expect(path.props().style).toBeInstanceOf(Object);
      expect(path.props().style.strokeWidth).toEqual(20);
    });
    it('passes linkClassName and linkStyle through to the path element', () => {
      const linkClassName = 'foo-bar-link';
      const linkStyle = { fill: 'thistle' };
      const link = mount(
        <SankeyLink
          {...{ link: linkObj, linkPath, linkClassName, linkStyle }}
        />,
      );
      const path = link.find('path');
      expect(path.props().className).toContain(linkClassName);
      expect(path.props().style).toBeInstanceOf(Object);
      expect(path.props().style.fill).toEqual('thistle');
    });
    it('calls linkClassName & linkStyle to get class & style, if they are functions', () => {
      const linkClassName = link => `w-${link.width}`;
      const linkStyle = link => ({ borderWidth: link.width });
      const linkProps = { link: linkObj, linkClassName, linkStyle };
      const link = mount(<SankeyLink {...linkProps} />);
      const path = link.find('path');
      expect(path.props().className).toContain('w-20');
      expect(path.props().style).toBeInstanceOf(Object);
      expect(path.props().style.borderWidth).toEqual(20);
    });
    it('attaches mouse event handlers (enter, leave, move, down, up, click) to the link path', () => {
      const linkProps = {
        link: linkObj,
        graph: { nodes: [], links: [] },
        onMouseEnterLink: jest.fn(),
        onMouseLeaveLink: jest.fn(),
        onMouseMoveLink: jest.fn(),
        onMouseDownLink: jest.fn(),
        onMouseUpLink: jest.fn(),
        onClickLink: jest.fn(),
      };
      const link = mount(<SankeyLink {...linkProps} />);
      const path = link.find('path');

      expect(path.props().onMouseEnter).toBeInstanceOf(Function);
      expect(path.props().onMouseLeave).toBeInstanceOf(Function);
      expect(path.props().onMouseMove).toBeInstanceOf(Function);
      expect(path.props().onMouseDown).toBeInstanceOf(Function);
      expect(path.props().onMouseUp).toBeInstanceOf(Function);
      expect(path.props().onClick).toBeInstanceOf(Function);

      expect(linkProps.onMouseEnterLink).not.toHaveBeenCalled();
      path.simulate('mouseenter');
      expect(linkProps.onMouseEnterLink).toHaveBeenCalled();
      expect(linkProps.onMouseLeaveLink).not.toHaveBeenCalled();
      path.simulate('mouseleave');
      expect(linkProps.onMouseLeaveLink).toHaveBeenCalled();
      expect(linkProps.onMouseMoveLink).not.toHaveBeenCalled();
      path.simulate('mousemove');
      expect(linkProps.onMouseMoveLink).toHaveBeenCalled();
      expect(linkProps.onMouseDownLink).not.toHaveBeenCalled();
      path.simulate('mousedown');
      expect(linkProps.onMouseDownLink).toHaveBeenCalled();
      expect(linkProps.onMouseUpLink).not.toHaveBeenCalled();
      path.simulate('mouseup');
      expect(linkProps.onMouseUpLink).toHaveBeenCalled();
      expect(linkProps.onClickLink).not.toHaveBeenCalled();
      path.simulate('click');
      expect(linkProps.onClickLink).toHaveBeenCalled();

      // make sure callbacks are called with (event, {link, graph})
      expect(linkProps.onClickLink.mock.calls[0]).toHaveLength(2);
      const eventArg = linkProps.onClickLink.mock.calls[0][0];
      const infoArg = linkProps.onClickLink.mock.calls[0][1];
      expect(eventArg).toBeInstanceOf(Object);
      expect(eventArg).toHaveProperty('target');
      // SVG <rects> are treated as HTMLUnknownElement since jsdom doesn't support SVG
      expect(eventArg.target.constructor.name).toBe('HTMLUnknownElement');
      expect(infoArg).toBeInstanceOf(Object);
      expect(infoArg.link).toEqual(linkObj);
      expect(infoArg.graph).toEqual(linkProps.graph);
    });
  });

  describe('SankeyNodeLabel', () => {
    const basicNodeObj = {
      x0: 30,
      x1: 50,
      y0: 40,
      y1: 100,
      id: 'lemons',
      name: 'Sour Lemons',
    };
    it('renders a node label in a <text> element', () => {
      const label = mount(
        <SankeyNodeLabel
          {...{ node: basicNodeObj, nodeLabelText: () => 'ok' }}
        />,
      );
      const text = label.find('text');
      expect(text).toHaveLength(1);
      expect(Number.isFinite(text.props().x)).toBe(true);
      expect(Number.isFinite(text.props().y)).toBe(true);
    });
    it('uses nodeLabelText accessor prop to create label text, falls back to nodeId if nodeLabelText not provided', () => {
      const labelWithName = mount(
        <SankeyNodeLabel
          {...{
            node: basicNodeObj,
            nodeLabelText: node => node.name,
            nodeId: node => node.id,
          }}
        />,
      );
      const textWithName = labelWithName.find('text');
      expect(textWithName).toHaveLength(1);
      expect(textWithName.text()).toEqual('Sour Lemons');

      const labelWithId = mount(
        <SankeyNodeLabel
          {...{
            node: basicNodeObj,
            nodeId: node => node.id,
          }}
        />,
      );
      const textWithId = labelWithId.find('text');
      expect(textWithId).toHaveLength(1);
      expect(textWithId.text()).toEqual('lemons');
    });
    it('renders nodeLabelText as-is (not wrapped in <text>), if it returns an element instead of string', () => {
      const label = mount(
        <SankeyNodeLabel
          {...{
            node: basicNodeObj,
            nodeLabelText: node => (
              <rect x={node.x0} y={node.y0} width={50} height={20} />
            ),
          }}
        />,
      );
      expect(label.find('text')).toHaveLength(0);
      expect(label.find('rect')).toHaveLength(1);
      expect(label.find('rect').props().width).toEqual(50);
    });

    it('passes nodeLabelClassName and nodeLabelStyle through to the text element', () => {
      const nodeLabelClassName = 'my-fun-node-label';
      const nodeLabelStyle = { fill: 'salmon' };
      const nodeLabelText = node => node.name;
      const label = mount(
        <SankeyNodeLabel
          {...{
            node: basicNodeObj,
            nodeLabelText,
            nodeLabelClassName,
            nodeLabelStyle,
          }}
        />,
      );
      const text = label.find('text');
      expect(text).toHaveLength(1);
      expect(text.props().className).toContain('my-fun-node-label');
      expect(text.props().style).toBeInstanceOf(Object);
      expect(text.props().style.fill).toEqual('salmon');
    });
    it('calls nodeLabelClassName & nodeLabelStyle to get class & style, if they are functions', () => {
      const nodeLabelClassName = node => `node-label-${node.id}`;
      const nodeLabelStyle = node => ({
        fill: node.id === 'lemons' ? 'orange' : 'purple',
      });
      const nodeLabelText = node => node.name;
      const label = mount(
        <SankeyNodeLabel
          {...{
            node: basicNodeObj,
            nodeLabelText,
            nodeLabelClassName,
            nodeLabelStyle,
          }}
        />,
      );
      const text = label.find('text');
      expect(text).toHaveLength(1);
      expect(text.props().className).toContain('node-label-lemons');
      expect(text.props().style).toBeInstanceOf(Object);
      expect(text.props().style.fill).toEqual('orange');
    });
    it("uses nodeLabelPlacement to determine the label's position", () => {
      const nodeLabelText = node => node.name;
      const commonProps = { node: basicNodeObj, nodeLabelText };

      const labelBefore = mount(
        <SankeyNodeLabel
          {...{ ...commonProps, nodeLabelPlacement: 'before' }}
        />,
      );
      const labelBeforeText = labelBefore.find('text');
      expect(labelBeforeText.props().x).toBeLessThanOrEqual(30);
      expect(labelBeforeText.props().y).toEqual(70);
      expect(labelBeforeText.props().style.alignmentBaseline).toEqual(
        'middle',
      );
      expect(labelBeforeText.props().style.textAnchor).toEqual('end');

      const labelAfter = mount(
        <SankeyNodeLabel
          {...{ ...commonProps, nodeLabelPlacement: 'after' }}
        />,
      );
      const labelAfterText = labelAfter.find('text');
      expect(labelAfterText.props().x).toBeGreaterThanOrEqual(50);
      expect(labelAfterText.props().y).toEqual(70);
      expect(labelAfterText.props().style.alignmentBaseline).toEqual('middle');
      expect(labelAfterText.props().style.textAnchor).toEqual('start');

      const labelAbove = mount(
        <SankeyNodeLabel
          {...{ ...commonProps, nodeLabelPlacement: 'above' }}
        />,
      );
      const labelAboveText = labelAbove.find('text');
      expect(labelAboveText.props().x).toEqual(40);
      expect(labelAboveText.props().y).toBeLessThanOrEqual(40);
      expect(labelAboveText.props().style.alignmentBaseline).toEqual(
        'baseline',
      );
      expect(labelAboveText.props().style.textAnchor).toEqual('middle');

      const labelBelow = mount(
        <SankeyNodeLabel
          {...{ ...commonProps, nodeLabelPlacement: 'below' }}
        />,
      );
      const labelBelowText = labelBelow.find('text');
      expect(labelBelowText.props().x).toEqual(40);
      expect(labelBelowText.props().y).toBeGreaterThanOrEqual(100);
      expect(labelBelowText.props().style.alignmentBaseline).toEqual(
        'hanging',
      );
      expect(labelBelowText.props().style.textAnchor).toEqual('middle');

      const conditionalPlacement = node =>
        node.id === 'lemons' ? 'below' : 'above';
      const labelConditional = mount(
        <SankeyNodeLabel
          {...{ ...commonProps, nodeLabelPlacement: conditionalPlacement }}
        />,
      );
      // should resolve to 'below', so use same tests as 'below'
      const labelConditionalText = labelConditional.find('text');
      expect(labelConditionalText.props().x).toEqual(40);
      expect(labelConditionalText.props().y).toBeGreaterThanOrEqual(100);
      expect(labelConditionalText.props().style.alignmentBaseline).toEqual(
        'hanging',
      );
      expect(labelConditionalText.props().style.textAnchor).toEqual('middle');
    });
    it("uses nodeLabelDistance to determine node label's distance from the node", () => {
      const nodeLabelText = node => node.name;
      const commonProps = {
        node: basicNodeObj,
        nodeLabelText,
        nodeLabelDistance: 9,
      };

      const labelBefore = mount(
        <SankeyNodeLabel
          {...{ ...commonProps, nodeLabelPlacement: 'before' }}
        />,
      );
      const labelBeforeText = labelBefore.find('text');
      expect(labelBeforeText.props().x).toEqual(21);

      const labelAfter = mount(
        <SankeyNodeLabel
          {...{ ...commonProps, nodeLabelPlacement: 'after' }}
        />,
      );
      const labelAfterText = labelAfter.find('text');
      expect(labelAfterText.props().x).toEqual(59);

      const labelAbove = mount(
        <SankeyNodeLabel
          {...{ ...commonProps, nodeLabelPlacement: 'above' }}
        />,
      );
      const labelAboveText = labelAbove.find('text');
      expect(labelAboveText.props().y).toEqual(31);

      const labelBelow = mount(
        <SankeyNodeLabel
          {...{ ...commonProps, nodeLabelPlacement: 'below' }}
        />,
      );
      const labelBelowText = labelBelow.find('text');
      expect(labelBelowText.props().y).toEqual(109);

      const getDistance = () => 7;

      const labelDynamic = mount(
        <SankeyNodeLabel
          {...{
            ...commonProps,
            nodeLabelDistance: getDistance,
            nodeLabelPlacement: 'below',
          }}
        />,
      );
      const labelDynamicText = labelDynamic.find('text');
      expect(labelDynamicText.props().y).toEqual(107);
    });
  });

  describe('SankeyLinkLabel', () => {
    const basicLinkObj = { source: 2, target: 5, value: 99 };

    it('renders a link label', () => {
      const props = {
        link: basicLinkObj,
        linkPathId: 'myLinkPath',
        linkLabelText: () => 'r2d2',
      };
      const label = mount(<SankeyLinkLabel {...props} />);
      const text = label.find('text');
      expect(text).toHaveLength(1);
      const textPath = text.find('textPath');
      expect(textPath).toHaveLength(1);
      expect(textPath.text()).toEqual('r2d2');
      expect(textPath.props().xlinkHref).toEqual('#myLinkPath');
    });
    it('passes linkLabelClassName, linkLabelStyle & linkLabelAttributes through to the text element', () => {
      const props = {
        link: basicLinkObj,
        linkPathId: 'myLinkPath',
        linkLabelText: () => 'r2d2',
        linkLabelClassName: 'link-zelda',
        linkLabelStyle: { fill: 'orange' },
        linkLabelAttributes: { textAnchor: 'end' },
      };
      const label = mount(<SankeyLinkLabel {...props} />);
      const text = label.find('text');
      expect(text).toHaveLength(1);
      expect(text.props().className).toContain('link-zelda');
      expect(text.props().style).toBeInstanceOf(Object);
      expect(text.props().style.fill).toEqual('orange');
      expect(text.props().textAnchor).toEqual('end');
    });
    it('calls linkLabelClassName, linkLabelStyle & linkLabelAttributes if they are functions', () => {
      const props = {
        link: basicLinkObj,
        linkPathId: 'myLinkPath',
        linkLabelText: () => 'r2d2',
        linkLabelClassName: link => `link-${link.source}-${link.target}`,
        linkLabelStyle: () => ({ fill: 'thistle' }),
        linkLabelAttributes: () => ({ textAnchor: 'start' }),
      };
      const label = mount(<SankeyLinkLabel {...props} />);
      const text = label.find('text');
      expect(text).toHaveLength(1);
      expect(text.props().className).toContain('link-2-5');
      expect(text.props().style).toBeInstanceOf(Object);
      expect(text.props().style.fill).toEqual('thistle');
      expect(text.props().textAnchor).toEqual('start');
    });
    it("passes linkLabelStartOffset to the label's textPath as startOffset attribute", () => {
      const props = {
        link: basicLinkObj,
        linkPathId: 'myLinkPath',
        linkLabelText: () => 'r2d2',
        linkLabelStartOffset: '27%',
      };
      const label = mount(<SankeyLinkLabel {...props} />);
      const text = label.find('text');
      expect(text).toHaveLength(1);
      const textPath = text.find('textPath');
      expect(textPath).toHaveLength(1);
      expect(textPath.props().startOffset).toEqual('27%');
    });
  });

  describe('SankeyStepLabel', () => {
    const step = 0;

    it('renders a step label', () => {
      const props = {
        step,
        x: 100,
        y: 100,
        stepLabelText: () => 'r2d2',
      };
      const label = mount(<SankeyStepLabel {...props} />);

      const text = label.find('text');
      expect(text).toHaveLength(1);
      expect(Number.isFinite(text.props().x)).toBe(true);
      expect(Number.isFinite(text.props().y)).toBe(true);
      expect(text.text()).toEqual('r2d2');
    });
    it('uses stepLabelText accessor prop to create label text', () => {
      const labelWithName = mount(
        <SankeyStepLabel
          {...{
            step,
            stepLabelText: currentStep => currentStep,
          }}
        />,
      );
      const textWithName = labelWithName.find('text');
      expect(textWithName).toHaveLength(1);
      expect(textWithName.text()).toEqual('0');
    });
    it('passes stepLabelClassName & stepLabelStyle through to the text element', () => {
      const props = {
        step,
        stepLabelText: () => 'r2d2',
        stepLabelClassName: 'link-zelda',
        stepLabelStyle: { fill: 'orange' },
      };
      const label = mount(<SankeyStepLabel {...props} />);
      const text = label.find('text');
      expect(text).toHaveLength(1);
      expect(text.props().className).toContain('link-zelda');
      expect(text.props().style).toBeInstanceOf(Object);
      expect(text.props().style.fill).toEqual('orange');
    });
    it('calls stepLabelClassName & stepLabelStyle if they are functions', () => {
      const props = {
        step,
        stepLabelText: () => 'r2d2',
        stepLabelClassName: currentStep => `step-${currentStep}`,
        stepLabelStyle: () => ({ fill: 'thistle' }),
      };
      const label = mount(<SankeyStepLabel {...props} />);
      const text = label.find('text');
      expect(text).toHaveLength(1);
      expect(text.props().className).toContain('step-0');
      expect(text.props().style).toBeInstanceOf(Object);
      expect(text.props().style.fill).toEqual('thistle');
    });
  });

  describe('SankeyNodeTerminal', () => {
    const basicNodeObj = {
      index: 5,
      x0: 30,
      x1: 50,
      y0: 25,
      y1: 100,
      terminalValue: 10,
    };
    const nodeTerminalProps = {
      node: basicNodeObj,
      graph: { nodes: [], links: [] },
      nodeTerminalWidth: 5,
      nodeTerminalDistance: 1,
      nodeTerminalStyle: { stroke: 'blue' },
      nodeTerminalClassName: 'merpy',
      nodeTerminalAttributes: { rx: 3, ry: 3 },
      onMouseEnterNodeTerminal: jest.fn(),
      onMouseLeaveNodeTerminal: jest.fn(),
      onMouseMoveNodeTerminal: jest.fn(),
      onMouseDownNodeTerminal: jest.fn(),
      onMouseUpNodeTerminal: jest.fn(),
      onClickNodeTerminal: jest.fn(),
    };

    it('renders nothing when terminalValue is falsey', () => {
      const nodeTerminal = mount(
        <SankeyNodeTerminal {...{ ...nodeTerminalProps, node: {} }} />,
      );
      const rect = nodeTerminal.find('rect');
      expect(rect).toHaveLength(0);
    });

    it('renders a rect with passed in props', () => {
      const nodeTerminal = mount(<SankeyNodeTerminal {...nodeTerminalProps} />);
      const rect = nodeTerminal.find('rect');
      expect(rect).toHaveLength(1);
      expect(rect.props()).toHaveProperty('x');
      expect(rect.props()).toHaveProperty('y');
      expect(rect.props().style).toEqual(nodeTerminalProps.nodeTerminalStyle);
      expect(rect.props().className).toContain(
        nodeTerminalProps.nodeTerminalClassName,
      );
      expect(rect.props().attributes).toEqual(nodeTerminalProps.attributes);
    });

    it('attaches mouse event handlers (enter, leave, move, down, up, click) to the link path', () => {
      const nodeTerminal = mount(<SankeyNodeTerminal {...nodeTerminalProps} />);
      const rect = nodeTerminal.find('rect');

      expect(rect.props().onMouseEnter).toBeInstanceOf(Function);
      expect(rect.props().onMouseLeave).toBeInstanceOf(Function);
      expect(rect.props().onMouseMove).toBeInstanceOf(Function);
      expect(rect.props().onMouseDown).toBeInstanceOf(Function);
      expect(rect.props().onMouseUp).toBeInstanceOf(Function);
      expect(rect.props().onClick).toBeInstanceOf(Function);

      expect(nodeTerminalProps.onMouseEnterNodeTerminal).not.toHaveBeenCalled();
      rect.simulate('mouseenter');
      expect(nodeTerminalProps.onMouseEnterNodeTerminal).toHaveBeenCalled();
      expect(nodeTerminalProps.onMouseLeaveNodeTerminal).not.toHaveBeenCalled();
      rect.simulate('mouseleave');
      expect(nodeTerminalProps.onMouseLeaveNodeTerminal).toHaveBeenCalled();
      expect(nodeTerminalProps.onMouseMoveNodeTerminal).not.toHaveBeenCalled();
      rect.simulate('mousemove');
      expect(nodeTerminalProps.onMouseMoveNodeTerminal).toHaveBeenCalled();
      expect(nodeTerminalProps.onMouseDownNodeTerminal).not.toHaveBeenCalled();
      rect.simulate('mousedown');
      expect(nodeTerminalProps.onMouseDownNodeTerminal).toHaveBeenCalled();
      expect(nodeTerminalProps.onMouseUpNodeTerminal).not.toHaveBeenCalled();
      rect.simulate('mouseup');
      expect(nodeTerminalProps.onMouseUpNodeTerminal).toHaveBeenCalled();
      expect(nodeTerminalProps.onClickNodeTerminal).not.toHaveBeenCalled();
      rect.simulate('click');
      expect(nodeTerminalProps.onClickNodeTerminal).toHaveBeenCalled();

      // make sure callbacks are called with (event, {node, graph})
      expect(nodeTerminalProps.onClickNodeTerminal.mock.calls[0]).toHaveLength(2);
      const eventArg = nodeTerminalProps.onClickNodeTerminal.mock.calls[0][0];
      const infoArg = nodeTerminalProps.onClickNodeTerminal.mock.calls[0][1];
      expect(eventArg).toBeInstanceOf(Object);
      expect(eventArg).toHaveProperty('target');
      // SVG <rects> are treated as HTMLUnknownElement since jsdom doesn't support SVG
      expect(eventArg.target.constructor.name).toBe('HTMLUnknownElement');
      expect(infoArg).toBeInstanceOf(Object);
      expect(infoArg.node).toEqual(basicNodeObj);
      expect(infoArg.graph).toEqual(nodeTerminalProps.graph);
    });
  });
});
