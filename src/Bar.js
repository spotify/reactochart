import React from 'react';
import invariant from 'invariant';
import isUndefined from 'lodash/isUndefined';
import {hasOneOfTwo} from './util';
import {hasXYScales} from './utils/Scale';

// Bar is a low-level component to be used in XYPlot-type charts (namely BarChart)
// It is specified in terms of a range (min & max) of values on one axis (the bar's long axis)
// and a single value on the other axis.
// Passing props `xValue`, `xEndValue` and `yValue` specifies a horizontal bar,
//   centered on `yValue` and spanning from `xValue` to `xEndValue`;
// passing props `xValue`, `yValue`, and `yEndValue' specifies a vertical bar.

export default class Bar extends React.Component {
  static propTypes = {
    scale: React.PropTypes.shape({x: React.PropTypes.func.isRequired, y: React.PropTypes.func.isRequired}),
    xValue: React.PropTypes.any,
    yValue: React.PropTypes.any,
    xEndValue: React.PropTypes.any,
    yEndValue: React.PropTypes.any,
    thickness: React.PropTypes.number,
    className: React.PropTypes.string,
    style: React.PropTypes.object
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
    const {scale, xValue, xEndValue, yValue, yEndValue, thickness, style} = this.props;
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
      // todo onMouseEnter, onMouseMove, onMouseLeave
    }} />
  }
}
