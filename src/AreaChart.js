import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {area} from 'd3';

import {makeAccessor, domainFromData, combineDomains} from './utils/Data';
import * as CustomPropTypes from './utils/CustomPropTypes';

// AreaChart represents a simple bivariate area chart,
// a filled path drawn between two lines (datasets).

// todo horizontal prop, for filling area horizontally?
// todo support categorical data?
// todo build StackedAreaChart that composes multiple AreaCharts

export default class AreaChart extends React.Component {
  static propTypes = {
    // the array of data objects
    data: PropTypes.array.isRequired,
    // accessors for X & Y coordinates
    getX: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    getYEnd: CustomPropTypes.getter,
    // style applied to path element
    pathStyle: PropTypes.object,

    // if isDifference is true, AreaChart generates a "difference chart" with two area paths instead of one:
    // one path which shows when YEnd > Y, and one vice versa, allowing them to be styled differently (eg red/green)
    isDifference: PropTypes.bool,
    // when isDifference is true, pathStylePositive and pathStyleNegative can be passed to give 2 different inline
    // styles to the two different paths which are generated
    // ignored if isDifference is false
    pathStylePositive: PropTypes.object,
    pathStyleNegative: PropTypes.object,

    scaleType: PropTypes.object,
    scale: PropTypes.object,
    // if true, will show gaps in the shaded area for data where props.isDefined(datum) returns false
    shouldShowGaps: PropTypes.bool,
    // if shouldShowGaps is true, isDefined function describes when a datum should be considered "defined" vs. when to show gap
    // by default, shows gap if either y or yEnd are undefined
    isDefined: PropTypes.func
  };
  static defaultProps = {
    shouldShowGaps: true,
    isDefined: (d, i, accessors) => {
      return !_.isUndefined(accessors.y(d, i)) && !_.isUndefined(accessors.yEnd(d, i));
    }
  };

  static getDomain(props) {
    // custom Y domain - the total (union) extent of getY and getYEnd combined
    const {data, getX, getY, getYEnd} = props;
    const accessors = {x: makeAccessor(getX), y: makeAccessor(getY), yEnd: makeAccessor(getYEnd)};
    return {
      y: combineDomains([
        domainFromData(data, accessors.y),
        domainFromData(data, accessors.yEnd)
      ])
    }
  }

  render() {
    const {name, data, getX, getY, getYEnd, scale, isDifference, pathStyle,
      pathStylePositive, pathStyleNegative, shouldShowGaps, isDefined} = this.props;
    const accessors = {x: makeAccessor(getX), y: makeAccessor(getY), yEnd: makeAccessor(getYEnd)};

    // create d3 area path generator
    const areaGenerator = area();

    // if gaps in data should be shown, use `props.isDefined` function as the `defined` param for d3's area generator;
    // but wrap it & pass in accessors as well, so that the function can easily access the relevant data values
    if(shouldShowGaps) {
      areaGenerator.defined((d, i) => isDefined(d, i, accessors));
    }

    areaGenerator
      .x((d, i) => scale.x(accessors.x(d, i)))
      .y0((d, i) => scale.y(accessors.y(d, i)))
      .y1((d, i) => scale.y(accessors.yEnd(d, i)));

    const areaPathStr = areaGenerator(data);

    if(isDifference) {
      // difference chart - create 2 clip paths, one which clips to only show path where YEnd > Y, and other vice versa
      areaGenerator.y0(this.props.height);
      const clipBelowPathStr = areaGenerator(data);
      areaGenerator.y0(0);
      const clipAbovePathStr = areaGenerator(data);

      // make sure we have a unique ID for this chart, so clip path IDs don't affect other charts
      const chartId = name || _.uniqueId();
      const clipAboveId = `clip-above-area-${chartId}`;
      const clipBelowId = `clip-below-area-${chartId}`;
      const pathStyleAbove = pathStylePositive || pathStyle || {};
      const pathStyleBelow = pathStyleNegative || pathStyle || {};

      return (<g className={`${name} area-chart`}>
        <clipPath id={clipAboveId}>
          <path d={clipAbovePathStr} />
        </clipPath>
        <clipPath id={clipBelowId}>
          <path d={clipBelowPathStr} />
        </clipPath>
        <path className="area-chart-path" d={areaPathStr} clipPath={`url(#${clipAboveId})`} style={pathStyleAbove} />
        <path className="area-chart-path" d={areaPathStr} clipPath={`url(#${clipBelowId})`} style={pathStyleBelow} />
      </g>);

    } else {
      return (<g className={`${name} area-chart`}>
        <path className="area-chart-path" d={areaPathStr} style={pathStyle || {}} />
      </g>);
    }
  }
}
