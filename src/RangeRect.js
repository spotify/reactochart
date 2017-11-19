import React from 'react';
import invariant from 'invariant';
import isUndefined from 'lodash/isUndefined';
import PropTypes from 'prop-types';
import * as CustomPropTypes from './utils/CustomPropTypes';
import {hasXYScales} from './utils/Scale';
import {makeAccessor} from './utils/Data';

/**
 * RangeRect is a low-level component to be used in XYPlot-type charts (namely AreaBarChart).
 * It is a rectangle which represents a range (min & max) of values on both (X & Y) axes.
 * It takes a single datum object, and getters which specify how to retrieve the range values from it.
 */

export default class RangeRect extends React.Component {
  static propTypes = {
    /**
     * D3 scales for the X and Y axes of the chart, in {x, y} object format.
     */
    scale: PropTypes.shape({x: PropTypes.func.isRequired, y: PropTypes.func.isRequired}),
    /**
     * Array of data to be plotted. One bar will be rendered per datum in the array.
     */
    datum: PropTypes.any,
    /**
     * Data getter for the starting (min) X-value (left edge, usually) of the rectangle range
     */
    getX: CustomPropTypes.getter,
    /**
     * Data getter for the ending (max) X-value (right edge, usually) of the rectangle range
     */
    getXEnd: CustomPropTypes.getter,
    /**
     * Data getter for the starting (min) Y-value (bottom edge, usually) of the rectangle range
     */
    getY: CustomPropTypes.getter,
    /**
     * Data getter for the ending (max) Y-value (top edge, usually) of the rectangle range
     */
    getYEnd: CustomPropTypes.getter,
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
    const {scale, datum, getX, getXEnd, getY, getYEnd, style, onMouseEnter, onMouseMove, onMouseLeave} = this.props;

    invariant(hasXYScales(scale), `RangeRect.props.scale.x and scale.y must both be valid d3 scales`);
    // todo warn if getX/Y/etc return bad values

    const className = `chart-range-rect ${this.props.className || ''}`;
    const x0 = scale.x(makeAccessor(getX)(datum));
    const x1 = scale.x(makeAccessor(getXEnd)(datum));
    const y0 = scale.y(makeAccessor(getY)(datum));
    const y1 = scale.y(makeAccessor(getYEnd)(datum));
    const x = Math.min(x0, x1);
    const y = Math.min(y0, y1);
    const width = Math.abs(x1 - x0);
    const height = Math.abs(y1 - y0);

    // todo onMouseEnter, onMouseMove, onMouseLeave
    return <rect {...{x, y, width, height, className, style, onMouseEnter, onMouseMove, onMouseLeave}} />;
  }
}
