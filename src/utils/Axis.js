
export function getAxisChildProps(props) {
  const {
    scale, width, height, position, placement,
    ticks, tickCount, tickLength, tickClassName, tickStyle,
    title, titleDistance, titleAlign, titleRotate, titleStyle,
    labelDistance, labelClassName, labelStyle, labelFormat, labelFormats, labels,
    gridLineClassName, gridLineStyle
  } = props;

  const ticksProps = {
    scale, ticks, tickCount,
    height, position, placement, tickLength, tickStyle, tickClassName
  };

  const gridProps = {
    scale, ticks, tickCount,
    width, height, lineClassName: gridLineClassName, lineStyle: gridLineStyle
  };

  const labelsProps = {
    scale, ticks, tickCount,
    height, position, placement, labels,
    labelClassName, labelStyle, distance: labelDistance, format: labelFormat, formats: labelFormats
  };

  const titleProps = {
    width, height, position, placement, title,
    titleStyle, distance: titleDistance, alignment: titleAlign, rotate: titleRotate
  };

  return {ticksProps, gridProps, labelsProps, titleProps};
}
