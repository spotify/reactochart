import React from 'react';
import invariant from 'invariant';

import * as CustomPropTypes from './utils/CustomPropTypes';
import Bar from './Bar';
import {accessor, hasOneOfTwo} from './util';
import {hasXYScales} from './utils/Scale';


export default class RangeBarChart extends React.Component {
  static propTypes = {
    scale: CustomPropTypes.xyObjectOf(React.PropTypes.func.isRequired),
    data: React.PropTypes.array,
    horizontal: React.PropTypes.bool,

    getX: CustomPropTypes.getter,
    getXEnd: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    getYEnd: CustomPropTypes.getter,

    barThickness: React.PropTypes.number,
    barClassName: React.PropTypes.string,
    barStyle: React.PropTypes.object
  };
  static defaultProps = {
    data: [],
    horizontal: false,
    barThickness: 8,
    barClassName: '',
    barStyle: {}

  };
  render() {
    const {scale, data, horizontal, getX, getXEnd, getY, getYEnd, barThickness, barClassName, barStyle} = this.props;
    invariant(hasXYScales(scale), `RangeBarChart.props.scale.x and scale.y must both be valid d3 scales`);
    // invariant(hasOneOfTwo(getXEnd, getYEnd), `RangeBarChart expects a getXEnd *or* getYEnd prop, but not both.`);

    const accessors = {x: accessor(getX), y: accessor(getY)};
    const endAccessors = {x: accessor(getXEnd), y: accessor(getYEnd)};
    const barProps = {
      scale,
      thickness: barThickness,
      className: `chart-bar ${barClassName}`,
      style: barStyle
    };

    return <g>
      {data.map((d, i) => {
        const thisBarProps = {
          xValue: accessors.x(d),
          yValue: accessors.y(d),
          key: `chart-bar-${i}`,
          ...barProps
        };

        return horizontal ?
          <Bar xEndValue={endAccessors.x(d)} {...thisBarProps} /> :
          <Bar yEndValue={endAccessors.y(d)} {...thisBarProps} />;
      })}
    </g>;
  }
}
