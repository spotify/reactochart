import React from 'react';
import _ from 'lodash';

import MeasuredValueLabel from './MeasuredValueLabel';
import {getScaleTicks, inferScaleType, getTickDomain} from './utils/Scale';
import {checkLabelsDistinct, countRangeOverlaps, makeLabelFormatters, getLabelXRange, getLabelsXOverhang}
  from './utils/Label';
import xyPropsEqual from './utils/xyPropsEqual';


function resolveXLabelsForValues(scale, values, formats, style, force = true) {
  // given a set of values to label, and a list of formatters to try,
  // find the first formatter that produces a set of labels
  // which are A) distinct and B) fit on the axis without colliding with each other
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

    const labelXRanges = testLabels.map(label => getLabelXRange(scale, label, (style.textAnchor || 'middle')));
    const collisionCount = countRangeOverlaps(labelXRanges);
    if(collisionCount) {
      // console.log(`labels do not fit on X axis, ${collisionCount} collisions`, _.map(testLabels, 'text'));
      attempts.push({labels: testLabels, format, areLabelsDistinct, collisionCount});
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
    if(!force) // if we're not forced to decide, return all the labels we tried (let someone else decide)
      return {attempts};

    // forced to decide, choose the least bad option
    // todo warn that we couldn't find good labels
    const distinctAttempts = attempts.filter(attempt => attempt.areLabelsDistinct);
    return distinctAttempts.length === 0 ?
      // super bad, we don't have any label sets with distinct labels. return the last attempt.
      _.last(attempts) :
      // return the attempt with the fewest collisions between distinct labels
      _.minBy(distinctAttempts, 'collisionCount');
  }
}

class XAxisValueLabels extends React.Component {
  static propTypes = {
    scale: React.PropTypes.object,
    // Label Handling
    onMouseEnterLabel: React.PropTypes.func,
    onMouseMoveLabel: React.PropTypes.func,
    onMouseLeaveLabel: React.PropTypes.func
  };
  static defaultProps = {
    height: 250,
    position: 'bottom',
    placement: undefined,
    distance: 4,
    nice: true,
    tickCount: 10,
    ticks: null,
    labelClassName: '',
    labelStyle: {
      fontFamily: "Helvetica, sans-serif",
      fontSize: '14px',
      lineHeight: 1,
      textAnchor: 'middle'
    },
    format: undefined,
    formats: undefined,
    labels: undefined,
    spacing: {top: 0, bottom: 0, left: 0, right: 0}
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !xyPropsEqual(this.props, nextProps);
  }

  static getTickDomain(props) {
    if(!_.get(props, 'scale.x')) return;
    props = _.defaults({}, props, XAxisValueLabels.defaultProps);
    return {x: getTickDomain(props.scale.x, props)};
  }

  static getMargin(props) {
    props = _.defaults({}, props, XAxisValueLabels.defaultProps);
    const {position, placement, distance, tickCount, labelStyle} = props;
    const scale = props.scale.x;
    const labels = props.labels || XAxisValueLabels.getLabels(props);
    const zeroMargin = {top: 0, bottom: 0, left: 0, right: 0};

    if((position === 'bottom' && placement === 'above') || (position == 'top' && placement === 'below'))
      return zeroMargin;

    const marginY = _.max(labels.map(label => Math.ceil(distance + label.height)));
    const [left, right] = getLabelsXOverhang(scale, labels, labelStyle.textAnchor || 'middle');

    return _.defaults({[position] : marginY, left, right}, zeroMargin);
  }

  static getDefaultFormats(scaleType) {
    const timeFormatStrs = ['YYYY', "'YY", 'MMM YYYY', 'M/YY'];
    const numberFormatStrs = ["0.[00]a", "0,0", "0.[0]", "0.[00]", "0.[0000]", "0.[000000]"];

    return (scaleType === 'ordinal') ? [_.identity] :
      (scaleType === 'time') ? timeFormatStrs :
      numberFormatStrs;
  }

  static getLabels(props) {
    const {tickCount, labelStyle} = _.defaults(props, {}, XAxisValueLabels.defaultProps);
    const scale = props.scale.x;
    const ticks = props.ticks || getScaleTicks(scale, null, tickCount);
    const style = _.defaults(labelStyle, XAxisValueLabels.defaultProps.labelStyle);

    const scaleType = inferScaleType(scale);
    const propsFormats = props.format ? [props.format] : props.formats;
    const formatStrs = (_.isArray(propsFormats) && propsFormats.length) ?
      propsFormats : XAxisValueLabels.getDefaultFormats(scaleType);
    const formats = makeLabelFormatters(formatStrs, scaleType);

    // todo resolve ticks also
    // if there are so many ticks that no combination of labels can fit on the axis,
    // nudge down the tickCount and try again
    // doing this will require communicating the updated ticks/tickCount back to the parent element...

    const {labels} = resolveXLabelsForValues(scale, ticks, formats, style);
    // console.log('found labels', labels);
    return labels;
  }

  render() {
    const {height, position, distance, labelStyle, labelClassName, onMouseEnterLabel, onMouseMoveLabel, onMouseLeaveLabel, spacing} = this.props;
    const scale = this.props.scale.x;
    const labels = this.props.labels || XAxisValueLabels.getLabels(this.props);
    const placement = this.props.placement || ((position === 'top') ? 'above' : 'below');
    const style = _.defaults(labelStyle, XAxisValueLabels.defaultProps.labelStyle);
    const className = `chart-value-label chart-value-label-x ${labelClassName}`;
    const transform = (position === 'bottom') ?
      `translate(0, ${height + spacing.bottom})` : `translate(0, ${-spacing.top})`;
    // todo: position: 'zero' to position along the zero line

    return <g className="chart-value-labels-x" transform={transform}>
      {labels.map((label, i) => {
        const x = scale(label.value);
        const y = (placement === 'above') ?
          -label.height - distance :
          distance;
        const [onMouseEnter, onMouseMove, onMouseLeave] =
          ['onMouseEnterLabel', 'onMouseMoveLabel', 'onMouseLeaveLabel'].map(eventName => {
            // partially apply this bar's data point as 2nd callback argument
            const callback = _.get(this.props, eventName);
            return _.isFunction(callback) ? _.partial(callback, _, label.value) : null;
        });

        return <g key={`x-axis-label-${i}`} {...{onMouseEnter, onMouseMove, onMouseLeave}}>
          {/* <XAxisLabelDebugRect {...{x, y, label}}/> */}
          <MeasuredValueLabel value={label.value} {...{x, y, className, dy:"0.8em", style}}>
            {label.text}
          </MeasuredValueLabel>
        </g>;
      })}
    </g>;
  }
}

class XAxisLabelDebugRect extends React.Component {
  render() {
    const {x, y, label} = this.props;
    return <rect {...{
      x: x - (label.width / 2),
      y: y,
      width: label.width,
      height: label.height,
      fill: 'orange'
    }} />;
  }
}

export default XAxisValueLabels;
