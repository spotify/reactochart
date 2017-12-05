import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import {mount, shallow} from 'enzyme';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const {expect} = chai;

import {SankeyDiagram} from '../../../src/index.js';
import {SankeyNode, SankeyLink} from '../../../src/SankeyDiagram';


describe('SankeyNode', () => {
  const basicNodeObj = {
    x0: 30, x1: 50,
    y0: 25, y1: 100
  };
  it('renders a rectangle with the position & size of the current node', () => {
    const node = mount(<SankeyNode {...{node: basicNodeObj}}/>);
    const rect = node.find('rect');
    expect(rect).to.have.length(1);
    expect(rect.props().x).to.equal(30);
    expect(rect.props().y).to.equal(25);
    expect(rect.props().width).to.equal(20);
    expect(rect.props().height).to.equal(75);
    expect(rect.props().className).to.contain('sankey-node');
  });
  it('passes nodeClassName and nodeStyle through to the node rectangle element', () => {
    const className = "foo-bar-node";
    const style = {fill: 'coral'};
    const nodeProps = {node: basicNodeObj, nodeClassName: className, nodeStyle: style};
    const node = mount(<SankeyNode {...nodeProps}/>);
    const rect = node.find('rect');
    expect(rect.props().className).to.contain(className);
    expect(rect.props().style).to.be.an('object');
    expect(rect.props().style.fill).to.equal('coral');
  });
  it('calls nodeClassName & nodeStyle to get class & style, if they are functions', () => {
    const className = (node, nodeIndex) => `i-${nodeIndex}-x0-${node.x0}`;
    const style = (node, nodeIndex) => ({strokeWidth: `${node.x1}px`});
    const nodeProps = {node: basicNodeObj, nodeIndex: 5, nodeClassName: className, nodeStyle: style};
    const node = mount(<SankeyNode {...nodeProps}/>);
    const rect = node.find('rect');
    expect(rect.props().className).to.contain('i-5-x0-30');
    expect(rect.props().style).to.be.an('object');
    expect(rect.props().style.strokeWidth).to.equal('50px');
  });
  it('attaches mouse event handlers (enter, leave, move, down, up, click) to the node rectangle', () => {
    const nodeProps = {
      node: basicNodeObj,
      nodeIndex: 3,
      graph: {nodes: [], links: []},
      onMouseEnterNode: sinon.spy(),
      onMouseLeaveNode: sinon.spy(),
      onMouseMoveNode: sinon.spy(),
      onMouseDownNode: sinon.spy(),
      onMouseUpNode: sinon.spy(),
      onClickNode: sinon.spy()
    };
    const node = mount(<SankeyNode {...nodeProps}/>);
    const rect = node.find('rect');

    expect(rect.props().onMouseEnter).to.be.a('function');
    expect(rect.props().onMouseLeave).to.be.a('function');
    expect(rect.props().onMouseMove).to.be.a('function');
    expect(rect.props().onMouseDown).to.be.a('function');
    expect(rect.props().onMouseUp).to.be.a('function');
    expect(rect.props().onClick).to.be.a('function');

    expect(nodeProps.onMouseEnterNode).not.to.have.been.called;
    rect.simulate('mouseenter');
    expect(nodeProps.onMouseEnterNode).to.have.been.called;
    expect(nodeProps.onMouseLeaveNode).not.to.have.been.called;
    rect.simulate('mouseleave');
    expect(nodeProps.onMouseLeaveNode).to.have.been.called;
    expect(nodeProps.onMouseMoveNode).not.to.have.been.called;
    rect.simulate('mousemove');
    expect(nodeProps.onMouseMoveNode).to.have.been.called;
    expect(nodeProps.onMouseDownNode).not.to.have.been.called;
    rect.simulate('mousedown');
    expect(nodeProps.onMouseDownNode).to.have.been.called;
    expect(nodeProps.onMouseUpNode).not.to.have.been.called;
    rect.simulate('mouseup');
    expect(nodeProps.onMouseUpNode).to.have.been.called;
    expect(nodeProps.onClickNode).not.to.have.been.called;
    rect.simulate('click');
    expect(nodeProps.onClickNode).to.have.been.called;

    // make sure callbacks are called with (event, {link, linkIndex, graph})
    expect(nodeProps.onClickNode.args[0]).to.have.length(2);
    const eventArg = nodeProps.onClickNode.args[0][0];
    const infoArg = nodeProps.onClickNode.args[0][1];
    expect(eventArg).to.be.an('object');
    expect(eventArg).to.have.property('target');
    expect(eventArg.target).to.be.an('object');
    expect(infoArg).to.be.an('object');
    expect(infoArg.node).to.equal(basicNodeObj);
    expect(infoArg.nodeIndex).to.equal(nodeProps.nodeIndex);
    expect(infoArg.graph).to.equal(nodeProps.graph);
  });
});

