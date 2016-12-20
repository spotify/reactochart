import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import invariant from 'invariant';

import * as CustomPropTypes from './utils/CustomPropTypes';
import {makeAccessor, domainFromData, domainFromRangeData} from './utils/Data';
import {dataTypeFromScaleType} from './utils/Scale';
import RangeRect from './RangeRect';


function interpolatorFromType(type) {
  switch(type.toLowerCase()) {
    case 'hcl': return d3.interpolateHcl;
    case 'hsl': return d3.interpolateHsl;
    case 'lab': return d3.interpolateLab;
    case 'rgb': return d3.interpolateRgb;
    default: return d3.interpolateHsl;
  }
}

function makeColorScale(domain, colors, interpolator) {
  invariant(domain.length == colors.length, 'makeColorScale: domain.length should equal colors.length');

  if(_.isString(interpolator))
    interpolator = interpolatorFromType(interpolator);

  return d3.scaleLinear()
    .domain(domain)
    .range(colors)
    .interpolate(interpolator);
}

export default class ColorHeatmap extends React.Component {
  static propTypes = {
    // passed from xyplot
    scale: CustomPropTypes.xyObjectOf(React.PropTypes.func.isRequired),

    // data array - should be 1D array of all grid values
    // (if you have a 2D array, _.flatten it)
    data: React.PropTypes.array.isRequired,

    // data getters
    getValue: CustomPropTypes.getter,
    getX: CustomPropTypes.getter,
    getXEnd: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    getYEnd: CustomPropTypes.getter,

    // a custom d3 color scale may be passed...
    colorScale: React.PropTypes.func,
    // ...or else one will be constructed from colors, colorStops and interpolator
    colors: React.PropTypes.array,
    valueDomain: React.PropTypes.array,
    interpolator: React.PropTypes.string
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
          _.times(valueDomain.length, d3.scale.category10().domain(_.range(10)))
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
