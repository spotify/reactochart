import React from 'react';
import _ from 'lodash';

import YLine from './YLine';
import {getScaleTicks, getTickDomain} from './utils/Scale';

export default class YGrid extends React.Component {
  static propTypes = {
    scale: React.PropTypes.shape({y: React.PropTypes.func.isRequired}),
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    nice: React.PropTypes.bool,
    ticks: React.PropTypes.array,
    tickCount: React.PropTypes.number,
    lineClassName: React.PropTypes.string,
    lineStyle: React.PropTypes.object
  };
  static defaultProps = {
    nice: true,
    lineStyle: {}
  };

  static getTickDomain(props) {
    if(!_.get(props, 'scale.y')) return;
    props = _.defaults({}, props, YGrid.defaultProps);
    return {y: getTickDomain(props.scale.y, props)};
  }

  render() {
    const {width, spacing, tickCount, lineClassName, lineStyle} = this.props;
    const scale = this.props.scale.y;
    const ticks = this.props.ticks || getScaleTicks(scale, null, tickCount);
    const className = `chart-grid-line chart-grid-line-y ${lineClassName || ''}`;

    return <g className="chart-grid-y">
      {ticks.map((tick, i) => {
        return <YLine {...{
          scale: this.props.scale,
          value: tick,
          width: width + spacing.left + spacing.right,
          className,
          style: lineStyle,
          key: `grid-y-line-${i}`
        }} />;
      })}
    </g>;
  }
}
