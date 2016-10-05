import React from 'react';
import invariant from 'invariant';
import isUndefined from 'lodash/isUndefined';

import * as CustomPropTypes from './utils/CustomPropTypes';
import {hasOneOfTwo} from './util';
import {hasXYScales} from './utils/Scale';
import {makeAccessor} from './utils/Data';

// RangeRect is a low-level component to be used in XYPlot-type charts (namely AreaBarChart)
// It is a rectangle which represents a range (min & max) of values on both (X & Y) axes.
// Takes a single datum object, and getters which specify how to retrieve the range values from it

export default class RangeRect extends React.Component {
  static propTypes = {
    scale: React.PropTypes.shape({x: React.PropTypes.func.isRequired, y: React.PropTypes.func.isRequired}),
    datum: React.PropTypes.any,
    getX: CustomPropTypes.getter,
    getXEnd: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    getYEnd: CustomPropTypes.getter,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    onMouseEnter: React.PropTypes.func, 
    onMouseMove: React.PropTypes.func, 
    onMouseLeave: React.PropTypes.func
  };
  static defaultProps = {
    className: '',
    style: {}
  };

  render() {
    const {scale, datum, getX, getXEnd, getY, getYEnd, style, onMouseEnter, onMouseMove, onMouseLeave} = this.props;

    invariant(hasXYScales(scale), `Bar.props.scale.x and scale.y must both be valid d3 scales`);
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
