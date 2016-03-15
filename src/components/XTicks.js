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
    tickCount: 10,
    ticks: null,
    tickLength: 5,
    top: false,
    inner: false,
    className: '',
    style: null
  };

  static getMargin(props) {
    const {inner, tickLength, top} = _.defaults({}, props, XTicks.defaultProps);
    const margin = inner ? {} :
      top ? {top: tickLength || 0} : {bottom: tickLength || 0};
    return _.defaults(margin, {top: 0, bottom: 0, left: 0, right: 0});
  }

  render() {
    const {height, scale, tickCount, top, inner, tickLength, style, className} = this.props;
    const ticks = this.props.ticks || getScaleTicks(scale, null, tickCount);
    const trueClassName = `chart-tick chart-tick-x ${className}`;
    const transform = top ? '' : `translate(0,${height})`;

    return <g className="chart-ticks-x" transform={transform}>
      {ticks.map((tick, i) => {
        const x1 = scale(tick);
        const y2 = ((inner && !top) || (!inner && top)) ?
          -tickLength : tickLength;

        return <line {...{x1, x2: x1, y1: 0, y2, style, className: trueClassName, key: `tick-${i}`}} />;
      })}
    </g>;
  }
}

export default XTicks;
