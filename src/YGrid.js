import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import YLine from './YLine';
import {getScaleTicks, getTickDomain} from './utils/Scale';

export default class YGrid extends React.Component {
  static propTypes = {
    scale: PropTypes.shape({y: PropTypes.func.isRequired}),
    width: PropTypes.number,
    height: PropTypes.number,
    nice: PropTypes.bool,
    ticks: PropTypes.array,
    tickCount: PropTypes.number,
    lineClassName: PropTypes.string,
    lineStyle: PropTypes.object
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
          className, spacing,
          scale: this.props.scale,
          value: tick,
          width: width,
          style: lineStyle,
          key: `grid-y-line-${i}`
        }} />;
      })}
    </g>;
  }
}
