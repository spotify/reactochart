import React from 'react';
import _ from 'lodash';

import XLine from 'XLine';
import {getScaleTicks, getTickDomain} from 'utils/Scale';

class XGrid extends React.Component {
  static propTypes = {
    scale: React.PropTypes.object
  };
  static defaultProps = {
    height: 250,
    width: 400,
    nice: true,
    tickCount: 10,
    ticks: null,
    lineClassName: '',
    lineStyle: {}
  };

  static getTickDomain(props) {
    if(!_.get(props, 'scale.x')) return;
    props = _.defaults({}, props, XGrid.defaultProps);
    return {x: getTickDomain(props.scale.x, props)};
  }

  render() {
    const {height, tickCount, lineClassName, lineStyle} = this.props;
    const scale = this.props.scale.x;
    const ticks = this.props.ticks || getScaleTicks(scale, null, tickCount);
    const gridLineClassName = `chart-grid-line chart-grid-line-x ${lineClassName}`;

    return <g className="chart-grid-x">
      {ticks.map((tick, i) => {
        return <XLine {...{
          scale: this.props.scale, height, lineStyle,
          lineClassName: gridLineClassName,
          value: tick,
          key: `grid-line-${i}`
        }} />;
      })}
    </g>;
  }
}

export default XGrid;