describe('SankeyLink', () => {
  const linkPath = "M10 10";
  const linkObj = {width: 20};
  it('renders a link path', () => {
    const link = mount(<SankeyLink {...{link: linkObj, linkPath}}/>);
    const path = link.find('path');
    expect(path).to.have.length(1);
    expect(path.props().d).to.equal(linkPath);
    expect(path.props().style).to.be.an('object');
    expect(path.props().style.strokeWidth).to.equal(20);
  });
  it('passes linkClassName and linkStyle through to the path element', () => {
    const linkClassName = "foo-bar-link";
    const linkStyle = {fill: 'thistle'};
    const link = mount(<SankeyLink {...{link: linkObj, linkPath, linkClassName, linkStyle}}/>);
    const path = link.find('path');
    expect(path.props().className).to.contain(linkClassName);
    expect(path.props().style).to.be.an('object');
    expect(path.props().style.fill).to.equal('thistle');
  });
  it('calls linkClassName & linkStyle to get class & style, if they are functions', () => {
    const linkClassName = (link, linkIndex) => `i-${linkIndex}-w-${link.width}`;
    const linkStyle = (link, linkIndex) => ({borderWidth: link.width});
    const linkProps = {link: linkObj, linkIndex: 6, linkClassName, linkStyle};
    const link = mount(<SankeyLink {...linkProps}/>);
    const path = link.find('path');
    expect(path.props().className).to.contain('i-6-w-20');
    expect(path.props().style).to.be.an('object');
    expect(path.props().style.borderWidth).to.equal(20);
  });
  it('attaches mouse event handlers (enter, leave, move, down, up, click) to the link path', () => {
    const linkProps = {
      link: linkObj,
      linkIndex: 9,
      graph: {nodes: [], links: []},
      onMouseEnterLink: sinon.spy(),
      onMouseLeaveLink: sinon.spy(),
      onMouseMoveLink: sinon.spy(),
      onMouseDownLink: sinon.spy(),
      onMouseUpLink: sinon.spy(),
      onClickLink: sinon.spy()
    };
    const link = mount(<SankeyLink {...linkProps}/>);
    const path = link.find('path');

    expect(path.props().onMouseEnter).to.be.a('function');
    expect(path.props().onMouseLeave).to.be.a('function');
    expect(path.props().onMouseMove).to.be.a('function');
    expect(path.props().onMouseDown).to.be.a('function');
    expect(path.props().onMouseUp).to.be.a('function');
    expect(path.props().onClick).to.be.a('function');

    expect(linkProps.onMouseEnterLink).not.to.have.been.called;
    path.simulate('mouseenter');
    expect(linkProps.onMouseEnterLink).to.have.been.called;
    expect(linkProps.onMouseLeaveLink).not.to.have.been.called;
    path.simulate('mouseleave');
    expect(linkProps.onMouseLeaveLink).to.have.been.called;
    expect(linkProps.onMouseMoveLink).not.to.have.been.called;
    path.simulate('mousemove');
    expect(linkProps.onMouseMoveLink).to.have.been.called;
    expect(linkProps.onMouseDownLink).not.to.have.been.called;
    path.simulate('mousedown');
    expect(linkProps.onMouseDownLink).to.have.been.called;
    expect(linkProps.onMouseUpLink).not.to.have.been.called;
    path.simulate('mouseup');
    expect(linkProps.onMouseUpLink).to.have.been.called;
    expect(linkProps.onClickLink).not.to.have.been.called;
    path.simulate('click');
    expect(linkProps.onClickLink).to.have.been.called;

    // make sure callbacks are called with (event, {link, linkIndex, graph})
    expect(linkProps.onClickLink.args[0]).to.have.length(2);
    const eventArg = linkProps.onClickLink.args[0][0];
    const infoArg = linkProps.onClickLink.args[0][1];
    expect(eventArg).to.be.an('object');
    expect(eventArg).to.have.property('target');
    expect(eventArg.target).to.be.an('object');
    expect(infoArg).to.be.an('object');
    expect(infoArg.link).to.equal(linkObj);
    expect(infoArg.linkIndex).to.equal(linkProps.linkIndex);
    expect(infoArg.graph).to.equal(linkProps.graph);
  })
});

describe('SankeyDiagram', () => {
  it('renders a Sankey Diagram', () => {
    const {nodes, links} = getSampleData();
    const props = {
      width: 600, height: 400,
      nodes, links,
      nodeWidth: 10,
      nodePadding: 10,
      nodeAlignment: 'left'
    };
    const chart = mount(<SankeyDiagram {...props} />)
    const paths = chart.find('path');
    // paths.forEach(path => console.log(path.props));
  })
});

function getSampleData() {
  return {
    nodes: [
      {name: "Apples"},
      {name: "Bananas"},
      {name: "Cherries"},
      {name: "Dates"},
      {name: "Elderberries"},
    ],
    links: [
      {source: 0, target: 2, value: 0.5},
      {source: 0, target: 3, value: 0.5},
      {source: 1, target: 2, value: 0.5},
      {source: 1, target: 3, value: 0.5},
      {source: 2, target: 4, value: 1}
    ]
  }
}

function getSampleDataWithId() {
  return {
    nodes: [
      {id: 'a', label: "Apples"},
      {id: 'b', label: "Bananas"},
      {id: 'c', label: "Cherries"},
      {id: 'd', label: "Dates"},
      {id: 'e', label: "Elderberries"},
    ],
    links: [
      {source: 'a', target: 'c', value: 0.5},
      {source: 'a', target: 'd', value: 0.5},
      {source: 'b', target: 'c', value: 0.5},
      {source: 'b', target: 'd', value: 0.5},
      {source: 'c', target: 'e', value: 1},
    ]
  }
}
