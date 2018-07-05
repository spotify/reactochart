import { hierarchy, treemap, treemapResquarify } from "d3-hierarchy";
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import * as CustomPropTypes from "./utils/CustomPropTypes";
import { makeAccessor } from "./utils/Data";

export const TreeMapNode = props => {
  const {
    node,
    getLabel,
    nodeStyle,
    labelStyle,
    minLabelWidth,
    minLabelHeight,
    NodeLabelComponent,
    parentNames
  } = props;
  const { depth, parent, x0, y0, x1, y1 } = node;

  var parentName = _.get(parent, "data.name");
  const nodeGroupClass = parent
    ? `node-group-${_.kebabCase(parentName)} node-group-i-${parentNames.indexOf(
        parentName
      )}`
    : "";
  const className = `rct-tree-map-node node-depth-${depth} ${nodeGroupClass}`;

  let style = {
    position: "absolute",
    width: x1 - x0,
    height: y1 - y0,
    top: y0,
    left: x0,
    transition: "all .2s"
  };
  const customStyle = _.isFunction(nodeStyle)
    ? nodeStyle(node)
    : _.isObject(nodeStyle)
      ? nodeStyle
      : {};
  _.assign(style, customStyle);

  let handlers = [
    "onClick",
    "onMouseEnter",
    "onMouseLeave",
    "onMouseMove"
  ].reduce((handlers, eventName) => {
    const handler = props[`${eventName}Node`];
    if (handler) handlers[eventName] = handler.bind(null, node);
    return handlers;
  }, {});

  return (
    <div {...{ className, style }} {...handlers}>
      {x1 - x0 > minLabelWidth && y1 - y0 > minLabelHeight ? ( // show label if node is big enough
        <NodeLabelComponent {...{ node, getLabel, labelStyle }} />
      ) : null}
    </div>
  );
};

