"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAxisChildProps = getAxisChildProps;
function getAxisChildProps(props) {
  var scale = props.scale;
  var width = props.width;
  var height = props.height;
  var position = props.position;
  var placement = props.placement;
  var ticks = props.ticks;
  var tickCount = props.tickCount;
  var tickLength = props.tickLength;
  var tickClassName = props.tickClassName;
  var tickStyle = props.tickStyle;
  var title = props.title;
  var titleDistance = props.titleDistance;
  var titleAlign = props.titleAlign;
  var titleRotate = props.titleRotate;
  var titleStyle = props.titleStyle;
  var labelDistance = props.labelDistance;
  var labelClassName = props.labelClassName;
  var labelStyle = props.labelStyle;
  var labelFormat = props.labelFormat;
  var labelFormats = props.labelFormats;
  var labels = props.labels;
  var gridLineClassName = props.gridLineClassName;
  var gridLineStyle = props.gridLineStyle;


  var ticksProps = {
    width: width, height: height, scale: scale, ticks: ticks, tickCount: tickCount,
    position: position, placement: placement, tickLength: tickLength, tickStyle: tickStyle, tickClassName: tickClassName
  };

  var gridProps = {
    width: width, height: height, scale: scale, ticks: ticks, tickCount: tickCount,
    lineClassName: gridLineClassName, lineStyle: gridLineStyle
  };

  var labelsProps = {
    width: width, height: height, scale: scale, ticks: ticks, tickCount: tickCount,
    position: position, placement: placement, labels: labels,
    labelClassName: labelClassName, labelStyle: labelStyle, distance: labelDistance, format: labelFormat, formats: labelFormats
  };

  var titleProps = {
    width: width, height: height, position: position, placement: placement, title: title,
    style: titleStyle, distance: titleDistance, alignment: titleAlign, rotate: titleRotate
  };

  return { ticksProps: ticksProps, gridProps: gridProps, labelsProps: labelsProps, titleProps: titleProps };
}