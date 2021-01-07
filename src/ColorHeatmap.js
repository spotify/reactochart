import {
  interpolateHcl,
  interpolateHsl,
  interpolateLab,
  interpolateRgb,
} from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import isString from 'lodash/isString';
import times from 'lodash/times';
import range from 'lodash/range';
import PropTypes from 'prop-types';
import React from 'react';
import RangeRect from './RangeRect';
import * as CustomPropTypes from './utils/CustomPropTypes';
import {
  domainFromData,
  domainFromRangeData,
  getValue,
  makeAccessor2,
} from './utils/Data';
import { dataTypeFromScaleType } from './utils/Scale';
import xyPropsEqual from './utils/xyPropsEqual';

function interpolatorFromType(type) {
  switch (type.toLowerCase()) {
    case 'hcl':
      return interpolateHcl;
    case 'hsl':
      return interpolateHsl;
    case 'lab':
      return interpolateLab;
    case 'rgb':
      return interpolateRgb;
    default:
      return interpolateLab;
  }
}

function makeColorScale(domain, colors, interpolator) {
  let interpolatorForColorScale = interpolator;

  if (isString(interpolatorForColorScale)) {
    interpolatorForColorScale = interpolatorFromType(interpolator);
  }

  return scaleLinear()
    .domain(domain)
    .range(colors)
    .interpolate(interpolatorForColorScale);
}

/**
 * `ColorHeatmap` can be used to represent individual values contained in a matrix through colors.
 */
export default class ColorHeatmap extends React.Component {
  static propTypes = {
    /**
     * Array of data to be plotted - should be 1D array of all grid values
     */
    data: PropTypes.array.isRequired,
    /**
     * Accessor function for the value of the datum, called once per datum, or a
     * single value to be used for all data.
     */
    value: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for x values, called once per datum, or a
     * single value to be used for all `x` data.
     */
    x: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for x end values, called once per datum, or a
     * single value to be used for all `xEnd` data.
     */
    xEnd: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for y values, called once per datum, or a
     * single value to be used for all `y` data.
     */
    y: CustomPropTypes.valueOrAccessor,
    /**
     * Accessor function for y end values, called once per datum, or a
     * single value to be used for all `yEnd` data.
     */
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
     * A d3 color scale or function which receives the datum value as an argument.
     * This will be constructred from the `colors`, `valueDomain` and
     * `interpolator` props, if `colorScale` is undefined.
     */
    colorScale: PropTypes.func,
    /**
     * An array of color strings
     */
    colors: PropTypes.array,
    /**
     * Custom domain of the data.
     * Otherwise it will be the extent of your data.
     */
    valueDomain: PropTypes.array,
    /**
     * Interpolator for colors. Possible options include "hcl", "hsl", "lab" and "rgb"
     */
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
    rectClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  };
  static defaultProps = {
    interpolator: 'lab',
    rectStyle: {},
    rectClassName: '',
  };

  static getDomain(props) {
    const { xScaleType, yScaleType, data, x, xEnd, y, yEnd } = props;
    return {
      x: domainFromRangeData(
        data,
        makeAccessor2(x),
        makeAccessor2(xEnd),
        dataTypeFromScaleType(xScaleType),
      ),
      y: domainFromRangeData(
        data,
        makeAccessor2(y),
        makeAccessor2(yEnd),
        dataTypeFromScaleType(yScaleType),
      ),
    };
  }

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, [
      'colors',
      'valueDomain',
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
      rectClassName,
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
          ? ['#000000', '#ffffff']
          : times(valueDomain.length, schemeCategory10().domain(range(10))));
      colorScale = makeColorScale(valueDomain, colors, interpolator);
    }

    return (
      <g className="rct-color-heatmap-chart" aria-hidden="true">
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
