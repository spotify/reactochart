import React from 'react';
import _ from 'lodash';

import {getScaleTicks, getTickDomain} from 'utils/Scale';

export default class YTicks extends React.Component {
  static propTypes = {
    scale: React.PropTypes.shape({y: React.PropTypes.func.isRequired})
  };
  static defaultProps = {
    position: 'left',
    nice: true,
    tickLength: 5,
    tickStyle: {}
  };

  static getTickDomain(props) {
    if(!_.get(props, 'scale.y')) return;
    props = _.defaults({}, props, YTicks.defaultProps);
    return {y: getTickDomain(props.scale.y, props)};
  }

  static getMargin(props) {
    const {tickLength, position} = _.defaults({}, props, YTicks.defaultProps);
    const placement = props.placement || ((position === 'left') ? 'before' : 'after');
    const zeroMargin = {top: 0, bottom: 0, left: 0, right: 0};

    if((position === 'left' && placement === 'after') || (position == 'right' && placement === 'before'))
      return zeroMargin;

    return _.defaults({[position]: tickLength || 0}, zeroMargin);
  }

  render() {
    const {width, tickCount, position, tickLength, tickStyle, tickClassName} = this.props;
    const scale = this.props.scale.y;
    const placement = this.props.placement || ((position === 'left') ? 'before' : 'after');
    const ticks = this.props.ticks || getScaleTicks(scale, null, tickCount);
    const className = `chart-tick chart-tick-y ${tickClassName || ''}`;
    const transform = (position === 'right') ? `translate(${width}, 0)` : '';

    return <g className="chart-ticks-y" transform={transform}>
      {ticks.map((tick, i) => {
        const y1 = scale(tick);
        const x2 = (placement === 'before') ?  -tickLength : tickLength;

        return <line {...{
          x1: 0, x2, y1, y2: y1,
          className,
          style: tickStyle,
          key: `tick-${i}`
        }} />;
      })}
    </g>;
  }
}
