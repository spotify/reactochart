import React from 'react';
import _ from 'lodash';

import {getScaleTicks, getTickDomain} from 'utils/Scale';

export default class XTicks extends React.Component {
  static propTypes = {
    scale: React.PropTypes.shape({x: React.PropTypes.func.isRequired})
  };
  static defaultProps = {
    position: 'bottom',
    nice: true,
    tickLength: 5,
    tickStyle: {}
  };

  static getTickDomain(props) {
    if(!_.get(props, 'scale.x')) return;
    props = _.defaults({}, props, XTicks.defaultProps);
    return {x: getTickDomain(props.scale.x, props)};
  }

  static getMargin(props) {
    const {tickLength, position} = _.defaults({}, props, XTicks.defaultProps);
    const placement = props.placement || ((position === 'top') ? 'above' : 'below');
    const zeroMargin = {top: 0, bottom: 0, left: 0, right: 0};

    if((position === 'bottom' && placement === 'above') || (position == 'top' && placement === 'below'))
      return zeroMargin;

    return _.defaults({[position]: tickLength || 0}, zeroMargin);
  }

  render() {
    const {height, tickCount, position, tickLength, tickStyle, tickClassName} = this.props;
    const scale = this.props.scale.x;
    const placement = this.props.placement || ((position === 'top') ? 'above' : 'below');
    const ticks = this.props.ticks || getScaleTicks(scale, null, tickCount);
    const className = `chart-tick chart-tick-x ${tickClassName || ''}`;
    const transform = (position === 'bottom') ? `translate(0,${height})` : '';

    return <g className="chart-ticks-x" transform={transform}>
      {ticks.map((tick, i) => {
        const x1 = scale(tick);
        const y2 = (placement === 'above') ? -tickLength : tickLength;

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
