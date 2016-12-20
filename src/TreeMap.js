import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import {treemap} from 'd3-hierarchy';

import {makeAccessor} from './utils/Data';
import * as CustomPropTypes from './utils/CustomPropTypes';

class TreeMapNode extends React.Component {
  static propTypes = {
    node: PropTypes.shape({
      parent: PropTypes.object,
      children: PropTypes.array,
      value: PropTypes.number,
      depth: PropTypes.number,
      x: PropTypes.number,
      y: PropTypes.number,
      dx: PropTypes.number,
      dy: PropTypes.number
    }),
    nodeStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    minLabelWidth: PropTypes.number,
    minLabelHeight: PropTypes.number,

    getLabel: CustomPropTypes.getter,
    labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    NodeLabelComponent: PropTypes.func
  };
  static defaultProps = {
    minLabelWidth: 0,
    minLabelHeight: 0
  };

  render() {
    const {node, getLabel, nodeStyle, labelStyle, minLabelWidth, minLabelHeight, NodeLabelComponent, parentNames}
      = this.props;
    const {x, y, dx, dy, depth, parent} = node;

    const nodeGroupClass = parent ?
      `node-group-${_.kebabCase(parent.name)} node-group-i-${parentNames.indexOf(parent.name)}` : '';
    const className = `tree-map-node node-depth-${depth} ${nodeGroupClass}`;

    let style = {position: 'absolute', width: dx, height: dy, top: y, left: x};
    const customStyle = _.isFunction(nodeStyle) ? nodeStyle(node) : (_.isObject(nodeStyle) ? nodeStyle : {});
    _.assign(style, customStyle);

    let handlers = ['onClick', 'onMouseEnter', 'onMouseLeave', 'onMouseMove'].reduce((handlers, eventName) => {
      const handler = this.props[`${eventName}Node`];
      if(handler) handlers[eventName] = handler.bind(null, node);
      return handlers;
    }, {});

    return <div {...{className, style}} {...handlers}>
      {dx > minLabelWidth && dy > minLabelHeight ? // show label if node is big enough
        <NodeLabelComponent {...{node, getLabel, labelStyle}} />
        : null
      }
    </div>;
  }
}

class TreeMapNodeLabel extends React.Component {
  static propTypes = {
    node: PropTypes.object,
    getLabel: CustomPropTypes.getter,
    labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    minLabelWidth: PropTypes.number,
    minLabelHeight: PropTypes.number
  };

  render() {
    const {node, getLabel, labelStyle} = this.props;
    const {x, y, dx, dy} = node;

    let style = {width: dx};
    const customStyle = _.isFunction(labelStyle) ? labelStyle(node) : (_.isObject(labelStyle) ? labelStyle : {});
    _.assign(style, customStyle);

    return <div className="node-label" {...{style}}>
      {makeAccessor(getLabel)(node)}
    </div>
  }
}

class TreeMap extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,

    data: PropTypes.object.isRequired,
    getValue: CustomPropTypes.getter,
    getChildren: CustomPropTypes.getter,
    getLabel: CustomPropTypes.getter,

    // options for d3 treemap layout - see d3 docs
    sort: PropTypes.func,
    padding: PropTypes.number,
    round: PropTypes.bool,
    sticky: PropTypes.bool,
    mode: PropTypes.string,
    ratio: PropTypes.number,

    nodeStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    minLabelWidth: PropTypes.number,
    minLabelHeight: PropTypes.number,

    onClickNode: PropTypes.func,
    onMouseEnterNode: PropTypes.func,
    onMouseLeaveNode: PropTypes.func,
    onMouseMoveNode: PropTypes.func,

    NodeComponent: PropTypes.func,
    NodeLabelComponent: PropTypes.func
  };
  static defaultProps = {
    getValue: 'value',
    getChildren: 'children',
    getLabel: 'name',
    minLabelWidth: 0,
    minLabelHeight: 0,
    NodeComponent: TreeMapNode,
    NodeLabelComponent: TreeMapNodeLabel
  };

  render() {
    const {
      width, height, nodeStyle, labelStyle, getLabel, minLabelWidth, minLabelHeight,
      onClickNode, onMouseEnterNode, onMouseLeaveNode, onMouseMoveNode, NodeComponent, NodeLabelComponent
    } = this.props;

    // clone the data because d3 mutates it!
    const data = _.cloneDeep(this.props.data);
    // initialize the layout function
    const treemap = initTreemapLayout(this.props);
    // run the layout function with our data to create treemap layout
    const nodes = treemap.nodes(data);

    const style = {position: 'relative', width, height};

    const parentNames = _.uniq(_.map(nodes, 'parent.name'));

    return <div className="tree-map" {...{style}}>
      {nodes.map((node, i) => <NodeComponent {...{
        node, nodeStyle, minLabelWidth, minLabelHeight, labelStyle, getLabel, parentNames,
        NodeLabelComponent, onClickNode, onMouseEnterNode, onMouseLeaveNode, onMouseMoveNode,
        key: `node-${i}`
      }} />)}
    </div>;
  }
}

function initTreemapLayout(options) {
  // create a d3 treemap layout function,
  // and configure it with the given options
  const {width, height, getValue, getChildren, sort, padding, round, sticky, mode, ratio} = options;

  const treemapLayout = treemap()
    .size([width, height])
    .value(makeAccessor(getValue));

  if(!_.isUndefined(getChildren)) treemapLayout.children(makeAccessor(getChildren));
  if(!_.isUndefined(sort)) treemapLayout.sort(sort);
  if(!_.isUndefined(padding)) treemapLayout.padding(padding);
  if(!_.isUndefined(round)) treemapLayout.round(round);
  if(!_.isUndefined(sticky)) treemapLayout.sticky(sticky);
  if(!_.isUndefined(mode)) treemapLayout.mode(mode);
  if(!_.isUndefined(ratio)) treemapLayout.ratio(ratio);

  return treemapLayout;
}

export default TreeMap;
