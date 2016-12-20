import React from 'react';
import _ from 'lodash';
import {histogram} from 'd3';

import AreaBarChart from './AreaBarChart';

export default class Histogram extends React.Component {
  static propTypes = {
    // the array of data objects
    data: React.PropTypes.array.isRequired,
    // accessor for X & Y coordinates
    getValue: React.PropTypes.object,
    axisType: React.PropTypes.object,
    scale: React.PropTypes.object
  };

  state = {
    histogramData: null
  };

  static getDomain() {
    // todo implement for real
    return {y: 200};
  }

  componentWillMount() {
    const histogramGenerator = histogram()
      .domain(this.props.domain.x)
      .thresholds(30);

    // why is `histogram` returning an array of length 40+ when it should be exactly 30???
    const histogramData = histogramGenerator(this.props.data);

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
