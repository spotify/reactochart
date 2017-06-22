import React from 'react';
import _ from 'lodash';

import {getTickDomain} from './utils/Scale';
import {sumMargins} from './utils/Margin';
import {getAxisChildProps} from './utils/Axis'
import xyPropsEqual from './utils/xyPropsEqual';


import YTicks from './YTicks';
import YGrid from './YGrid';
import YAxisLabels from './YAxisLabels';
import YAxisTitle from './YAxisTitle';

export default class YAxis extends React.Component {
  static propTypes = {
    scale: React.PropTypes.shape({y: React.PropTypes.func.isRequired}),

    width: React.PropTypes.number,
    height: React.PropTypes.number,
    position: React.PropTypes.string,
    placement: React.PropTypes.string,
    nice: React.PropTypes.bool,
    ticks: React.PropTypes.array,
    tickCount: React.PropTypes.number,

    showTitle: React.PropTypes.bool,
    showLabels: React.PropTypes.bool,
    showTicks: React.PropTypes.bool,
    showGrid: React.PropTypes.bool,

    title: React.PropTypes.string,
    titleDistance: React.PropTypes.number,
    titleAlign: React.PropTypes.string,
    titleRotate: React.PropTypes.bool,
    titleStyle: React.PropTypes.object,

    labelDistance: React.PropTypes.number,
    labelClassName: React.PropTypes.string,
    labelStyle: React.PropTypes.object,
    labelFormat: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    labelFormats: React.PropTypes.array,
    labels: React.PropTypes.array,

    tickLength: React.PropTypes.number,
    tickClassName: React.PropTypes.string,
    tickStyle: React.PropTypes.object,

    gridLineClassName: React.PropTypes.string,
    gridLineStyle: React.PropTypes.object
  };

  static defaultProps = {
    width: 400,
    height: 250,
    position: 'left',
    nice: true,
    showTitle: true,
    showLabels: true,
    showTicks: true,
    showGrid: true,
    tickLength: 5,
    labelDistance: 3,
    titleDistance: 5
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !xyPropsEqual(this.props, nextProps);
  }

  static getTickDomain(props) {
    if(!_.get(props, 'scale.y')) return;
    props = _.defaults({}, props, YAxis.defaultProps);
    return {y: getTickDomain(props.scale.y, props)};
  }

  static getMargin(props) {
    // todo figure out margin if labels change after margin?
    const {ticksProps, labelsProps, titleProps} = getAxisChildProps(props);
    let margins = [];

    if(props.showTicks)
      margins.push(YTicks.getMargin(ticksProps));

    if(props.showTitle && props.title)
      margins.push(YAxisTitle.getMargin(titleProps));

    if(props.showLabels)
      margins.push(YAxisLabels.getMargin(labelsProps));

    return sumMargins(margins);
  }

  render() {
    const {
      width, height, position, tickLength, titleDistance, labelDistance,
      showTitle, showLabels, showTicks, showGrid
    } = this.props;

    const {ticksProps, gridProps, labelsProps, titleProps} = getAxisChildProps(this.props);

    labelsProps.distance = labelDistance + (showTicks ? tickLength : 0);

    if(showTitle && showLabels) {
      // todo optimize so we don't generate labels twice
      const labelsMargin = YAxisLabels.getMargin(labelsProps);
      titleProps.distance = titleDistance + labelsMargin[position];
    } else if(showTitle && showTicks) {
      titleProps.distance = titleDistance + tickLength;
    }

    const axisLineX = (position === 'left') ? 0 : width;

    return <g className="chart-axis chart-axis-y">
      {showGrid ? <YGrid {...gridProps} /> : null}

      {showTicks ? <YTicks {...ticksProps}/> : null}

      {showLabels ? <YAxisLabels {...labelsProps} /> : null}

      {showTitle ? <YAxisTitle {...titleProps} /> : null}

      <line className="chart-axis-line chart-axis-line-y" x1={axisLineX} x2={axisLineX} y1={0} y2={height} />
    </g>;
  }
}
