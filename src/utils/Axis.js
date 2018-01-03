
export function getAxisChildProps(props) {
  const {
    width, height,
    xScale, yScale,
    spacingTop, spacingBottom, spacingLeft, spacingRight,
    position, placement,
    ticks, tickCount, tickLength, tickClassName, tickStyle,
    title, titleDistance, titleAlign, titleRotate, titleStyle,
    labelDistance, labelClassName, labelStyle, labelFormat, labelFormats, labels,
    gridLineClassName, gridLineStyle, onMouseEnterLabel, onMouseMoveLabel, onMouseLeaveLabel
  } = props;

  const ticksProps = {
    width, height, xScale, yScale, ticks, tickCount, spacingTop, spacingBottom, spacingLeft, spacingRight,
    position, placement, tickLength, tickStyle, tickClassName
  };

  const gridProps = {
    width, height, xScale, yScale, ticks, tickCount, spacingTop, spacingBottom, spacingLeft, spacingRight,
    lineClassName: gridLineClassName, lineStyle: gridLineStyle
  };

  const labelsProps = {
    width, height, xScale, yScale, ticks, tickCount, spacingTop, spacingBottom, spacingLeft, spacingRight,
    position, placement, labels,
    labelClassName, labelStyle, distance: labelDistance, format: labelFormat, formats: labelFormats,
    onMouseEnterLabel, onMouseMoveLabel, onMouseLeaveLabel
  };

  const titleProps = {
    width, height, position, placement, title, spacingTop, spacingBottom, spacingLeft, spacingRight,
    style: titleStyle, distance: titleDistance, alignment: titleAlign, rotate: titleRotate
  };

  return {ticksProps, gridProps, labelsProps, titleProps};
}
