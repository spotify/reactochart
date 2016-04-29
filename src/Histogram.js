import React from 'react';
import _ from 'lodash';
import d3 from 'd3';

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
    const histogramData = d3.layout.histogram().bins(30)(this.props.data);
    //console.log('histogram', this.props.data, histogramData);
    this.setState({histogramData});
  }

  render() {
    if(!this.state.histogramData) return <g></g>;
    const {name, scale, axisType, scaleWidth, scaleHeight, plotWidth, plotHeight} = this.props;

    return <AreaBarChart
      data={this.state.histogramData}
      getX="x"
      getXEnd={d => d.x + d.dx}
      getY="y"
      {...{name, scale, axisType, scaleWidth, scaleHeight, plotWidth, plotHeight}}
    />;
  }
}
