import React from "react";
import _ from "lodash";
import {
  scaleLinear,
  interpolateHcl,
  interpolateHsl,
  interpolateLab,
  interpolateRgb
} from "d3";
import invariant from "invariant";
import PropTypes from "prop-types";

import * as CustomPropTypes from "./utils/CustomPropTypes";
import {
  makeAccessor2,
  getValue,
  domainFromData,
  domainFromRangeData
} from "./utils/Data";
import { dataTypeFromScaleType } from "./utils/Scale";
import xyPropsEqual from "./utils/xyPropsEqual";

import RangeRect from "./RangeRect";

function interpolatorFromType(type) {
  switch (type.toLowerCase()) {
    case "hcl":
      return interpolateHcl;
    case "hsl":
      return interpolateHsl;
    case "lab":
      return interpolateLab;
    case "rgb":
      return interpolateRgb;
    default:
      return interpolateHsl;
  }
}

function makeColorScale(domain, colors, interpolator) {
  // invariant(domain.length === colors.length, 'ColorHeatmap makeColorScale: domain.length should equal colors.length');

  if (_.isString(interpolator))
    interpolator = interpolatorFromType(interpolator);

  return scaleLinear()
    .domain(domain)
    .range(colors)
    .interpolate(interpolator);
}

export default class ColorHeatmap extends React.Component {
  static propTypes = {
    /**
     * data array - should be 1D array of all grid values
     * (if you have a 2D array, _.flatten it)
     */
    data: PropTypes.array.isRequired,
    value: CustomPropTypes.valueOrAccessor,
    x: CustomPropTypes.valueOrAccessor,
    xEnd: CustomPropTypes.valueOrAccessor,
    y: CustomPropTypes.valueOrAccessor,
    yEnd: CustomPropTypes.valueOrAccessor,
    /**
     * D3 scale for X axis - provided by XYPlot
     */
    xScale: PropTypes.func,
    /**
     * D3 scale for Y axis - provided by XYPlot
     */
    yScale: PropTypes.func,
    /**
     * a custom d3 color scale may be passed...
     */
    colorScale: PropTypes.func,
    /**
     * ...or else one will be constructed from colors, colorStops and interpolator
     */
    colors: PropTypes.array,
    valueDomain: PropTypes.array,
    interpolator: PropTypes.string,
    /**
     * Inline style object to be applied to each rect,
     * or accessor function which returns a style object.
     */
    rectStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Class attribute to be applied to each rect,
     * or accessor function which returns a class.
     */
    rectClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
  };
  static defaultProps = {
    interpolator: "lab",
    rectStyle: {},
    rectClassName: ""
  };

  static getDomain(props) {
    const { xScaleType, yScaleType, data, x, xEnd, y, yEnd } = props;
    return {
      x: domainFromRangeData(
        data,
        makeAccessor2(x),
        makeAccessor2(xEnd),
        dataTypeFromScaleType(xScaleType)
      ),
      y: domainFromRangeData(
        data,
        makeAccessor2(y),
        makeAccessor2(yEnd),
        dataTypeFromScaleType(yScaleType)
      )
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, [
      "colors",
      "valueDomain"
    ]);
    return shouldUpdate;
  }

  render() {
    const {
      data,
      xScale,
      yScale,
      value,
      x,
      xEnd,
      y,
      yEnd,
      interpolator,
      rectStyle,
      rectClassName
    } = this.props;
    const valueAccessor = makeAccessor2(value);
    let colorScale;

    if (this.props.colorScale) {
      colorScale = this.props.colorScale;
    } else {
      const valueDomain =
        this.props.valueDomain || domainFromData(data, valueAccessor);
      const colors =
        this.props.colors ||
        (valueDomain.length === 2
          ? ["#000000", "#ffffff"]
          : _.times(
              valueDomain.length,
              scale.schemeCategory10().domain(_.range(10))
            ));
      colorScale = makeColorScale(valueDomain, colors, interpolator);
    }

    return (
      <g className="rct-color-heatmap-chart">
        {data.map((d, i) => {
          const color = colorScale(valueAccessor(d));
          const style = { ...getValue(rectStyle, d, i), fill: color };
          const className = `${getValue(rectClassName, d, i)}`;
          const key = `heatmap-rect-${i}`;
          return (
            <RangeRect
              x={getValue(x, d, i)}
              xEnd={getValue(xEnd, d, i)}
              y={getValue(y, d, i)}
              yEnd={getValue(yEnd, d, i)}
              {...{ xScale, yScale, style, className, key }}
            />
          );
        })}
      </g>
    );
  }
}
