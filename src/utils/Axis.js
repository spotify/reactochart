
export function getAxisChildProps(props) {
  const {
    scale, width, height, position, placement,
    ticks, tickCount, tickLength, tickClassName, tickStyle,
    title, titleDistance, titleAlign, titleRotate, titleStyle,
    labelDistance, labelClassName, labelStyle, labelFormat, labelFormats, labels,
    gridLineClassName, gridLineStyle, onMouseEnterLabel, onMouseMoveLabel, onMouseLeaveLabel
  } = props;

  const ticksProps = {
    width, height, scale, ticks, tickCount,
    position, placement, tickLength, tickStyle, tickClassName
  };

  const gridProps = {
    width, height, scale, ticks, tickCount,
    lineClassName: gridLineClassName, lineStyle: gridLineStyle
  };

  const labelsProps = {
    width, height, scale, ticks, tickCount,
    position, placement, labels,
    labelClassName, labelStyle, distance: labelDistance, format: labelFormat, formats: labelFormats,
    onMouseEnterLabel, onMouseMoveLabel, onMouseLeaveLabel
  };

  const titleProps = {
    width, height, position, placement, title,
    style: titleStyle, distance: titleDistance, alignment: titleAlign, rotate: titleRotate
  };

  return {ticksProps, gridProps, labelsProps, titleProps};
}
