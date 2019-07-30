import { area, scaleOrdinal, schemeCategory10 } from "d3";
import range from "lodash/range";
import defaults from "lodash/defaults";
import PropTypes from "prop-types";
import React from "react";
import * as CustomPropTypes from "./utils/CustomPropTypes";
import {
  combineDomains,
  domainFromData,
  getValue,
  makeAccessor2
} from "./utils/Data";
import { dataTypeFromScaleType } from "./utils/Scale";
import xyPropsEqual from "./utils/xyPropsEqual";

/**
 * `FunnelChart` is used to visualize the progressive reduction of data as it passes
 * from one phase to another.
 */
export default class FunnelChart extends React.Component {
  static propTypes = {
    /**
     * Array of data to be plotted.
     */
    data: PropTypes.array.isRequired,
    /**
     * Accessor function for X values, called once per datum, or a single value to be used for all datums.
     */
    x: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for Y values, called once per datum, or a single value to be used for all datums.
     */
    y: CustomPropTypes.valueOrAccessor,
    /**
     * Color applied to the path element,
     * or accessor function which returns a class.
     *
     * Note that the first datum's color would not be applied since it fills in the area of the path
     */
    color: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    horizontal: PropTypes.bool,
    /**
     * Classname applied to each path element,
     * or accessor function which returns a class.
     */
    pathClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Style applied to each path element,
     * or accessor function which returns a style object.
     */
    pathStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * D3 scale for X axis - provided by XYPlot.
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot.
     */
    yScale: PropTypes.func
  };
  static defaultProps = {
    pathClassName: ""
  };

  static getDomain(props) {
    const { data, xScaleType, yScaleType, x, y, horizontal } = props;
    const [xAccessor, yAccessor] = [makeAccessor2(x), makeAccessor2(y)];
    const [xDataType, yDataType] = [
      dataTypeFromScaleType(xScaleType),
      dataTypeFromScaleType(yScaleType)
    ];

    return horizontal
      ? {
          xDomain: combineDomains([
            domainFromData(data, xAccessor, xDataType),
            domainFromData(data, (d, i) => -xAccessor(d, i), xDataType)
          ]),
          yDomain: domainFromData(data, yAccessor, yDataType)
        }
      : {
          xDomain: domainFromData(data, xAccessor, xDataType),
          yDomain: combineDomains([
            domainFromData(data, yAccessor, yDataType),
            domainFromData(data, (d, i) => -yAccessor(d, i), yDataType)
          ])
        };
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, []);
    return shouldUpdate;
  }

  render() {
    const {
      data,
      xScale,
      yScale,
      color,
      pathStyle,
      x,
      y,
      horizontal,
      pathClassName
    } = this.props;

    const funnelArea = area();
    if (horizontal) {
      funnelArea
        .x0((d, i) => xScale(-getValue(x, d, i)))
        .x1((d, i) => xScale(getValue(x, d, i)))
        .y((d, i) => yScale(getValue(y, d, i)));
    } else {
      funnelArea
        .x((d, i) => xScale(getValue(x, d, i)))
        .y0((d, i) => yScale(-getValue(y, d, i)))
        .y1((d, i) => yScale(getValue(y, d, i)));
    }

    const colors = scaleOrdinal(schemeCategory10).domain(range(10));

    return (
      <g className="rct-funnel-chart">
        {data.map((d, i) => {
          if (i === 0) return null;
          const pathStr = funnelArea([data[i - 1], d]);
          const fill = color ? getValue(color, d, i) : colors(i - 1);
          let style = pathStyle ? getValue(pathStyle, d, i) : {};

          style = defaults({}, style, { fill, stroke: "transparent" });

          return (
            <path
              d={pathStr}
              className={`${getValue(pathClassName, d, i) || ""}`}
              style={style}
              key={i}
            />
          );
        })}
      </g>
    );
  }
}
