import React from 'react';
import _ from 'lodash';

import {inferScaleType, getScaleTicks} from 'utils/Scale';
import resolveObjectProps from 'utils/resolveObjectProps';

class XTicks extends React.Component {
  static propTypes = {
    scale: React.PropTypes.func.isRequired
  };
  static defaultProps = {
    height: 250,
    top: false,
    inner: false,
    position: 'bottom',
    placement: undefined,
    tickCount: 10,
    ticks: null,
    tickLength: 5,
    tickClassName: '',
    tickStyle: null
  };

  static getMargin(props) {
    const {inner, tickLength, top} = _.defaults({}, props, XTicks.defaultProps);
    const margin = inner ? {} :
      top ? {top: tickLength || 0} : {bottom: tickLength || 0};
    return _.defaults(margin, {top: 0, bottom: 0, left: 0, right: 0});
  }

  render() {
    const {height, scale, tickCount, position, tickLength, tickStyle, tickClassName} = this.props;
    const ticks = this.props.ticks || getScaleTicks(scale, null, tickCount);
    const className = `chart-tick chart-tick-x ${tickClassName}`;
    const transform = (position === 'bottom') ? `translate(0,${height})` : '';
    const placement = this.props.placement || ((position === 'top') ? 'above' : 'below');

    return <g className="chart-ticks-x" transform={transform}>
      {ticks.map((tick, i) => {
        const x1 = scale(tick);
        const y2 = (placement === 'above') ?
          -tickLength : tickLength;

        return <line {...{
          x1, x2: x1, y1: 0, y2,
          className,
          style: tickStyle,
          key: `tick-${i}`
        }} />;
      })}
    </g>;
  }
}

export default XTicks;
