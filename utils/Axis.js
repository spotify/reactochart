"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAxisChildProps = getAxisChildProps;
exports.getMouseAxisOptions = getMouseAxisOptions;

var _Scale = require("./Scale");

var _invariant = _interopRequireDefault(require("invariant"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAxisChildProps(props) {
  const {
    width,
    height,
    xScale,
    yScale,
    spacingTop,
    spacingBottom,
    spacingLeft,
    spacingRight,
    position,
    placement,
    ticks,
    tickCount,
    tickLength,
    tickClassName,
    tickStyle,
    title,
    titleDistance,
    titleAlign,
    titleRotate,
    titleStyle,
    labelDistance,
    labelClassName,
    labelStyle,
    labelFormat,
    labelFormats,
    labelOffset,
    labels,
    gridLineClassName,
    gridLineStyle,
    onMouseEnterLabel,
    onMouseMoveLabel,
    onMouseLeaveLabel,
    onMouseClickLabel
  } = props;
  const ticksProps = {
    width,
    height,
    xScale,
    yScale,
    ticks,
    tickCount,
    spacingTop,
    spacingBottom,
    spacingLeft,
    spacingRight,
    position,
    placement,
    tickLength,
    tickStyle,
    tickClassName
  };
  const gridProps = {
    width,
    height,
    xScale,
    yScale,
    ticks,
    tickCount,
    spacingTop,
    spacingBottom,
    spacingLeft,
    spacingRight,
    lineClassName: gridLineClassName,
    lineStyle: gridLineStyle
  };
  const labelsProps = {
    width,
    height,
    xScale,
    yScale,
    ticks,
    tickCount,
    spacingTop,
    spacingBottom,
    spacingLeft,
    spacingRight,
    position,
    placement,
    labels,
    labelClassName,
    labelStyle,
    distance: labelDistance,
    format: labelFormat,
    formats: labelFormats,
    offset: labelOffset,
    onMouseEnterLabel,
    onMouseMoveLabel,
    onMouseLeaveLabel,
    onMouseClickLabel
  };
  const titleProps = {
    width,
    height,
    position,
    placement,
    title,
    spacingTop,
    spacingBottom,
    spacingLeft,
    spacingRight,
    style: titleStyle,
    distance: titleDistance,
    alignment: titleAlign,
    rotate: titleRotate
  };
  return {
    ticksProps,
    gridProps,
    labelsProps,
    titleProps
  };
}

function getMouseAxisOptions(axisType, event, scale) {
  (0, _invariant.default)(axisType === "x" || axisType === "y", "axisType should be either x or y.");
  const axisBoundingBox = event.currentTarget.getBoundingClientRect();
  const scaleType = (0, _Scale.inferScaleType)(scale);
  const outerY = Math.round(event.clientY - axisBoundingBox.top);
  const outerX = Math.round(event.clientX - axisBoundingBox.left);
  const isYAxis = axisType === "y";
  const mousePos = isYAxis ? outerY : outerX;
  const boundingBoxLimit = isYAxis ? axisBoundingBox.height : axisBoundingBox.width;
  const value = !_lodash.default.inRange(mousePos, 0, boundingBoxLimit) ? null : scaleType === "ordinal" ? (0, _Scale.invertPointScale)(scale, mousePos) : scale.invert(mousePos);
  const mouseOptions = {
    event,
    outerX,
    outerY
  };

  if (isYAxis) {
    mouseOptions.yValue = value;
    mouseOptions.yScale = scale;
  } else {
    mouseOptions.xValue = value;
    mouseOptions.xScale = scale;
  }

  return mouseOptions;
}
//# sourceMappingURL=Axis.js.map