import React from 'react';
import _ from 'lodash';

import {inferScaleType, getScaleTicks} from 'utils/Scale';

import XTicks from 'components/XTicks';
import XAxisValueLabels from 'components/XAxisValueLabels';


class XAxis extends React.Component {
  static propTypes = {
    scale: React.PropTypes.func.isRequired
  };

  static defaultProps = _.assign({},
    XTicks.defaultProps,
    {
      width: 400,
      height: 250,
      position: 'bottom',
      placement: undefined
    }
  );

  static getMargin(props) {
    // todo get margin by adding up margins of ticks, labels and axis title
  }

  render() {
    const {scale, height, width, ticks, tickCount, position, inner, tickLength, tickStyle, tickClassName} = this.props;
    const placement = this.props.placement || ((position === 'top') ? 'above' : 'below');

    const ticksProps =
    {scale, height, ticks, tickCount, position, placement, inner, tickLength, tickStyle, tickClassName};

    const axisLineY = (position === 'bottom') ? 0 : height;

    return <g>
      <XAxisValueLabels {...ticksProps} {...{distance: tickLength + 3}}/>
      <XTicks {...ticksProps}/>

      <line x1={0} x2={width} y1={axisLineY} y2={axisLineY} style={{stroke: 'red'}}/>
    </g>;
  }
}

export default XAxis;