import React from 'react';
import invariant from 'invariant';
import some from 'lodash/some';
import isUndefined from 'lodash/isUndefined';
import {hasXYScales} from './utils/Scale';

const hasOneOfTwo = (a, b) => some([a, b], isUndefined) && some([a, b], v => !isUndefined(v));

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

    invariant(hasXYScales(this.props.scale), `Bar.props.scale.x and scale.y must both be valid d3 scales`);
    invariant(hasOneOfTwo(xEndValue, yEndValue), `Bar expects an xEnd *or* yEnd prop, but not both.`);

    const orientation = isUndefined(xEndValue) ? 'vertical' : 'horizontal';
    const className = `chart-bar chart-bar-${orientation} ${this.props.className || ''}`;

    let x, y, width, height;
    if(orientation === 'horizontal') {
      y = scale.y(yValue) - (thickness / 2);
      x = scale.x(Math.min(xValue, xEndValue));
      const x1 = scale.x(Math.max(xValue, xEndValue));
      width = x1 - x;
      height = thickness;

    } else { // vertical
      x = scale.x(xValue) - (thickness / 2);
      y = scale.y(Math.min(yValue, yEndValue));
      const y1 = scale.y(Math.max(yValue, yEndValue));
      height = y1 - y;
      width = thickness;
    }

    return <rect {...{
      x, y, width, height,
      className, style,
      // todo onMouseEnter, onMouseMove, onMouseLeave
    }} />
  }
}
