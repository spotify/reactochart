import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import {getScaleTicks, getTickDomain} from './utils/Scale';
import XLine from './XLine';


export default class XGrid extends React.Component {
  static propTypes = {
    scale: PropTypes.shape({x: PropTypes.func.isRequired}),
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
    if(!_.get(props, 'scale.x')) return;
    props = _.defaults({}, props, XGrid.defaultProps);
    return {x: getTickDomain(props.scale.x, props)};
  }

  render() {
    const {height, spacing, tickCount, lineClassName, lineStyle} = this.props;
    const scale = this.props.scale.x;
    const ticks = this.props.ticks || getScaleTicks(scale, null, tickCount);
    const className = `chart-grid-line chart-grid-line-x ${lineClassName || ''}`;

    return <g className="chart-grid-x">
      {ticks.map((tick, i) => {
        return <XLine {...{
          height, className, spacing,
          scale: this.props.scale,
          value: tick,
          style: lineStyle,
          key: `grid-x-line-${i}`
        }} />;
      })}
    </g>;
  }
}
