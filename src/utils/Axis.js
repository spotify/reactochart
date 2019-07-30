import { inferScaleType, invertPointScale } from "./Scale";
import invariant from "invariant";
import inRange from "lodash/inRange";

export function getAxisChildProps(props) {
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

  return { ticksProps, gridProps, labelsProps, titleProps };
}

export function getMouseAxisOptions(axisType, event, scale) {
  invariant(
    axisType === "x" || axisType === "y",
    "axisType should be either x or y."
  );

  const axisBoundingBox = event.currentTarget.getBoundingClientRect();
  const scaleType = inferScaleType(scale);
  const outerY = Math.round(event.clientY - axisBoundingBox.top);
  const outerX = Math.round(event.clientX - axisBoundingBox.left);
  const isYAxis = axisType === "y";

  const mousePos = isYAxis ? outerY : outerX;
  const boundingBoxLimit = isYAxis
    ? axisBoundingBox.height
    : axisBoundingBox.width;

  const value = !inRange(mousePos, 0, boundingBoxLimit)
    ? null
    : scaleType === "ordinal"
      ? invertPointScale(scale, mousePos)
      : scale.invert(mousePos);

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
