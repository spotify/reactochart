import PropTypes from "prop-types";
import React from "react";

/**
 * `XLine` is a vertical line rendered on the x axis
 */
export default class XLine extends React.Component {
  static propTypes = {
    /**
     * D3 scale for X axis - provided by XYPlot
     */
    xScale: PropTypes.func,
    value: PropTypes.any.isRequired,
    /**
     * Spacing top - provided by XYPlot
     */
    spacingTop: PropTypes.number,
    /**
     * Spacing bottom - provided by XYPlot
     */
    spacingBottom: PropTypes.number,
    /**
     * Inline style object to be applied to the line
     */
    style: PropTypes.object,
    /**
     * Class attribute to be applied to the line
     */
    className: PropTypes.string
  };
  static defaultProps = {
    style: {},
    className: "",
    spacingTop: 0,
    spacingBottom: 0
  };

  render() {
    const {
      xScale,
      value,
      height,
      style,
      spacingTop,
      spacingBottom
    } = this.props;
    const className = `rct-chart-line-x ${this.props.className}`;
    const lineX = xScale(value);

    return (
      <line
        {...{
          x1: lineX,
          x2: lineX,
          y1: -spacingTop,
          y2: height + spacingBottom,
          className,
          style
        }}
      />
    );
  }
}
