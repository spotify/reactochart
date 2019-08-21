import PropTypes from 'prop-types';
import React from 'react';

/**
 * `YLine` is a horizontal line rendered on the y axis
 */
export default class YLine extends React.Component {
  static propTypes = {
    /**
     * D3 scale for Y axis - provided by XYPlot
     */
    yScale: PropTypes.func,
    /**
     * Width of chart - provided by XYPlot.
     */
    width: PropTypes.number,
    value: PropTypes.any.isRequired,
    /**
     * D3 scale for X axis - provided by XYPlot
     */
    xScale: PropTypes.func,
    xLimit: PropTypes.any,
    /**
     * Spacing left - provided by XYPlot
     */
    spacingLeft: PropTypes.number,
    /**
     * Spacing right - provided by XYPlot
     */
    spacingRight: PropTypes.number,
    /**
     * Inline style object to be applied to the line
     */
    style: PropTypes.object,
    /**
     * Class attribute to be applied to the line
     */
    className: PropTypes.string,
  };
  static defaultProps = {
    style: {},
    className: '',
    spacingLeft: 0,
    spacingRight: 0,
  };

  render() {
    const {
      width,
      yScale,
      value,
      xScale,
      xLimit,
      spacingLeft,
      spacingRight,
      style,
    } = this.props;
    const className = `rct-chart-line-y ${this.props.className || ''}`;
    const lineY = yScale(value);
    const lineX =
      typeof xLimit === 'undefined' ? width + spacingRight : xScale(xLimit);

    return (
      <line
        {...{
          x1: -spacingLeft,
          x2: lineX,
          y1: lineY,
          y2: lineY,
          className,
          style,
        }}
      />
    );
  }
}
