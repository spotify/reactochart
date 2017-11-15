import React from 'react';
import invariant from 'invariant';
import isUndefined from 'lodash/isUndefined';
import {hasOneOfTwo} from './util';
import {hasXYScales} from './utils/Scale';
import PropTypes from 'prop-types';

/**
 * Bar is a low-level component to be used in XYPlot-type charts (namely BarChart).
 * It is specified in terms of a range (min & max) of values on one axis (the bar's long axis)
 * and a single value on the other axis.
 * Passing props `xValue`, `xEndValue` and `yValue` specifies a horizontal bar,
 * centered on `yValue` and spanning from `xValue` to `xEndValue`;
 * passing props `xValue`, `yValue`, and `yEndValue' specifies a vertical bar.
 */

export default class Bar extends React.Component {
  static propTypes = {
    /**
     * D3 scales for the X and Y axes of the chart, in {x, y} object format.
     */
    scale: PropTypes.shape({x: PropTypes.func.isRequired, y: PropTypes.func.isRequired}),
    /**
     * For a vertical bar, xValue represents the X data value on which the bar is centered.
     * For a horizontal bar, represents the *starting* X data value of the bar, ie. the minimum of the range it spans
     */
    xValue: PropTypes.any,
    /**
     * For a horizontal bar, yValue represents the Y data value on which the bar is centered.
     * For a vertical bar, represents the *starting* Y data value of the bar, ie. the minimum of the range it spans
     */
    yValue: PropTypes.any,
    /**
     * For a horizontal bar, represents the *ending* X data value of the bar, ie. the maximum of the range it spans.
     * Should be undefined if the bar is vertical.
     */
    xEndValue: PropTypes.any,
    /**
     * For a vertical bar, represents the *ending* Y data value of the bar, ie. the maximum of the range it spans.
     * Should be undefined if the bar is horizontal.
     */
    yEndValue: PropTypes.any,
    /**
     * The thickness of the bar, in pixels. (width of vertical bar, or height of horizontal bar)
     */
    thickness: PropTypes.number,
    /**
     * Class name(s) to be included on the bar's <rect> element
     */
    className: PropTypes.string,
    /**
     * Inline style object to be included on the bar's <rect> element
     */
    style: PropTypes.object,
    /**
     * onMouseMove event handler callback, called when user's mouse moves within the bar.
     */
    onMouseMove: PropTypes.func,
    /**
     * onMouseEnter event handler callback, called when user's mouse enters the bar.
     */
    onMouseEnter: PropTypes.func,
    /**
     * onMouseLeave event handler callback, called when user's mouse leaves the bar.
     */
    onMouseLeave: PropTypes.func
  };
  static defaultProps = {
    xValue: 0,
    yValue: 0,
    thickness: 8,
    className: '',
    style: {}
  };

  render() {
    //  x/yValue are values in the *data* domain, not pixel domain
    const {scale, xValue, xEndValue, yValue, yEndValue, thickness, style, onMouseEnter, onMouseMove, onMouseLeave} = this.props;
    // console.log('bar', this.props);

    invariant(hasXYScales(this.props.scale), `Bar.props.scale.x and scale.y must both be valid d3 scales`);
    invariant(hasOneOfTwo(xEndValue, yEndValue), `Bar expects an xEnd *or* yEnd prop, but not both.`);

    const orientation = isUndefined(xEndValue) ? 'vertical' : 'horizontal';
    const className = `chart-bar chart-bar-${orientation} ${this.props.className || ''}`;

    let x, y, width, height;
    if(orientation === 'horizontal') {
      y = scale.y(yValue) - (thickness / 2);
      const x0 = scale.x(xValue);
      const x1 = scale.x(xEndValue);
      x = Math.min(x0, x1);
      width = Math.abs(x1 - x0);
      height = thickness;

    } else { // vertical
      x = scale.x(xValue) - (thickness / 2);
      const y0 = scale.y(yValue);
      const y1 = scale.y(yEndValue);
      y = Math.min(y0, y1);
      height = Math.abs(y1 - y0);
      width = thickness;
    }

    return <rect {...{
      x, y, width, height,
      className, style,
      onMouseEnter, onMouseMove, onMouseLeave
    }} />
  }
}
