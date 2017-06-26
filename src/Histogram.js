import React from 'react';
import _ from 'lodash';
import {histogram} from 'd3';
import PropTypes from 'prop-types';
import * as CustomPropTypes from './utils/CustomPropTypes';
import {makeAccessor, domainFromRangeData} from './utils/Data';
import AreaBarChart from './AreaBarChart';

// todo make histogram work horizontally *or* vertically
export default class Histogram extends React.Component {
  static propTypes = {
    // the array of data objects
    data: PropTypes.array.isRequired,
    // accessors for X & Y coordinates
    getValue: CustomPropTypes.getter,

    axisType: PropTypes.object,
    scale: PropTypes.object
  };

  state = {
    histogramData: null
  };

  static getDomain() {
    // todo implement for real
    return {y: 200};
  }

  componentWillMount() {
    const {domain, getValue, data} = this.props;
    const chartHistogram = histogram()
      .domain(domain.x)
      // todo - get this working with arbitrary getValue accessor - seems to be broken -DD
      .value(makeAccessor(getValue))
      .thresholds(30);

    const histogramData = chartHistogram(data);

    this.setState({histogramData});
  }

  render() {
    if(!this.state.histogramData) return <g></g>;
    const {name, scale, axisType, scaleWidth, scaleHeight, plotWidth, plotHeight} = this.props;

    return <AreaBarChart
      data={this.state.histogramData}
      getX={d => d.x0}
      getXEnd={d => d.x1}
      getY={d => d.length}
      {...{name, scale, axisType, scaleWidth, scaleHeight, plotWidth, plotHeight}}
    />;
  }
}
