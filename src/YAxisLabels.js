import React from 'react';
import _ from 'lodash';

import MeasuredValueLabel from './MeasuredValueLabel';
import {getScaleTicks, inferScaleType, getTickDomain} from './utils/Scale';
import {checkLabelsDistinct, countRangeOverlaps, makeLabelFormatters, getLabelXRange, getLabelsYOverhang}
  from './utils/Label';
import xyPropsEqual from './utils/xyPropsEqual';


function resolveYLabelsForValues(scale, values, formats, style, force = true) {
  // given a set of Y-values to label, and a list of formatters to try,
  // find the first formatter that produces a set of labels which are distinct
  // since we currently do not support rotated axis value labels,
  // we do not check if they fit on the axis (unlike X labels), since all Y labels will have the same height
  // returns the formatter and the generated labels

  let labels;
  let attempts = [];
  const goodFormat = _.find(formats, format => {
    const testLabels = values.map(value => MeasuredValueLabel.getLabel({value, format, style}));

    const areLabelsDistinct = checkLabelsDistinct(testLabels);
    if(!areLabelsDistinct) {
      // console.log('labels are not distinct', _.map(testLabels, 'text'));
      attempts.push({labels: testLabels, format, areLabelsDistinct});
      return false;
    }

    labels = testLabels;
    return true;
  });

  if(!_.isUndefined(goodFormat)) {
    // found labels which work, return them
    return {labels, format: goodFormat, areLabelsDistinct: true, collisionCount: 0};
  } else {
    // none of the sets of labels are good
    // if we're not forced to decide, return all the labels we tried (let someone else decide)
    if(!force) return {attempts};

    // forced to decide, choose the least bad option
    // super bad, we don't have any label sets with distinct labels. return the last attempt.
    return _.last(attempts);
  }
}

class YAxisValueLabels extends React.Component {
  static propTypes = {
    scale: React.PropTypes.object,
    // Label Handling
    onMouseEnterLabel: React.PropTypes.func,
    onMouseMoveLabel: React.PropTypes.func,
    onMouseLeaveLabel: React.PropTypes.func
    // placement: undefined,
    // format: undefined,
    // formats: undefined,
    // labels: undefined
  };
  static defaultProps = {
    height: 250,
    width: 400,
    position: 'left',
    distance: 4,
    nice: true,
    tickCount: 10,
    ticks: null,
    labelClassName: '',
    labelStyle: {
      fontFamily: "Helvetica, sans-serif",
      fontSize: '14px',
      lineHeight: 1,
      textAnchor: 'end'
    },
    spacing: {top: 0, bottom: 0, left: 0, right: 0}
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !xyPropsEqual(this.props, nextProps);
  }

  static getTickDomain(props) {
    if(!_.get(props, 'scale.y')) return;
    props = _.defaults({}, props, YAxisValueLabels.defaultProps);
    return {y: getTickDomain(props.scale.y, props)};
  }

  static getMargin(props) {
    props = _.defaults({}, props, YAxisValueLabels.defaultProps);
    const {position, placement, distance, labelStyle} = props;
    const scale = props.scale.y;
    const labels = props.labels || YAxisValueLabels.getLabels(props);
    const zeroMargin = {top: 0, bottom: 0, left: 0, right: 0};

    if((position === 'left' && placement === 'after') || (position == 'right' && placement === 'before'))
      return zeroMargin;

    const marginX = _.max(labels.map(label => Math.ceil(distance + label.width)));
    const [top, bottom] = getLabelsYOverhang(scale, labels, 'middle');

    return _.defaults({[position] : marginX, top, bottom}, zeroMargin);
  }

  static getDefaultFormats(scaleType) {
    const timeFormatStrs = ['YYYY', 'YY', 'MMM YYYY', 'M/YY'];
    const numberFormatStrs = ["0.[00]a", "0,0", "0.[0]", "0.[00]", "0.[0000]", "0.[000000]"];

    return (scaleType === 'ordinal') ? [_.identity] :
      (scaleType === 'time') ? timeFormatStrs :
        numberFormatStrs;
  }

  static getLabels(props) {
    const {tickCount, labelStyle} = _.defaults(props, {}, YAxisValueLabels.defaultProps);
    const scale = props.scale.y;
    const ticks = props.ticks || getScaleTicks(scale, null, tickCount);
    const style = _.defaults(labelStyle, YAxisValueLabels.defaultProps.labelStyle);

    const scaleType = inferScaleType(scale);
    const propsFormats = props.format ? [props.format] : props.formats;
    const formatStrs = (_.isArray(propsFormats) && propsFormats.length) ?
      propsFormats : YAxisValueLabels.getDefaultFormats(scaleType);
    const formats = makeLabelFormatters(formatStrs, scaleType);

    // todo resolve ticks also
    // if there are so many ticks that no combination of labels can fit on the axis,
    // nudge down the tickCount and try again
    // doing this will require communicating the updated ticks/tickCount back to the parent element...

    const {labels} = resolveYLabelsForValues(scale, ticks, formats, style);
    // console.log('resolveYLabelsForValues took ', performance.now() - start);
    // console.log('found labels', labels);
    return labels;
  }

  render() {
    // todo: position: 'zero' prop to position along the zero line
    const {width, position, distance, labelStyle, labelClassName, onMouseEnterLabel, onMouseMoveLabel, onMouseLeaveLabel, spacing} = this.props;
    const scale = this.props.scale.y;
    const placement = this.props.placement || ((position === 'left') ? 'before' : 'after');
    const className = `chart-value-label chart-value-label-y ${labelClassName}`;
    const textAnchor = (placement === 'before') ? 'end' : 'start';
    const style = _.defaults({textAnchor}, labelStyle, YAxisValueLabels.defaultProps.labelStyle);
    const labels = this.props.labels || YAxisValueLabels.getLabels(this.props);
    const transform = (position === 'left') ?
      `translate(${-spacing.left}, 0)` : `translate(${width + spacing.right}, 0)`;

    return <g className="chart-value-labels-y" transform={transform}>
      {labels.map((label, i) => {
        const y = scale(label.value);
        const x = (placement === 'before') ? -distance : distance;
         
        const [onMouseEnter, onMouseMove, onMouseLeave] =
          ['onMouseEnterLabel', 'onMouseMoveLabel', 'onMouseLeaveLabel'].map(eventName => {
            // partially apply this bar's data point as 2nd callback argument
            const callback = _.get(this.props, eventName);
            return _.isFunction(callback) ? _.partial(callback, _, label.value) : null;
        });

        return <g key={`x-axis-label-${i}`} {...{onMouseEnter, onMouseMove, onMouseLeave}}>
          {/* <YAxisLabelDebugRect {...{x, y, label, style}}/> */}
          <MeasuredValueLabel value={label.value} {...{x, y, className, dy:"0.35em", style}}>
            {label.text}
          </MeasuredValueLabel>
        </g>;
      })}
    </g>;
  }
}

class YAxisLabelDebugRect extends React.Component {
  render() {
    const {x, y, label, style} = this.props;
    const xAdj = (style.textAnchor === 'end') ? x - label.width : x;
    return <rect {...{
      x: xAdj,
      y: y - (label.height / 2),
      width: label.width,
      height: label.height,
      fill: 'orange'
    }} />;
  }
}

export default YAxisValueLabels;
