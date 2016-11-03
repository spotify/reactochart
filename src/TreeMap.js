import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

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

    let style = {position: 'absolute', width: dx, height: dy, top: y, left: x, transition: "all .2s"};
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
  componentWillMount() {
    // initialize the layout function
    this._treemap = initTreemapLayout(this.props);
    // clone the data because d3 mutates it!
    this._data = _.cloneDeep(this.props.data);
  }
  componentWillReceiveProps(newProps){
    const {width, height, data, sticky} = this.props;

    //if height, width, or the data changes, or if the treemap is not sticky, re-initialize the layout function
   // if(!sticky || width != newProps.width || height != newProps.height || JSON.stringify(data) != JSON.stringify(newProps.data))
   // {
      this._data = _.cloneDeep(newProps.data);
      this._treemap = initTreemapLayout(newProps);
    //}
  }
  render() {
    const {
      width, height, nodeStyle, labelStyle, getLabel, minLabelWidth, minLabelHeight,
      onClickNode, onMouseEnterNode, onMouseLeaveNode, onMouseMoveNode, NodeComponent, NodeLabelComponent, getValue
    } = this.props;

    
    // run the layout function with our data to create treemap layout
    const nodes =  this._treemap.value(makeAccessor(getValue)).nodes(this._data);

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

  const treemap = d3.layout.treemap()
    .size([width, height])
    .value(makeAccessor(getValue))
    ;

  if(!_.isUndefined(getChildren)) treemap.children(makeAccessor(getChildren));
  if(!_.isUndefined(sort)) treemap.sort(sort);
  if(!_.isUndefined(padding)) treemap.padding(padding);
  if(!_.isUndefined(round)) treemap.round(round);
  if(!_.isUndefined(sticky)) treemap.sticky(sticky);
  if(!_.isUndefined(mode)) treemap.mode(mode);
  if(!_.isUndefined(ratio)) treemap.ratio(ratio);

  return treemap;
}

export default TreeMap;
