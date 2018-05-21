import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import YLine from "./YLine";
import { getScaleTicks, getTickDomain } from "./utils/Scale";

export default class YGrid extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    yScale: PropTypes.func,
    spacingTop: PropTypes.number,
    spacingBottom: PropTypes.number,
    spacingLeft: PropTypes.number,
    spacingRight: PropTypes.number,
    nice: PropTypes.bool,
    ticks: PropTypes.array,
    tickCount: PropTypes.number,
    lineClassName: PropTypes.string,
    lineStyle: PropTypes.object
  };
  static defaultProps = {
    nice: true,
    lineStyle: {}
  };

  static getTickDomain(props) {
    if (!props.yScale) return;
    props = _.defaults({}, props, YGrid.defaultProps);
    return { yTickDomain: getTickDomain(props.yScale, props) };
  }

  render() {
    const {
      width,
      yScale,
      tickCount,
      lineClassName,
      lineStyle,
      spacingTop,
      spacingBottom,
      spacingLeft,
      spacingRight
    } = this.props;
    const ticks = this.props.ticks || getScaleTicks(yScale, null, tickCount);
    const className = `rct-chart-grid-line ${lineClassName || ""}`;

    return (
      <g className="chart-grid-y">
        {ticks.map((tick, i) => {
          return (
            <YLine
              {...{
                width,
                yScale,
                className,
                spacingTop,
                spacingBottom,
                spacingLeft,
                spacingRight,
                value: tick,
                style: lineStyle,
                key: `grid-y-line-${i}`
              }}
            />
          );
        })}
      </g>
    );
  }
}
