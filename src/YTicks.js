import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import {getScaleTicks, getTickDomain} from './utils/Scale';

export default class YTicks extends React.Component {
  static propTypes = {
    yScale: PropTypes.func,
    position: PropTypes.oneOf(['left', 'right']),
    placement: PropTypes.oneOf(['before', 'after']),
    ticks: PropTypes.array,
    tickCount: PropTypes.number,
    tickLength: PropTypes.number,
    tickStyle: PropTypes.object,
    tickClassName: PropTypes.string,
    spacingLeft: PropTypes.number,
    spacingRight: PropTypes.number,
  };
  static defaultProps = {
    position: 'left',
    nice: true,
    tickLength: 5,
    tickStyle: {},
    spacingLeft: 0,
    spacingRight: 0
  };

  static getTickDomain(props) {
    if(!props.yScale) return;
    props = _.defaults({}, props, YTicks.defaultProps);
    return {yTickDomain: getTickDomain(props.yScale, props)};
  }

  static getMargin(props) {
    const {tickLength, position} = _.defaults({}, props, YTicks.defaultProps);
    const placement = props.placement || ((position === 'left') ? 'before' : 'after');
    const zeroMargin = {marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0};

    if((position === 'left' && placement === 'after') || (position === 'right' && placement === 'before'))
      return zeroMargin;

    return _.defaults({[`margin${_.capitalize(position)}`]: tickLength || 0}, zeroMargin);
  }

  render() {
    const {width, yScale, tickCount, position, tickLength, tickStyle, tickClassName, spacingLeft, spacingRight} = this.props;
    const placement = this.props.placement || ((position === 'left') ? 'before' : 'after');
    const ticks = this.props.ticks || getScaleTicks(yScale, null, tickCount);
    const className = `chart-tick chart-tick-y ${tickClassName || ''}`;
    const transform = (position === 'right') ?
      `translate(${width + spacingRight}, 0)` :  `translate(${-spacingLeft}, 0)`;

    return <g className="chart-ticks-y" transform={transform}>
      {ticks.map((tick, i) => {
        const y1 = yScale(tick);
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
