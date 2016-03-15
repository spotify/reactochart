import React from 'react';
import _ from 'lodash';

import YLine from 'components/YLine';
import {getScaleTicks} from 'utils/Scale';

class YGrid extends React.Component {
  static propTypes = {
    scale: React.PropTypes.func.isRequired
  };
  static defaultProps = {
    height: 250,
    width: 400,
    tickCount: 10,
    ticks: null,
    lineClassName: '',
    lineStyle: {}
  };

  render() {
    const {scale, width, tickCount, lineClassName, lineStyle} = this.props;
    const ticks = this.props.ticks || getScaleTicks(scale, null, tickCount);
    const gridLineClassName = `chart-grid-line chart-grid-line-y ${lineClassName}`;

    return <g className="chart-grid-y">
      {ticks.map((tick, i) => {
        return <YLine {...{
          scale, width, lineStyle,
          lineClassName: gridLineClassName,
          value: tick,
          key: `grid-line-${i}`
        }} />;
      })}
    </g>;
  }
}

export default YGrid;
