import React from 'react';
import _ from 'lodash';

import {inferScaleType, getScaleTicks} from 'utils/Scale';

import XTicks from 'components/XTicks';


class XAxis extends React.Component {
  static propTypes = {
    scale: React.PropTypes.func.isRequired
  };

  static defaultProps = _.assign({},
    XTicks.defaultProps,
    {
      width: 400,
      height: 250,
      top: false,
      inner: false
    }
  );

  static getMargin(props) {

  }

  render() {
    const {scale, height, width, tickCount, top, inner, tickLength, tickStyle, tickClassName} = this.props;

    const ticksProps = {scale, height, tickCount, top, inner, tickLength, tickStyle, tickClassName};

    const axisLineY = top ? 0 : height;

    return <g>
      <XTicks {...ticksProps}/>
      <line x1={0} x2={width} y1={axisLineY} y2={axisLineY} style={{stroke: 'red'}}/>
    </g>;
  }
}

export default XAxis;