import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';

import {makeAccessor} from './utils/Data';
import {methodIfFuncProp} from './util.js';
import * as CustomPropTypes from './utils/CustomPropTypes';

export default class ScatterPlot extends React.Component {
  static propTypes = {
    // the array of data objects
    data: PropTypes.array.isRequired,
    // accessors for X & Y coordinates
    getX: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    // allow user to pass an accessor for setting the class of a point
    getClass: CustomPropTypes.getter,

    scaleType: PropTypes.object,
    scale: PropTypes.object,

    // used with the default point symbol (circle), defines the circle radius
    pointRadius: PropTypes.number,
    // text or SVG node to use as custom point symbol, or function which returns text/SVG
    pointSymbol: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    // manual x and y offset applied to the point to center it, for custom point symbols which can't be auto-centered
    pointOffset: PropTypes.arrayOf(PropTypes.number),

    onMouseEnterPoint: PropTypes.func,
    onMouseMovePoint: PropTypes.func,
    onMouseLeavePoint: PropTypes.func
  };
  static defaultProps = {
    pointRadius: 3,
    pointSymbol: <circle />,
    pointOffset: [0,0]
  };

  // todo: implement getSpacing or getPadding static

  onMouseEnterPoint = (e, d) => {
    this.props.onMouseEnterPoint(e, d);
  };
  onMouseMovePoint = (e, d) => {
    this.props.onMouseMovePoint(e, d);
  };
  onMouseLeavePoint = (e, d) => {
    this.props.onMouseLeavePoint(e, d);
  };

  render() {
    return <g className={this.props.name}>
      {this.props.data.map(this.renderPoint)}
    </g>
  }
  renderPoint = (d, i) => {
    const [onMouseEnter, onMouseMove, onMouseLeave] =
      ['onMouseEnterPoint', 'onMouseMovePoint', 'onMouseLeavePoint'].map(eventName => {
        // partially apply this bar's data point as 2nd callback argument
        const callback = methodIfFuncProp(eventName, this.props, this);
        return _.isFunction(callback) ? _.partial(callback, _, d) : null;
      });
    const {scale, getX, getY, pointRadius, pointOffset, getClass} = this.props;
    let {pointSymbol} = this.props;
    const className = `chart-scatterplot-point ${getClass ? makeAccessor(getClass)(d) : ''}`;
    let symbolProps = {className, onMouseEnter, onMouseMove, onMouseLeave};

    // resolve symbol-generating functions into real symbols
    if(_.isFunction(pointSymbol)) pointSymbol = pointSymbol(d, i);
    // wrap string/number symbols in <text> container
    if(_.isString(pointSymbol) || _.isNumber(pointSymbol)) pointSymbol = <text>{pointSymbol}</text>;
    // use props.pointRadius for circle radius
    if(pointSymbol.type === 'circle' && _.isUndefined(pointSymbol.props.r)) symbolProps.r = pointRadius;

    // x,y coords of center of symbol
    const cx = scale.x(makeAccessor(getX)(d)) + pointOffset[0];
    const cy = scale.y(makeAccessor(getY)(d)) + pointOffset[1];

    // set positioning attributes based on symbol type
    if(pointSymbol.type === 'circle' || pointSymbol.type === 'ellipse') {
      _.assign(symbolProps, {cx, cy});
    } else if(pointSymbol.type === 'text') {
      _.assign(symbolProps, {x: cx, y: cy, style: {textAnchor: 'middle', dominantBaseline: 'central'}});
    } else {
      _.assign(symbolProps, {x: cx, y: cy, style: {transform: "translate(-50%, -50%)"}});
    }

    return React.cloneElement(pointSymbol, symbolProps);
  }
}
