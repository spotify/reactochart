import { hierarchy, treemap, treemapResquarify } from "d3-hierarchy";
import cloneDeep from "lodash/cloneDeep";
import uniq from "lodash/uniq";
import map from "lodash/map";
import isUndefined from "lodash/isUndefined";
import isFunction from "lodash/isFunction";
import isString from "lodash/isString";
import PropTypes from "prop-types";
import React from "react";
import * as CustomPropTypes from "./utils/CustomPropTypes";
import { makeAccessor } from "./utils/Data";
import TreeMapNode from "./TreeMapNode";
import TreeMapNodeLabel from "./TreeMapNodeLabel";

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
    this._rootNode = getRootNode(cloneDeep(data), this.props);
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
      this._rootNode = getRootNode(cloneDeep(newProps.data), this.props);
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
      NodeLabelComponent
    } = this.props;

    const nodes = initTreemap(this._rootNode, this._tree, this.props);

    const style = { position: "relative", width, height };

    const parentNames = uniq(map(nodes, "parent.data.name"));

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
  const tiling = !isUndefined(ratio)
    ? treemapResquarify.ratio(ratio)
    : treemapResquarify;
  const tree = treemap()
    .tile(tiling)
    .size([width, height]);
  if (!isUndefined(padding)) tree.paddingOuter(padding);
  if (!isUndefined(round)) tree.round(round);
  return tree;
}

function initTreemap(rootNode, tree, options) {
  // create a d3 treemap layout function,
  // and configure it with the given options
  const { getValue, sort } = options;
  const treeRoot = rootNode.sum(d => {
    if (isFunction(getValue)) return getValue(d);
    else if (isString(getValue)) return d[getValue];
    else return 0;
  });
  return tree(sort ? treeRoot.sort(sort) : treeRoot).descendants();
}

export default TreeMap;
