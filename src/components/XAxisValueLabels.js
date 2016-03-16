import React from 'react';
import _ from 'lodash';
import measureText from 'measure-text';

import {getScaleTicks} from 'utils/Scale';
import resolveObjectProps from 'utils/resolveObjectProps';

class XAxisValueLabels extends React.Component {
  static propTypes = {
    scale: React.PropTypes.func.isRequired
  };
  static defaultProps = {
    height: 250,
    top: false,
    inner: false,
    tickCount: 10,
    ticks: null,
    labelClassName: '',
    labelStyle: {
      fontFamily: "Helvetica, sans-serif",
      fontSize: '20px',
      lineHeight: 1,
      textAnchor: 'middle',
      //dominantBaseline: 'text-before-edge'
      //textAnchor: 'left'
    }
  };

  static getMargin(props) {
    //const {inner, tickLength, top} = _.defaults({}, props, XTicks.defaultProps);
    //const margin = inner ? {} :
    //  top ? {top: tickLength || 0} : {bottom: tickLength || 0};
    //return _.defaults(margin, {top: 0, bottom: 0, left: 0, right: 0});
  }

  render() {



    const {height, scale, tickCount, top, inner, labelStyle, labelClassName} = this.props;
    const ticks = this.props.ticks || getScaleTicks(scale, null, tickCount);
    const className = `chart-value-label chart-value-label-x ${labelClassName}`;
    const transform = top ? '' : `translate(0,${height})`;

    const style = _.defaults(labelStyle, XAxisValueLabels.defaultProps.labelStyle);


    return <g className="chart-value-labels-x" transform={transform}>
      {ticks.map((tick, i) => {
        const x = scale(tick);
        const labelStr = tick;
        //const labelStr = "why";
        const measured = measureText(_.assign({text: labelStr}, XAxisValueLabels.defaultProps.labelStyle));
        console.log(measured);
        return <g>
          <rect {...{
            x: x - (measured.width.value / 2),
            //y: -measured.height.value,
            y: -20,
            width: measured.width.value,
            height: 20,
            fill: 'lightblue'}}
          />
          <text {...{className, dy:"-0.2em", style, x}}>
            {labelStr}
            {/* formatAxisLabel(value, type, labelFormat, emptyLabel) */}
          </text>
        </g>;
      })}
    </g>;
  }
}

export default XAxisValueLabels;
