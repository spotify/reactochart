import React from 'react';
import _ from 'lodash';
import {histogram} from 'd3';
import PropTypes from 'prop-types';

import * as CustomPropTypes from './utils/CustomPropTypes';
import {makeAccessor2, domainFromRangeData, domainFromData} from './utils/Data';
import xyPropsEqual from './utils/xyPropsEqual';

import AreaBarChart from './AreaBarChart';

// todo make histogram work horizontally *or* vertically
export default class Histogram extends React.Component {
  static propTypes = {
    /**
     * the array of data objects
     */
    data: PropTypes.array.isRequired,
    value: CustomPropTypes.valueOrAccessor,
    axisType: PropTypes.object,
    scale: PropTypes.object
  };

  state = {
    histogramData: null
  };

  static getScaleType() {
    return {
      xScaleType: 'linear',
      yScaleType: 'linear'
    }
  }
  static getDomain(props) {
    const {data, value} = props;
    // todo implement for real
    return {
      // x: null,
      xDomain: domainFromData(data, makeAccessor2(value)),
      yDomain: [0,200]
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = !xyPropsEqual(this.props, nextProps, []);
    return shouldUpdate;
  }

  componentWillMount() {
    const {xDomain, value, data} = this.props;
    const chartHistogram = histogram()
      .domain(xDomain)
      // todo - get this working with arbitrary getValue accessor - seems to be broken -DD
      .value(makeAccessor2(value))
      .thresholds(30);

    const histogramData = chartHistogram(data);

    this.setState({histogramData});
  }

  render() {
    if(!this.state.histogramData) return <g></g>;
    const {name, scale, axisType, scaleWidth, scaleHeight, plotWidth, plotHeight} = this.props;

    console.log('histo', this.props, this.state);
    return <AreaBarChart
      {...this.props}
      data={this.state.histogramData}
      x={getX0}
      xEnd={getX1}
      y={getLength}
    />;
  }
}

function getX0(d) { return d.x0; }
function getX1(d) { return d.x1; }
function getLength(d) { return d.length; }