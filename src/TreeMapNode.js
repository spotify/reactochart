import get from "lodash/get";
import kebabCase from "lodash/kebabCase";
import isFunction from "lodash/isFunction";
import isObject from "lodash/isObject";
import assign from "lodash/assign";
import PropTypes from "prop-types";
import React from "react";
import * as CustomPropTypes from "./utils/CustomPropTypes";

const TreeMapNode = props => {
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

  var parentName = get(parent, "data.name");
  const nodeGroupClass = parent
    ? `node-group-${kebabCase(parentName)} node-group-i-${parentNames.indexOf(
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
  const customStyle = isFunction(nodeStyle)
    ? nodeStyle(node)
    : isObject(nodeStyle)
      ? nodeStyle
      : {};
  assign(style, customStyle);

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

export default TreeMapNode;
