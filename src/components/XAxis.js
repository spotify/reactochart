import React from 'react';
import _ from 'lodash';

import {getTickDomain} from 'utils/Scale';
import {sumMargins} from 'utils/Margin';

import XTicks from 'components/XTicks';
import XGrid from 'components/XGrid';
import XAxisValueLabels from 'components/XAxisValueLabels';
import XAxisTitle from 'components/XAxisTitle';

function getAxisChildProps(props) {
  const {
    scale, width, height, position, placement,
    ticks, tickCount, tickLength, tickClassName, tickStyle,
    title, titleDistance, titleAlign, titleRotate, titleStyle,
    labelDistance, labelClassName, labelStyle, labelFormat, labelFormats, labels,
    gridLineClassName, gridLineStyle,
    showTitle, showLabels, showTicks, showGrid
  } = props;

  const ticksProps = {
    scale, ticks, tickCount,
    height, position, placement, tickLength, tickStyle, tickClassName
  };

  const gridProps = {
    scale, ticks, tickCount,
    width, height, lineClassName: gridLineClassName, lineStyle: gridLineStyle
  };

  const labelsProps = {
    scale, ticks, tickCount,
    height, position, placement, labels,
    labelClassName, labelStyle, distance: labelDistance, format: labelFormat, formats: labelFormats
  };

  const titleProps = {
    width, height, position, placement, title,
    titleStyle, distance: titleDistance, alignment: titleAlign, rotate: titleRotate
  };

  return {ticksProps, gridProps, labelsProps, titleProps};
}


class XAxis extends React.Component {
  static propTypes = {
    // scale: React.PropTypes.func.isRequired
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
    labelFormat: React.PropTypes.object,
    labelFormats: React.PropTypes.array,
    labels: React.PropTypes.array,

    tickLength: React.PropTypes.number,
    tickClassName: React.PropTypes.string,
    tickStyle: React.PropTypes.object,

    gridLineClassName: React.PropTypes.string,
    gridLineStyle: React.PropTypes.object
  };

  static defaultProps = _.assign({},
    XTicks.defaultProps,
    {
      width: 400,
      height: 250,
      showTitle: true,
      showLabels: true,
      showTicks: true,
      showGrid: true,
      position: 'bottom',
      placement: undefined,

      titleDistance: 5,
      labelDistance: 3,

      ticks: undefined,
      tickCount: undefined,
      nice: true
    }
  );

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
      margins.push(XAxisValueLabels.getMargin(labelsProps));

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
      const labelsMargin = XAxisValueLabels.getMargin(labelsProps);
      titleProps.distance = titleDistance + labelsMargin[position];
    } else if(showTitle && showTicks) {
      titleProps.distance = titleDistance + tickLength;
    }

    const axisLineY = (position === 'bottom') ? height : 0;

    return <g className="chart-axis chart-axis-x">
      {showGrid ? <XGrid {...gridProps} /> : null}

      {showTicks ? <XTicks {...ticksProps}/> : null}

      {showLabels ? <XAxisValueLabels {...labelsProps} /> : null}

      {showTitle ? <XAxisTitle {...titleProps} /> : null}

      <line className="chart-axis-line chart-axis-line-x" x1={0} x2={width} y1={axisLineY} y2={axisLineY} />
    </g>;
  }
}

export default XAxis;
