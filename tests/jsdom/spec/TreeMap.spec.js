import React from 'react';
import _ from 'lodash';
import { mount } from 'enzyme';

import { TreeMap } from '../../../src';
import TreeMapNode from '../../../src/TreeMapNode.js';
import TreeMapNodeLabel from '../../../src/TreeMapNodeLabel.js';

describe('TreeMap', () => {
  const data = {
    children: _.range(1, 5).map(n => ({
      size: n * 5,
      name: `Name: ${n}`,
    })),
  };

  const props = {
    data,
    nodeStyle: { border: '1px solid #333' },
    getLabel: d => d.name,
    getValue: d => d.size,
    onClickNode: jest.fn(),
    onMouseEnterNode: jest.fn(),
    onMouseLeaveNode: jest.fn(),
    onMouseMoveNode: jest.fn(),
    width: 400,
    height: 500,
  };

  it('passes props correctly to nodes', () => {
    const chart = mount(<TreeMap {...props} />);
    const nodes = chart.find(TreeMapNode);

    nodes.forEach(node => {
      expect(node.props().nodeStyle.border).toEqual(props.nodeStyle.border);
    });
  });

  it('renders correct amount of nodes and labels', () => {
    const chart = mount(<TreeMap {...props} />);
    const nodes = chart.find(TreeMapNode);

    expect(nodes).toHaveLength(5);

    nodes.forEach(node => {
      expect(node.find(TreeMapNodeLabel)).toHaveLength(1);
    });
  });

  it('recreates tree when sticky is false, and keeps tree when true', () => {
    let chart = mount(<TreeMap {...props} />);
    let tree = chart.instance().state.tree;

    chart.setProps({ data });
    expect(tree).not.toEqual(chart.instance().state.tree);

    chart = mount(<TreeMap {...props} sticky />);
    tree = chart.instance().state.tree;
    chart.setProps({ data });
    expect(tree).toEqual(chart.instance().state.tree);
  });

  it('triggers event handlers', () => {
    const chart = mount(<TreeMap {...props} />);
    const nodes = chart.find(TreeMapNode);

    expect(props.onMouseMoveNode).not.toHaveBeenCalled();
    nodes.at(1).simulate('mousemove');
    expect(props.onMouseMoveNode).toHaveBeenCalled();
    expect(props.onMouseEnterNode).not.toHaveBeenCalled();
    nodes.at(1).simulate('mouseenter');
    expect(props.onMouseEnterNode).toHaveBeenCalled();
    expect(props.onMouseLeaveNode).not.toHaveBeenCalled();
    nodes.at(1).simulate('mouseleave');
    expect(props.onMouseLeaveNode).toHaveBeenCalled();
  });
});
