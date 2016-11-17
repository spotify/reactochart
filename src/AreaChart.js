import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';

import {makeAccessor, domainFromData, combineDomains} from './utils/Data';
import * as CustomPropTypes from './utils/CustomPropTypes';

// AreaChart represents a simple bivariate area chart,
// a filled path drawn between two lines (datasets).

// todo horizontal prop, for filling area horizontally?
// todo support categorical data?
// todo support passing 2 data arrays and generating area between them? d3 doesn't seem to support this
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

    scaleType: PropTypes.object,
    scale: PropTypes.object,
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
    const {name, data, getX, getY, getYEnd, scale, pathStyle} = this.props;
    const accessors = {x: makeAccessor(getX), y: makeAccessor(getY), yEnd: makeAccessor(getYEnd)};

    const areaGenerator = d3.svg.area();
    areaGenerator
      .x(d => scale.x(accessors.x(d)))
      .y0(d => scale.y(accessors.y(d)))
      .y1(d => scale.y(accessors.yEnd(d)));

    const areaPathStr = areaGenerator(data);

    return (<g className={`${name} area-chart`}>
      <path className="area-chart-path" d={areaPathStr} style={pathStyle || {}} />
    </g>);
  }
}