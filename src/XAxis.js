import React from 'react';
import _ from 'lodash';
import shallowEqual from './utils/shallowEqual';

import {getTickDomain, scaleEqual} from './utils/Scale';
import {sumMargins} from './utils/Margin';
import {getAxisChildProps} from './utils/Axis';
import xyPropsEqual from './utils/xyPropsEqual';

import XTicks from './XTicks';
import XGrid from './XGrid';
import XAxisLabels from './XAxisLabels';
import XAxisTitle from './XAxisTitle';

export default class XAxis extends React.Component {
  static propTypes = {
    scale: React.PropTypes.shape({x: React.PropTypes.func.isRequired}),

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
    labelFormat: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func]),
    labelFormats: React.PropTypes.array,
    labels: React.PropTypes.array,

    tickLength: React.PropTypes.number,
    tickClassName: React.PropTypes.string,
    tickStyle: React.PropTypes.object,

    gridLineClassName: React.PropTypes.string,
    gridLineStyle: React.PropTypes.object,

    onMouseEnterLabel: React.PropTypes.func,
    onMouseMoveLabel: React.PropTypes.func,
    onMouseLeaveLabel: React.PropTypes.func
  };

  static defaultProps = {
    width: 400,
    height: 250,
    position: 'bottom',
    nice: true,
    showTitle: true,
    showLabels: true,
    showTicks: true,
    showGrid: true,
    tickLength: 5,
    labelDistance: 3,
    titleDistance: 5,
    spacing: {top: 0, bottom: 0, left: 0, right: 0}
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !xyPropsEqual(this.props, nextProps);
  }

  static getTickDomain(props) {
    if(!_.get(props, 'scale.x')) return;
    props = _.defaults({}, props, XAxis.defaultProps);
    return {x: getTickDomain(props.scale.x, props)};
  }

  static getMargin(props) {
    // todo figure out margin if labels change after margin?
    const {ticksProps, labelsProps, titleProps} = getAxisChildProps(props);
    let margins = [];

    if(props.showTicks)
      margins.push(XTicks.getMargin(ticksProps));

    if(props.showTitle && props.title)
      margins.push(XAxisTitle.getMargin(titleProps));

    if(props.showLabels)
      margins.push(XAxisLabels.getMargin(labelsProps));

    return sumMargins(margins);
  }

  render() {
    const {
      width, height, position, spacing, tickLength, titleDistance, labelDistance,
      showTitle, showLabels, showTicks, showGrid
    } = this.props;

    const {ticksProps, gridProps, labelsProps, titleProps} = getAxisChildProps(this.props);

    labelsProps.distance = labelDistance + (showTicks ? tickLength : 0);

    if(showTitle && showLabels) {
      // todo optimize so we don't generate labels twice
      const labelsMargin = XAxisLabels.getMargin(labelsProps);
      titleProps.distance = titleDistance + labelsMargin[position];
    } else if(showTitle && showTicks) {
      titleProps.distance = titleDistance + tickLength;
    }

    const axisLineY = (position === 'bottom') ?
      height + spacing.bottom : -spacing.top;
    // `width` is width of inner chart *not* including spacing - add spacing to figure out where to draw line
    const axisLineWidth = width + spacing.left + spacing.right;

    return <g className="chart-axis chart-axis-x">
      {showGrid ? <XGrid {...gridProps} /> : null}

      {showTicks ? <XTicks {...ticksProps}/> : null}

      {showLabels ? <XAxisLabels {...labelsProps} /> : null}

      {showTitle ? <XAxisTitle {...titleProps} /> : null}

      <line
        className="chart-axis-line chart-axis-line-x"
        x1={-spacing.left} x2={width + spacing.right}
        y1={axisLineY} y2={axisLineY}
      />
    </g>;
  }
}
