import React from 'react';
import defaults from 'lodash/defaults';
import PropTypes from 'prop-types';

import { getScaleTicks, getTickDomain } from './utils/Scale';
import XLine from './XLine';

export default class XGrid extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    xScale: PropTypes.func,
    spacingTop: PropTypes.number,
    spacingBottom: PropTypes.number,
    spacingLeft: PropTypes.number,
    spacingRight: PropTypes.number,
    nice: PropTypes.bool,
    ticks: PropTypes.array,
    tickCount: PropTypes.number,
    lineClassName: PropTypes.string,
    lineStyle: PropTypes.object,
  };
  static defaultProps = {
    nice: true,
    lineStyle: {},
  };

  static getTickDomain(props) {
    if (!props.xScale) return;
    const propsWithDefaults = defaults({}, props, XGrid.defaultProps);
    return {
      xTickDomain: getTickDomain(propsWithDefaults.xScale, propsWithDefaults),
    };
  }

  render() {
    const {
      height,
      xScale,
      tickCount,
      lineClassName,
      lineStyle,
      spacingTop,
      spacingBottom,
      spacingLeft,
      spacingRight,
    } = this.props;
    const ticks = this.props.ticks || getScaleTicks(xScale, null, tickCount);
    const className = `rct-chart-grid-line ${lineClassName || ''}`;

    return (
      <g className="rct-chart-grid-x">
        {ticks.map((tick, i) => {
          return (
            <XLine
              {...{
                height,
                xScale,
                className,
                spacingTop,
                spacingBottom,
                spacingLeft,
                spacingRight,
                value: tick,
                style: lineStyle,
                key: `grid-x-line-${i}`,
              }}
            />
          );
        })}
      </g>
    );
  }
}
