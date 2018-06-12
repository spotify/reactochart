import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { area } from "d3";

import { makeAccessor2, domainFromData, combineDomains } from "./utils/Data";
import xyPropsEqual from "./utils/xyPropsEqual";
import * as CustomPropTypes from "./utils/CustomPropTypes";

// AreaChart represents a simple bivariate area chart,
// a filled path drawn between two lines (datasets).

// todo horizontal prop, for filling area horizontally?
// todo support ordinal (like days of the week) data?
// todo build StackedAreaChart that composes multiple AreaCharts

export default class AreaChart extends React.Component {
  static propTypes = {
    /**
     * the array of data objects
     */
    data: PropTypes.array.isRequired,
    /**
     * Accessor function for area X values, called once per datum
     */
    x: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for area's starting (minimum) Y values, called once per datum,
     * or a single Y value to be used for the entire line.
     * Should return the minimum of the Y range spanned by the area at this point.
     */
    y: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for area's ending (maximum) Y values, called once per datum,
     * or a single Y value to be used for the entire line.
     * Should return the maximum of the Y range spanned by the area at this point.
     */
    yEnd: CustomPropTypes.valueOrAccessor,
    /**
     * classname applied to area path element
     */
    pathClassName: PropTypes.string,
    /**
     * style applied to area path element
     */
    pathStyle: PropTypes.object,
    /**
     * if isDifference is true, AreaChart generates a "difference chart" with two area paths instead of one:
     * one path which shows when YEnd > Y, and one vice versa, allowing them to be styled differently (eg red/green)
     */
    isDifference: PropTypes.bool,
    /**
     * when isDifference is true, pathStylePositive and pathStyleNegative can be passed to give 2 different inline
     * styles to the two different paths which are generated.
     * Ignored if isDifference is false.
     */
    pathStylePositive: PropTypes.object,
    pathStyleNegative: PropTypes.object,
    /**
     * if true, will show gaps in the shaded area for data where props.isDefined(datum) returns false
     */
    shouldShowGaps: PropTypes.bool,
    /**
     * if shouldShowGaps is true, isDefined function describes when a datum should be considered "defined" vs. when to show gap
     * by default, shows gap if either y or yEnd are undefined
     */
    isDefined: PropTypes.func,
    /**
     * D3 scale for X axis - provided by XYPlot
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot
     */
    yScale: PropTypes.func,
    /**
     * Type of X scale - provided by XYPlot
     */
    xScaleType: PropTypes.string,
    /**
     * Type of Y scale - provided by XYPlot
     */
    yScaleType: PropTypes.string
  };

  static defaultProps = {
    shouldShowGaps: true,
    isDefined: (d, i, accessors) => {
      return (
        !_.isUndefined(accessors.y(d, i)) &&
        !_.isUndefined(accessors.yEnd(d, i))
      );
    },
    pathClassName: ""
  };

  static getDomain(props) {
    // custom Y domain - the total (union) extent of getY and getYEnd combined
    const { data, x, y, yEnd } = props;
    const accessors = {
      x: makeAccessor2(x),
      y: makeAccessor2(y),
      yEnd: makeAccessor2(yEnd)
    };
    return {
      yDomain: combineDomains([
        domainFromData(data, accessors.y),
        domainFromData(data, accessors.yEnd)
      ])
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, [
      "pathStyle",
      "pathStylePositive",
      "pathStyleNegative"
    ]);
    return shouldUpdate;
  }

  render() {
    const {
      data,
      x,
      y,
      yEnd,
      xScale,
      yScale,
      isDifference,
      pathStyle,
      pathStylePositive,
      pathStyleNegative,
      shouldShowGaps,
      pathClassName,
      isDefined
    } = this.props;
    const accessors = {
      x: makeAccessor2(x),
      y: makeAccessor2(y),
      yEnd: makeAccessor2(yEnd)
    };

    // create d3 area path generator
    const areaGenerator = area();

    // if gaps in data should be shown, use `props.isDefined` function as the `defined` param for d3's area generator;
    // but wrap it & pass in accessors as well, so that the function can easily access the relevant data values
    if (shouldShowGaps) {
      areaGenerator.defined((d, i) => isDefined(d, i, accessors));
    }

    areaGenerator
      .x((d, i) => xScale(accessors.x(d, i)))
      .y0((d, i) => yScale(accessors.y(d, i)))
      .y1((d, i) => yScale(accessors.yEnd(d, i)));

    const areaPathStr = areaGenerator(data);

    if (isDifference) {
      // difference chart - create 2 clip paths, one which clips to only show path where YEnd > Y, and other vice versa
      areaGenerator.y0(this.props.height);
      const clipBelowPathStr = areaGenerator(data);
      areaGenerator.y0(0);
      const clipAbovePathStr = areaGenerator(data);

      // make sure we have a unique ID for this chart, so clip path IDs don't affect other charts
      const chartId = _.uniqueId();
      const clipAboveId = `clip-above-area-${chartId}`;
      const clipBelowId = `clip-below-area-${chartId}`;
      const pathStyleAbove = pathStylePositive || pathStyle || {};
      const pathStyleBelow = pathStyleNegative || pathStyle || {};

      return (
        <g className="rct-area-chart--difference">
          <clipPath id={clipAboveId}>
            <path className="rct-area-chart-path" d={clipAbovePathStr} />
          </clipPath>
          <clipPath id={clipBelowId}>
            <path className="rct-area-chart-path" d={clipBelowPathStr} />
          </clipPath>
          <path
            className={`rct-area-chart-path ${pathClassName}`}
            d={areaPathStr}
            clipPath={`url(#${clipAboveId})`}
            style={pathStyleAbove}
          />
          <path
            className={`rct-area-chart-path ${pathClassName}`}
            d={areaPathStr}
            clipPath={`url(#${clipBelowId})`}
            style={pathStyleBelow}
          />
        </g>
      );
    } else {
      return (
        <g className="rct-area-chart">
          <path
            className={`rct-area-chart-path ${pathClassName}`}
            d={areaPathStr}
            style={pathStyle || {}}
          />
        </g>
      );
    }
  }
}
