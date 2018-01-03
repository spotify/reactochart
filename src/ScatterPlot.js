import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {makeAccessor2, getValue} from './utils/Data';
import {methodIfFuncProp} from './util.js';
import xyPropsEqual from './utils/xyPropsEqual';
import * as CustomPropTypes from './utils/CustomPropTypes';

export default class ScatterPlot extends React.Component {
  static propTypes = {
    // the array of data objects
    data: PropTypes.array.isRequired,
    /**
     * Accessor function for plot X values, called once per datum
     */
    x: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for plot Y values, called once per datum
     */
    y: CustomPropTypes.valueOrAccessor,
    /**
     * D3 scale for X axis - provided by XYPlot
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot
     */
    yScale: PropTypes.func,
    xScaleType: PropTypes.string,
    yScaleType: PropTypes.string,

    // used with the default point symbol (circle), defines the circle radius
    pointRadius: PropTypes.number,
    // text or SVG node to use as custom point symbol, or function which returns text/SVG
    pointSymbol: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    // manual x and y offset applied to the point to center it, for custom point symbols which can't be auto-centered
    pointOffset: PropTypes.arrayOf(PropTypes.number),
    // inline styles for points
    pointStyle: PropTypes.object,
    pointClassName: CustomPropTypes.getter,

    onMouseEnterPoint: PropTypes.func,
    onMouseMovePoint: PropTypes.func,
    onMouseLeavePoint: PropTypes.func
  };
  static defaultProps = {
    pointRadius: 3,
    pointSymbol: <circle />,
    pointOffset: [0,0],
    pointStyle: {},
    pointClassName: ''
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

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, ['pointStyle']);
    return shouldUpdate;
  }

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
    const {xScale, yScale, x, y, pointRadius, pointOffset, pointStyle, pointClassName} = this.props;
    let {pointSymbol} = this.props;
    const className = `chart-scatterplot-point ${getValue(pointClassName, d, i)}`;
    const style = getValue(pointStyle, d, i);
    let symbolProps = {className, onMouseEnter, onMouseMove, onMouseLeave, key: `scatter-point-${i}`};

    // resolve symbol-generating functions into real symbols
    if(_.isFunction(pointSymbol)) pointSymbol = pointSymbol(d, i);
    // wrap string/number symbols in <text> container
    if(_.isString(pointSymbol) || _.isNumber(pointSymbol)) pointSymbol = <text>{pointSymbol}</text>;
    // use props.pointRadius for circle radius
    if(pointSymbol.type === 'circle' && _.isUndefined(pointSymbol.props.r)) symbolProps.r = pointRadius;

    // x,y coords of center of symbol
    const cx = xScale(getValue(x, d, i)) + pointOffset[0];
    const cy = yScale(getValue(y, d, i)) + pointOffset[1];

    // set positioning attributes based on symbol type
    if(pointSymbol.type === 'circle' || pointSymbol.type === 'ellipse') {
      _.assign(symbolProps, {cx, cy, style: pointStyle});
    } else if(pointSymbol.type === 'text') {
      _.assign(symbolProps, {x: cx, y: cy, style: {textAnchor: 'middle', dominantBaseline: 'central', ...style}});
    } else {
      _.assign(symbolProps, {x: cx, y: cy, style: {transform: "translate(-50%, -50%)", ...style}});
    }

    return React.cloneElement(pointSymbol, symbolProps);
  }
}
