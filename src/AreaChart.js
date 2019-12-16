import { area } from 'd3';
import isUndefined from 'lodash/isUndefined';
import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import React from 'react';
import * as CustomPropTypes from './utils/CustomPropTypes';
import { combineDomains, domainFromData, makeAccessor2 } from './utils/Data';
import xyPropsEqual from './utils/xyPropsEqual';

/**
 * `AreaChart` represents a simple bivariate area chart,
 * a filled path drawn between two lines (datasets).
 */

// todo horizontal prop, for filling area horizontally?
// todo support ordinal (like days of the week) data?
// todo build StackedAreaChart that composes multiple AreaCharts

export default class AreaChart extends React.Component {
  static propTypes = {
    /**
     * The array of data objects
     */
    data: PropTypes.array.isRequired,
    /**
     * Accessor function for area X values, called once per datum,
     * or a single X value to be used for the entire line.
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
     * Class attribute to be applied to area path element.
     */
    // TODO: update to allow function to be passed
    pathClassName: PropTypes.string,
    /**
     * Inline style object to be applied to area path element.
     */
    // TODO: update to allow function to be passed
    pathStyle: PropTypes.object,
    /**
     * If isDifference is true, AreaChart generates a "difference chart" with two area paths instead of one:
     * one path which shows when YEnd > Y, and one vice versa, allowing them to be styled differently (eg red/green).
     */
    isDifference: PropTypes.bool,
    /**
     * When isDifference is true, pathStylePositive can be passed to style the
     * positive area difference.
     * Ignored if isDifference is false.
     */
    pathStylePositive: PropTypes.object,
    /**
     * When isDifference is true, pathStyleNegative can be passed to style the
     * negative area difference.
     * Ignored if isDifference is false.
     */
    pathStyleNegative: PropTypes.object,
    /**
     * If true, will show gaps in the shaded area for data where props.isDefined(datum) returns false.
     */
    shouldShowGaps: PropTypes.bool,
    /**
     * If shouldShowGaps is true, isDefined function describes when a datum
     * should be considered "defined" vs. when to show gap by default.
     * Shows gap if either y or yEnd are undefined.
     */
    isDefined: PropTypes.func,
    /**
     * D3 scale for X axis - provided by XYPlot.
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot.
     */
    yScale: PropTypes.func,
    /**
     * Type of X scale - provided by XYPlot.
     */
    xScaleType: PropTypes.string,
    /**
     * Type of Y scale - provided by XYPlot.
     */
    yScaleType: PropTypes.string,
    /**
     * Height of chart - provided by XYPlot.
     */
    height: PropTypes.number,
    /**
     * D3 curve for path generation.
     */
    curve: PropTypes.func,
  };

  static defaultProps = {
    shouldShowGaps: true,
    isDefined: (d, i, accessors) => {
      return (
        !isUndefined(accessors.y(d, i)) && !isUndefined(accessors.yEnd(d, i))
      );
    },
    pathClassName: '',
    pathStyle: {},
  };

  static getDomain(props) {
    // custom Y domain - the total (union) extent of getY and getYEnd combined
    const { data, x, y, yEnd } = props;
    const accessors = {
      x: makeAccessor2(x),
      y: makeAccessor2(y),
      yEnd: makeAccessor2(yEnd),
    };
    return {
      yDomain: combineDomains([
        domainFromData(data, accessors.y),
        domainFromData(data, accessors.yEnd),
      ]),
    };
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, [
      'pathStyle',
      'pathStylePositive',
      'pathStyleNegative',
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
      isDefined,
      curve,
    } = this.props;
    const accessors = {
      x: makeAccessor2(x),
      y: makeAccessor2(y),
      yEnd: makeAccessor2(yEnd),
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

    if (curve) {
      areaGenerator.curve(curve);
    }

    const areaPathStr = areaGenerator(data);

    if (isDifference) {
      // difference chart - create 2 clip paths, one which clips to only show path where YEnd > Y, and other vice versa
      // don't document height prop from XYPlot
      /* eslint-disable react/prop-types */
      areaGenerator.y0(this.props.height);
      /* eslint-enable react/prop-types */
      const clipBelowPathStr = areaGenerator(data);
      areaGenerator.y0(0);
      const clipAbovePathStr = areaGenerator(data);

      // make sure we have a unique ID for this chart, so clip path IDs don't affect other charts
      const chartId = uniqueId();
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
    }

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
