import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

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
    yScale: PropTypes.func,
    height: PropTypes.number,
    width: PropTypes.number,
    position: PropTypes.oneOf(['left', 'right']),
    placement: PropTypes.oneOf(['before', 'after']),
    distance: PropTypes.number,
    nice: PropTypes.bool,
    tickCount: PropTypes.number,
    ticks: PropTypes.array,
    labelClassName: PropTypes.string,
    labelStyle: PropTypes.string,
    spacingLeft: PropTypes.number,
    spacingRight: PropTypes.number,
    // Label Handling
    onMouseEnterLabel: PropTypes.func,
    onMouseMoveLabel: PropTypes.func,
    onMouseLeaveLabel: PropTypes.func
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
    spacingLeft: 0,
    spacingRight: 0
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !xyPropsEqual(this.props, nextProps);
  }

  static getTickDomain(props) {
    if(!props.yScale) return;
    props = _.defaults({}, props, YAxisValueLabels.defaultProps);
    return {yTickDomain: getTickDomain(props.yScale, props)};
  }

  static getMargin(props) {
    props = _.defaults({}, props, YAxisValueLabels.defaultProps);
    const {yScale, position, placement, distance, labelStyle} = props;
    const labels = props.labels || YAxisValueLabels.getLabels(props);
    const zeroMargin = {marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0};

    if((position === 'left' && placement === 'after') || (position === 'right' && placement === 'before'))
      return zeroMargin;

    const marginX = _.max(labels.map(label => Math.ceil(distance + label.width)));
    const [marginTop, marginBottom] = getLabelsYOverhang(yScale, labels, 'middle');

    return _.defaults({[`margin${_.capitalize(position)}`]: marginX, marginTop, marginBottom}, zeroMargin);
  }

  static getDefaultFormats(scaleType) {
    const timeFormatStrs = ['YYYY', "'YY", 'MMM YYYY', 'M/YY'];
    const numberFormatStrs = ["0.[00]a", "0,0", "0.[0]", "0.[00]", "0.[0000]", "0.[000000]"];

    return (scaleType === 'ordinal') ? [_.identity] :
      (scaleType === 'time') ? timeFormatStrs :
        numberFormatStrs;
  }

  static getLabels(props) {
    const {tickCount, labelStyle, yScale} = _.defaults(props, {}, YAxisValueLabels.defaultProps);
    const ticks = props.ticks || getScaleTicks(yScale, null, tickCount);
    const style = _.defaults(labelStyle, YAxisValueLabels.defaultProps.labelStyle);

    const scaleType = inferScaleType(yScale);
    const propsFormats = props.format ? [props.format] : props.formats;
    const formatStrs = (_.isArray(propsFormats) && propsFormats.length) ?
      propsFormats : YAxisValueLabels.getDefaultFormats(scaleType);
    const formats = makeLabelFormatters(formatStrs, scaleType);

    // todo resolve ticks also
    // if there are so many ticks that no combination of labels can fit on the axis,
    // nudge down the tickCount and try again
    // doing this will require communicating the updated ticks/tickCount back to the parent element...

    const {labels} = resolveYLabelsForValues(yScale, ticks, formats, style);
    // console.log('resolveYLabelsForValues took ', performance.now() - start);
    // console.log('found labels', labels);
    return labels;
  }

  render() {
    // todo: position: 'zero' prop to position along the zero line
    const {width, yScale, position, distance, labelStyle, labelClassName, onMouseEnterLabel, onMouseMoveLabel, onMouseLeaveLabel, spacingLeft, spacingRight} = this.props;
    const placement = this.props.placement || ((position === 'left') ? 'before' : 'after');
    const className = `chart-value-label chart-value-label-y ${labelClassName}`;
    const textAnchor = (placement === 'before') ? 'end' : 'start';
    const style = _.defaults({textAnchor}, labelStyle, YAxisValueLabels.defaultProps.labelStyle);
    const labels = this.props.labels || YAxisValueLabels.getLabels(this.props);
    const transform = (position === 'left') ?
      `translate(${-spacingLeft}, 0)` : `translate(${width + spacingRight}, 0)`;

    return <g className="chart-value-labels-y" transform={transform}>
      {labels.map((label, i) => {
        const y = yScale(label.value);
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
