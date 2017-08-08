import React from 'react';
import _ from 'lodash';
import {scaleLinear, interpolateHcl, interpolateHsl, interpolateLab, interpolateRgb} from 'd3';
import invariant from 'invariant';
import PropTypes from 'prop-types';

import * as CustomPropTypes from './utils/CustomPropTypes';
import {makeAccessor, domainFromData, domainFromRangeData} from './utils/Data';
import {dataTypeFromScaleType} from './utils/Scale';
import xyPropsEqual from './utils/xyPropsEqual';

import RangeRect from './RangeRect';


function interpolatorFromType(type) {
  switch(type.toLowerCase()) {
    case 'hcl': return interpolateHcl;
    case 'hsl': return interpolateHsl;
    case 'lab': return interpolateLab;
    case 'rgb': return interpolateRgb;
    default: return interpolateHsl;
  }
}

function makeColorScale(domain, colors, interpolator) {
  invariant(domain.length == colors.length, 'makeColorScale: domain.length should equal colors.length');

  if(_.isString(interpolator))
    interpolator = interpolatorFromType(interpolator);

  return scaleLinear()
    .domain(domain)
    .range(colors)
    .interpolate(interpolator);
}

export default class ColorHeatmap extends React.Component {
  static propTypes = {
    /**
     * d3 scale passed from xyplot
     */
    scale: CustomPropTypes.xyObjectOf(PropTypes.func.isRequired),
    /**
     * data array - should be 1D array of all grid values
     * (if you have a 2D array, _.flatten it)
     */
    data: PropTypes.array.isRequired,

    /**
     * data getters
     */
    getValue: CustomPropTypes.getter,
    getX: CustomPropTypes.getter,
    getXEnd: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    getYEnd: CustomPropTypes.getter,

    /**
     * a custom d3 color scale may be passed...
     */
    colorScale: PropTypes.func,
    /**
     * ...or else one will be constructed from colors, colorStops and interpolator
     */
    colors: PropTypes.array,
    valueDomain: PropTypes.array,
    interpolator: PropTypes.string
  };
  static defaultProps = {
    interpolator: 'lab'
  };

  static getDomain(props) {
    const {scaleType, data, getX, getXEnd, getY, getYEnd} = props;
    return {
      x: domainFromRangeData(data, makeAccessor(getX), makeAccessor(getXEnd), dataTypeFromScaleType(scaleType.x)),
      y: domainFromRangeData(data, makeAccessor(getY), makeAccessor(getYEnd), dataTypeFromScaleType(scaleType.y))
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, ['colors', 'valueDomain']);
    return shouldUpdate;
  }

  render() {
    const {data, scale, getValue, getX, getXEnd, getY, getYEnd, interpolator} = this.props;
    const valueAccessor = makeAccessor(getValue);
    let colorScale;

    if(this.props.colorScale) colorScale = this.props.colorScale;
    else {
      const valueDomain = this.props.valueDomain || domainFromData(data, valueAccessor);
      const colors = this.props.colors || (
        (valueDomain.length == 2) ?
          ['#000000', '#ffffff'] :
          _.times(valueDomain.length, scale.schemeCategory10().domain(_.range(10)))
      );
      colorScale = makeColorScale(valueDomain, colors, interpolator);
    }

    return <g className="color-heatmap-chart">
      {data.map((datum, i) => {
        const color = colorScale(valueAccessor(datum));
        const style = {fill: color};
        const key = `heatmap-rect-${i}`;
        return <RangeRect {...{datum, scale, getX, getXEnd, getY, getYEnd, style, key}} />
      })}
    </g>;
  }
}
