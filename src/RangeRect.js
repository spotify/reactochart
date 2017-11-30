import React from 'react';
import invariant from 'invariant';
import PropTypes from 'prop-types';
import * as CustomPropTypes from './utils/CustomPropTypes';
import {isValidScale} from './utils/Scale';

/**
 * RangeRect is a low-level component to be used in XYPlot-type charts (namely AreaBarChart).
 * It is a rectangle which represents a range (min & max) of values on both (X & Y) axes.
 * It takes a single datum object, and getters which specify how to retrieve the range values from it.
 */

export default class RangeRect extends React.Component {
  static propTypes = {
    /**
     * D3 scale for the X (horizontal) axis.
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for the Y (vertical) axis.
     */
    yScale: PropTypes.func,
    /**
     * Starting (minimum) X value (left edge, usually) of the rectangle range
     */
    x: PropTypes.oneOfType(CustomPropTypes.datumValueTypes).isRequired,
    /**
     * Ending (maximum) X value (right edge, usually) of the rectangle range
     */
    xEnd: PropTypes.oneOfType(CustomPropTypes.datumValueTypes).isRequired,
    /**
     * Starting (minimum) Y value (bottom edge, usually) of the rectangle range
     */
    y: PropTypes.oneOfType(CustomPropTypes.datumValueTypes).isRequired,
    /**
     * Ending (maximum) Y value (top edge, usually) of the rectangle range
     */
    yEnd: PropTypes.oneOfType(CustomPropTypes.datumValueTypes).isRequired,
    /**
     * Class attribute to be applied to the rectangle element
     */
    className: PropTypes.string,
    /**
     * Inline style object to be applied to the rectangle element
     */
    style: PropTypes.object,
    /**
     * `mousemove` event handler callback, called when user's mouse moves within the rectangle.
     */
    onMouseMove: PropTypes.func,
    /**
     * `mouseenter` event handler callback, called when user's mouse enters the rectangle.
     */
    onMouseEnter: PropTypes.func,
    /**
     * `mouseleave` event handler callback, called when user's mouse leaves the rectangle.
     */
    onMouseLeave: PropTypes.func
  };
  static defaultProps = {
    className: '',
    style: {}
  };

  render() {
    const {xScale, yScale, x, xEnd, y, yEnd, style, onMouseEnter, onMouseMove, onMouseLeave} = this.props;

    invariant(isValidScale(xScale), `RangeRect.props.xScale is not a valid d3 scale`);
    invariant(isValidScale(yScale), `RangeRect.props.yScale is not a valid d3 scale`);

    const className = `chart-range-rect ${this.props.className || ''}`;
    const x0 = xScale(x);
    const x1 = xScale(xEnd);
    const y0 = yScale(y);
    const y1 = yScale(yEnd);
    const rectX = Math.min(x0, x1);
    const rectY = Math.min(y0, y1);
    const width = Math.abs(x1 - x0);
    const height = Math.abs(y1 - y0);

    return <rect {...{x: rectX, y: rectY, width, height, className, style, onMouseEnter, onMouseMove, onMouseLeave}} />;
  }
}
