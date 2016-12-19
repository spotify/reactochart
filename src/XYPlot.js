import React from 'react';
import _ from 'lodash';
import d3 from 'd3';

import resolveObjectProps from './utils/resolveObjectProps';
import resolveXYScales from './utils/resolveXYScales';
import {innerSize} from './utils/Margin';
import {inferScaleType} from './utils/Scale';
import {methodIfFuncProp} from './util';

function indexOfClosestNumberInList(number, list) {
  return list.reduce((closestI, current, i) => {
    return Math.abs(current - number) < Math.abs(list[closestI] - number) ? i : closestI;
  }, 0);
}

function getMouseOptions(event, {scale, height, width, margin}) {
  const chartBB = event.currentTarget.getBoundingClientRect();
  const outerX = Math.round(event.clientX - chartBB.left);
  const outerY = Math.round(event.clientY - chartBB.top);
  const innerX = (outerX - (margin.left || 0));
  const innerY = (outerY -(margin.top || 0));
  const chartSize = innerSize({width, height}, margin);
  const scaleType = {x: inferScaleType(scale.x), y: inferScaleType(scale.y)};

  const xValue = (!_.inRange(innerX, 0, chartSize.width /* + padding.left + padding.right */)) ? null :
    (scaleType.x === 'ordinal') ?
      scale.x.domain()[indexOfClosestNumberInList(innerX, scale.x.range())] :
      scale.x.invert(innerX);
  const yValue = (!_.inRange(innerY, 0, chartSize.height /* + padding.top + padding.bottom */)) ? null :
    (scaleType.y === 'ordinal') ?
      scale.y.domain()[indexOfClosestNumberInList(innerY, scale.y.range())] :
      scale.y.invert(innerY);

  return {event, outerX, outerY, innerX, innerY, xValue, yValue, scale, margin};
}

class XYPlot extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    scale: React.PropTypes.object,
    scaleType: React.PropTypes.object,
    domain: React.PropTypes.object,
    margin: React.PropTypes.object,
    // todo spacing & padding...
    padding: React.PropTypes.object,
    nice: React.PropTypes.object,
    invertScale: React.PropTypes.object,

    onMouseMove: React.PropTypes.func,
    onMouseEnter: React.PropTypes.func,
    onMouseLeave: React.PropTypes.func,
    onMouseDown: React.PropTypes.func,
    onMouseUp: React.PropTypes.func
  };

  static defaultProps = {
    width: 400,
    height: 250,
    // nice: {x: true, y: true},
    invertScale: {x: false, y: false},
    // emptyLabel: "Unknown",

    // these values are inferred from data if not provided, therefore empty defaults
    // scaleType: {},
    // domain: {},
    // margin: {},
    // spacing: {}
  };

  onXYMouseEvent = (callbackKey, event) => {
    const callback = this.props[callbackKey];
    if(!_.isFunction(callback)) return;
    const options = getMouseOptions(event, this.props);
    callback(options);
  };
  onMouseMove = _.partial(this.onXYMouseEvent, 'onMouseMove');
  onMouseDown = _.partial(this.onXYMouseEvent, 'onMouseDown');
  onMouseUp = _.partial(this.onXYMouseEvent, 'onMouseUp');
  onClick = _.partial(this.onXYMouseEvent, 'onClick');
  onMouseEnter = (event) => this.props.onMouseEnter({event});
  onMouseLeave = (event) => this.props.onMouseLeave({event});

  render() {
    const {width, height, margin} = this.props;
    const chartSize = innerSize({width, height}, margin);

    const handlerNames = ['onMouseMove', 'onMouseEnter', 'onMouseLeave', 'onMouseDown', 'onMouseUp', 'onClick'];
    const handlers = _.fromPairs(handlerNames.map(n => [n, methodIfFuncProp(n, this.props, this)]));

    const propsToPass = {
      ..._.omit(this.props, ['children']),
      ...chartSize
    };

    return <svg {...{width, height, className: 'xy-plot', onMouseMove: this.onMouseMove}} {...handlers}>
      <rect className="chart-background" {...{width, height}} />
      <g transform={`translate(${margin.left}, ${margin.top})`} className="chart-inner">
        <rect className="plot-background" {...chartSize} />
        {React.Children.map(this.props.children, child => {
          return (_.isNull(child) || _.isUndefined(child)) ? null :
            React.cloneElement(child, propsToPass);
        })}
      </g>
    </svg>
  }
}

const xyKeys = ['scaleType', 'domain', 'invertScale'];
const dirKeys = ['margin', 'padding', 'spacing'];

const XYPlotResolved = _.flow([
  resolveXYScales,
  _.partial(resolveObjectProps, _, xyKeys, ['x', 'y']),
  _.partial(resolveObjectProps, _, dirKeys, ['top', 'bottom', 'left', 'right'])
])(XYPlot);

export default XYPlotResolved;
