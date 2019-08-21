import PropTypes from 'prop-types';
import React from 'react';

/**
 * `XLine` is a vertical line rendered on the x axis
 */
export default class XLine extends React.Component {
  static propTypes = {
    /**
     * DHeight of chart - provided by XYPlot
     */
    height: PropTypes.number,
    /**
     * D3 scale for X axis - provided by XYPlot
     */
    xScale: PropTypes.func,
    value: PropTypes.any.isRequired,
    /**
     * D3 scale for Y axis - provided by XYPlot
     */
    yScale: PropTypes.func,
    yLimit: PropTypes.any,
    /**
     * The Y domain of the data as an array - provided by XYPlot
     */
    yDomain: PropTypes.array,
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
    className: PropTypes.string,
  };
  static defaultProps = {
    style: {},
    className: '',
    spacingTop: 0,
    spacingBottom: 0,
  };

  render() {
    const {
      xScale,
      value,
      yScale,
      yLimit,
      yDomain,
      height,
      style,
      spacingTop,
      spacingBottom,
    } = this.props;
    const className = `rct-chart-line-x ${this.props.className}`;
    const lineX = xScale(value);

    let y1 = -spacingTop;
    let y2 = height + spacingBottom;

    if (typeof yLimit !== 'undefined') {
      y1 = yScale(yDomain[0]) + spacingBottom;
      y2 = yScale(yLimit);
    }

    return (
      <line
        {...{
          x1: lineX,
          x2: lineX,
          y1: y1,
          y2: y2,
          className,
          style,
        }}
      />
    );
  }
}
