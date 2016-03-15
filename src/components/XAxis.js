import React from 'react';
import _ from 'lodash';

import {inferScaleType, getScaleTicks} from 'utils/Scale';


class XTicks extends React.Component {
  static propTypes = {
    scale: React.PropTypes.object.isRequired
  };
  static defaultProps = {
    position: 'bottom',
    inner: false,
    tickLength: 5,
    style: null,
    className: '',
    tickCount: 10,
    xScaleType: null,
    ticks: null
  };

  static getMargin(props) {
    const {inner, tickLength, position} = _.defaults({}, props, XTicks.defaultProps);
    if(inner) return {};
    return position === 'top' ? {top: tickLength || 0} : {bottom: tickLength || 0};
  }

  render() {
    const {xScale, xScaleType, tickCount, position, inner, tickLength, style, className} = this.props;
    const ticks = this.props.ticks || getScaleTicks(xScale, xScaleType, tickCount);
    const trueClassName = `chart-tick ${className}`;

    return <g>
      {ticks.map(tick => {
        const x1 = xScale(tick);
        const y2 = ((inner && position === 'bottom') || (!inner && position === 'top')) ?
          tickLength : -tickLength;

        return <line {...{x1, x2: x1, y1: 0, y2, style, className: trueClassName}} />;
      })}
    </g>;
  }
}

export default XTicks;