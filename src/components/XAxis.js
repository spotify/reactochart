import React from 'react';
import _ from 'lodash';

import {inferScaleType, getScaleTicks} from 'utils/Scale';
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

  const ticksProps = {scale, height, position, placement, ticks, tickCount, tickLength, tickStyle, tickClassName};

  const gridProps = {
    scale, width, height, ticks, tickCount, lineClassName: gridLineClassName, lineStyle: gridLineStyle
  };

  const labelsProps = {
    scale, height, position, placement, ticks, tickCount, labels,
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
    scale: React.PropTypes.func.isRequired
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
    }
  );

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

    if(showLabels) {
      // todo optimize
      const labelsMargin = XAxisValueLabels.getMargin(labelsProps);
      titleProps.distance = titleDistance + labelsMargin[position];
    }

    const axisLineY = (position === 'bottom') ? 0 : height;

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