TreeMapNode.propTypes = {
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

TreeMapNode.defaultProps = {
  minLabelWidth: 0,
  minLabelHeight: 0
};

export const TreeMapNodeLabel = props => {
  const { node, getLabel, labelStyle } = props;
  const { x1, x0 } = node;
  let style = { width: x1 - x0 };
  const customStyle = _.isFunction(labelStyle)
    ? labelStyle(node)
    : _.isObject(labelStyle)
      ? labelStyle
      : {};
  _.assign(style, customStyle);

  return (
    <div className="rct-node-label" {...{ style }}>
      {makeAccessor(getLabel)(node)}
    </div>
  );
};

TreeMapNodeLabel.propTypes = {
  node: PropTypes.object,
  getLabel: CustomPropTypes.getter,
  labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  minLabelWidth: PropTypes.number,
  minLabelHeight: PropTypes.number
};

/**
 * `TreeMap` displays hierarchical data where a leaf node's rectangle has an area proportional to a specified dimension of the data.
 */
class TreeMap extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,

    data: PropTypes.object.isRequired,
    /**
     * Key or accessor to retrieve value of data point
     */
    getValue: CustomPropTypes.getter,
    /**
     * Key or accessor to retrieve children of data point
     */
    getChildren: CustomPropTypes.getter,
    /**
     * Key or accessor to retrieve label for given Node
     */
    getLabel: CustomPropTypes.getter,

    /**
     * Function passed in to sort nodes
     */
    sort: PropTypes.func,
    // options for d3 treemap layout - see d3 docs
    /**
     * See d3 docs for treemap - Adds outer and inner padding to tree
     */
    padding: PropTypes.number,
    /**
     * See d3 docs for treemap - Enables or disables rounding
     */
    round: PropTypes.bool,
    /**
     * If sticky, on data change the TreeMap will not force a recreation of the tree and animate data changes.
     * Otherwise we recreate the tree given its new props
     */
    sticky: PropTypes.bool,
    /**
     * Sets the desired aspect ratio of the generated rectangles
     */
    ratio: PropTypes.number,

    /**
     * Inline style object applied to each Node,
     * or accessor function which returns a style object
     */
    nodeStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    /**
     * Inline style object applied to each Label,
     * or accessor function which returns a style object
     */
    labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    minLabelWidth: PropTypes.number,
    minLabelHeight: PropTypes.number,

    /**
     * `onClick` event handler callback, called when user clicks a NodeComponent.
     */
    onClickNode: PropTypes.func,
    /**
     * `mouseenter` event handler callback, called when user's mouse enters a NodeComponent.
     */
    onMouseEnterNode: PropTypes.func,
    /**
     * `mouseleave` event handler callback, called when user's mouse leaves a NodeComponent.
     */
    onMouseLeaveNode: PropTypes.func,
    /**
     * `mousemove` event handler callback, called when user's mouse moves within a NodeComponent.
     */
    onMouseMoveNode: PropTypes.func,

    /**
     * Optional treemap node, otherwise we default to our TreeMapNode component
     */
    NodeComponent: PropTypes.func,
    /**
     * Optional treemap node label, otherwise we default to our TreeMapNodeLabel component
     */
    NodeLabelComponent: PropTypes.func
  };
  static defaultProps = {
    getValue: "value",
    getChildren: "children",
    getLabel: "name",
    minLabelWidth: 0,
    minLabelHeight: 0,
    NodeComponent: TreeMapNode,
    NodeLabelComponent: TreeMapNodeLabel
  };
  componentWillMount() {
    const { data } = this.props;
    // initialize the layout function
    this._tree = getTree(this.props);
    // clone the data because d3 mutates it!
    this._rootNode = getRootNode(_.cloneDeep(data), this.props);
  }
  componentWillReceiveProps(newProps) {
    const { width, height, data, sticky } = this.props;

    // if height, width, or the data changes, or if the treemap is not sticky, re-initialize the layout function
    // todo reevaluate this logic
    if (
      !sticky ||
      width != newProps.width ||
      height != newProps.height ||
      JSON.stringify(data) != JSON.stringify(newProps.data)
    ) {
      this._tree = getTree(newProps);
      this._rootNode = getRootNode(_.cloneDeep(newProps.data), this.props);
    }
  }
  render() {
    const {
      width,
      height,
      nodeStyle,
      labelStyle,
      getLabel,
      minLabelWidth,
      minLabelHeight,
      onClickNode,
      onMouseEnterNode,
      onMouseLeaveNode,
      onMouseMoveNode,
      NodeComponent,
      NodeLabelComponent,
      getValue
    } = this.props;

    const nodes = initTreemap(this._rootNode, this._tree, this.props);

    const style = { position: "relative", width, height };

    const parentNames = _.uniq(_.map(nodes, "parent.data.name"));

    return (
      <div className="rct-tree-map" {...{ style }}>
        {nodes.map((node, i) => (
          <NodeComponent
            {...{
              node,
              nodeStyle,
              minLabelWidth,
              minLabelHeight,
              labelStyle,
              getLabel,
              parentNames,
              NodeLabelComponent,
              onClickNode,
              onMouseEnterNode,
              onMouseLeaveNode,
              onMouseMoveNode,
              key: `node-${i}`
            }}
          />
        ))}
      </div>
    );
  }
}

function getRootNode(data, options) {
  const { getChildren } = options;
  return hierarchy(data, makeAccessor(getChildren));
}

function getTree(options) {
  const { width, height, ratio, round, padding } = options;
  const tiling = !_.isUndefined(ratio)
    ? treemapResquarify.ratio(ratio)
    : treemapResquarify;
  const tree = treemap()
    .tile(tiling)
    .size([width, height]);
  if (!_.isUndefined(padding)) tree.paddingOuter(padding);
  if (!_.isUndefined(round)) tree.round(round);
  return tree;
}

function initTreemap(rootNode, tree, options) {
  // create a d3 treemap layout function,
  // and configure it with the given options
  const { getValue, sort } = options;
  const treeRoot = rootNode.sum(d => {
    if (_.isFunction(getValue)) return getValue(d);
    else if (_.isString(getValue)) return d[getValue];
    else return 0;
  });
  return tree(sort ? treeRoot.sort(sort) : treeRoot).descendants();
}

export default TreeMap;
