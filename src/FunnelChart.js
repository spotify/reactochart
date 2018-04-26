import React from "react";
import _ from "lodash";
import { area, scaleOrdinal, schemeCategory20b } from "d3";
import invariant from "invariant";
import PropTypes from "prop-types";
import * as CustomPropTypes from "./utils/CustomPropTypes";
import {
  makeAccessor2,
  getValue,
  domainFromData,
  combineDomains
} from "./utils/Data";
import { dataTypeFromScaleType } from "./utils/Scale";
import xyPropsEqual from "./utils/xyPropsEqual";

export default class FunnelChart extends React.Component {
  static propTypes = {
    // data array
    data: PropTypes.array.isRequired,
    // data getters
    x: CustomPropTypes.valueOrAccessor,
    y: CustomPropTypes.valueOrAccessor,
    horizontal: PropTypes.bool,
    /**
     * D3 scale for X axis - provided by XYPlot
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot
     */
    yScale: PropTypes.func
  };
  static defaultProps = {};

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

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, []);
    return shouldUpdate;
  }

  render() {
    const { data, xScale, yScale, x, y, horizontal } = this.props;

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

    const colors = scaleOrdinal(schemeCategory20b).domain(_.range(10));

    return (
      <g className="funnel-chart">
        {data.map((d, i) => {
          if (i === 0) return null;
          const pathStr = funnelArea([data[i - 1], d]);

          return (
            <path
              d={pathStr}
              style={{ fill: colors(i - 1), stroke: "transparent" }}
            />
          );
        })}
      </g>
    );
  }
}
