import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import {hierarchy, treemap, treemapResquarify} from 'd3-hierarchy';

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
    const {depth, parent, x0, y0, x1, y1} = node;

    var parentName = _.get(parent, 'data.name');
    const nodeGroupClass = parent ?
      `node-group-${_.kebabCase(parentName)} node-group-i-${parentNames.indexOf(parentName)}` : '';
    const className = `tree-map-node node-depth-${depth} ${nodeGroupClass}`;

    let style = {position: 'absolute', width: (x1 - x0), height: (y1 - y0), top: y0, left: x0, transition: "all .2s"};
    const customStyle = _.isFunction(nodeStyle) ? nodeStyle(node) : (_.isObject(nodeStyle) ? nodeStyle : {});
    _.assign(style, customStyle);

    let handlers = ['onClick', 'onMouseEnter', 'onMouseLeave', 'onMouseMove'].reduce((handlers, eventName) => {
      const handler = this.props[`${eventName}Node`];
      if(handler) handlers[eventName] = handler.bind(null, node);
      return handlers;
    }, {});

    return <div {...{className, style}} {...handlers}>
      {(x1 - x0) > minLabelWidth && (y1 - y0) > minLabelHeight ? // show label if node is big enough
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
    const {x1, x0} = node;
    let style = {width: (x1 - x0)};
    const customStyle = _.isFunction(labelStyle) ? labelStyle(node) : (_.isObject(labelStyle) ? labelStyle : {});
    _.assign(style, customStyle);

    return <div className="node-label" {...{style}}>
      {makeAccessor(getLabel)(node.data)}
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
    const {data} = this.props;
    // initialize the layout function
    this._tree = getTree(this.props);
    // clone the data because d3 mutates it!
    this._rootNode = getRootNode(_.cloneDeep(data), this.props);
  }
  componentWillReceiveProps(newProps){
    const {width, height, data, sticky} = this.props;

   // if height, width, or the data changes, or if the treemap is not sticky, re-initialize the layout function
   if(!sticky || width != newProps.width || height != newProps.height || JSON.stringify(data) != JSON.stringify(newProps.data))
   {
      this._tree = getTree(newProps);
      this._rootNode = getRootNode(_.cloneDeep(newProps.data), this.props);
    }
  }
  render() {
    const {
      width, height, nodeStyle, labelStyle, getLabel, minLabelWidth, minLabelHeight,
      onClickNode, onMouseEnterNode, onMouseLeaveNode, onMouseMoveNode, NodeComponent, NodeLabelComponent, getValue
    } = this.props;

    const nodes = initTreemap(this._rootNode, this._tree, this.props);

    const style = {position: 'relative', width, height};

    const parentNames = _.uniq(_.map(nodes, 'parent.data.name'));

    return <div className="tree-map" {...{style}}>
      {nodes.map((node, i) => <NodeComponent {...{
        node, nodeStyle, minLabelWidth, minLabelHeight, labelStyle, getLabel, parentNames,
        NodeLabelComponent, onClickNode, onMouseEnterNode, onMouseLeaveNode, onMouseMoveNode,
        key: `node-${i}`
      }} />)}
    </div>;
  }
}

function getRootNode(data, options){
  const {getChildren} = options;
  return hierarchy(data, makeAccessor(getChildren));
}

function getTree(options) {
  const {width, height, ratio, round, padding} = options;
  const tiling = !_.isUndefined(ratio) ? treemapResquarify.ratio(ratio) : treemapResquarify;
  const tree = treemap().tile(tiling).size([width, height]);
  if(!_.isUndefined(padding)) tree.paddingOuter(padding);
  if(!_.isUndefined(round)) tree.round(round);
  return tree;
}

function initTreemap(rootNode, tree, options) {
  // create a d3 treemap layout function,
  // and configure it with the given options
  const {getValue, sort} = options;
  const treeRoot = rootNode
                .sum(d => {
                  if(_.isFunction(getValue)) return getValue(d);
                  else if(_.isString(getValue)) return d[getValue];
                  else return 0;
  });
  return tree(sort ? treeRoot.sort(sort) : treeRoot).descendants();
}

export default TreeMap;
