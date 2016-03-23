import React from 'react';
import _ from 'lodash';

import {domainFromData} from 'utils/Data';
import {inferScaleType, getScaleTicks, isValidScale, dataTypeFromScaleType, initScale} from 'utils/Scale';
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
    scale: _.get(scale, 'x'), ticks, tickCount: _.get(tickCount, 'x'),
    height, position, placement, tickLength, tickStyle, tickClassName
  };

  const gridProps = {
    scale: _.get(scale, 'x'), ticks, tickCount,
    width, height, lineClassName: gridLineClassName, lineStyle: gridLineStyle
  };

  const labelsProps = {
    scale: _.get(scale, 'x'), ticks, tickCount,
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
    scale: React.PropTypes.object.isRequired
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
  
  static getDomain(props) {
    
  }

  static getTickDomain(props) {
    if(!_.get(props, 'scaleType.x') || !isValidScale(_.get(props, 'scale.x'))) return;
    props = _.defaults({}, props, XAxis.defaultProps);
    const {ticks, tickCount, nice, scaleType, scale} = props;

    if(_.isArray(ticks) && _.isString(_.get(scaleType, 'x')))
      return {x: domainFromData(ticks, _.identity, dataTypeFromScaleType(scaleType.x))};
    else if(nice && isValidScale(_.get(scale, 'x')) && _.isString(_.get(scaleType, 'x'))) {
      // bug - d3 linearScale.copy().nice() modifies original scale, so we must create tempScale instead of copy()ing
      // todo replace this with d3-scale from d3 v4.0
      const tempScale = initScale(scaleType.x).domain(scale.x.domain());
      return {x: tempScale.nice(tickCount || 10).domain()};
    }
  }

  static getMargin(props) {
    // todo figure out margin if labels change after margin?

    let margins = [];

    const {ticksProps, labelsProps, titleProps} = getAxisChildProps(props);

    if(props.showTicks)
      margins.push(XTicks.getMargin(ticksProps));

    if(props.showTitle && props.title)
      margins.push(XAxisTitle.getMargin(titleProps));

    if(props.showLabels)
      margins.push(XAxisValueLabels.getMargin(labelsProps));

    console.log('axis margins', margins);
    console.log('axis margins sum', sumMargins(margins));
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

    return <g>
      {showGrid ? <XGrid {...gridProps} /> : null}

      {showTicks ? <XTicks {...ticksProps}/> : null}

      {showLabels ?
        <XAxisValueLabels {...labelsProps} />
        : null
      }

      {showTitle ? <XAxisTitle {...titleProps} /> : null}

      <line x1={0} x2={width} y1={axisLineY} y2={axisLineY} style={{stroke: 'blue'}}/>
    </g>;
  }
}

export default XAxis;