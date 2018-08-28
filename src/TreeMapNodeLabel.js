import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import * as CustomPropTypes from "./utils/CustomPropTypes";
import { makeAccessor } from "./utils/Data";

const TreeMapNodeLabel = props => {
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

export default TreeMapNodeLabel;
