import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import { getScaleTicks, getTickDomain } from "./utils/Scale";

export default class XTicks extends React.Component {
  static propTypes = {
    xScale: PropTypes.func,
    position: PropTypes.oneOf(["bottom", "top"]),
    placement: PropTypes.oneOf(["above", "below"]),
    ticks: PropTypes.array,
    tickCount: PropTypes.number,
    tickLength: PropTypes.number,
    tickStyle: PropTypes.object,
    tickClassName: PropTypes.string,
    spacingTop: PropTypes.number,
    spacingBottom: PropTypes.number
  };
  static defaultProps = {
    position: "bottom",
    nice: true,
    tickLength: 5,
    tickStyle: {},
    tickClassName: "",
    spacingTop: 0,
    spacingBottom: 0
  };

  static getTickDomain(props) {
    if (!props.xScale) return;
    props = _.defaults({}, props, XTicks.defaultProps);
    return { xTickDomain: getTickDomain(props.xScale, props) };
  }

  static getMargin(props) {
    const { tickLength, position } = _.defaults({}, props, XTicks.defaultProps);
    const placement =
      props.placement || (position === "top" ? "above" : "below");
    const zeroMargin = {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0
    };

    if (
      (position === "bottom" && placement === "above") ||
      (position === "top" && placement === "below")
    )
      return zeroMargin;

    return _.defaults(
      { [`margin${_.capitalize(position)}`]: tickLength || 0 },
      zeroMargin
    );
  }

  render() {
    const {
      height,
      xScale,
      tickCount,
      position,
      tickLength,
      tickStyle,
      tickClassName,
      spacingTop,
      spacingBottom
    } = this.props;
    const placement =
      this.props.placement || (position === "top" ? "above" : "below");
    const ticks = this.props.ticks || getScaleTicks(xScale, null, tickCount);
    const className = `chart-tick chart-tick-x ${tickClassName || ""}`;
    const transform =
      position === "bottom"
        ? `translate(0, ${height + spacingBottom})`
        : `translate(0, ${-spacingTop})`;

    return (
      <g className="chart-ticks-x" transform={transform}>
        {ticks.map((tick, i) => {
          const x1 = xScale(tick);
          const y2 = placement === "above" ? -tickLength : tickLength;

          return (
            <line
              {...{
                x1,
                x2: x1,
                y1: 0,
                y2,
                className,
                style: tickStyle,
                key: `tick-${i}`
              }}
            />
          );
        })}
      </g>
    );
  }
}
