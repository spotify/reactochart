import React from 'react';
import _ from 'lodash';
import measureText from 'measure-text';
import moment from 'moment';
import numeral from 'numeral';

import {getScaleTicks, inferScaleType, getTickDomain} from 'utils/Scale';
import resolveObjectProps from 'utils/resolveObjectProps';

function checkRangesOverlap(a, b) {
  // given two number or date ranges of the form [start, end],
  // returns true if the ranges overlap

  if(!_.every([a, b], r => _.isArray(r) && r.length === 2 && _.every(r, _.isFinite) && r[0] <= r[1]))
    throw new Error('checkRangesOverlap expects 2 range arrays with 2 numbers each, first <= second');

  return a[0] <= b[1] && b[0] <= a[1];
}

function countRangeOverlaps(ranges) {
  // given a list of ranges of the form [[start, end], ...]
  // counts the number of adjacent ranges which touch or overlap each other
  // todo: instead of counting overlaps, sum the amount by which they overlap & choose least overlap

  return _.tail(ranges).reduce((sum, range, i) => {
    const prevRange = ranges[i]; // (not [i-1], _.tail skips first range)
    return checkRangesOverlap(prevRange, range) ? sum + 1 : sum;
  }, 0)
}

function getLabelXOverhang(scale, label, anchor = 'middle') {
  const [labelLeft, labelRight] = getLabelXRange(scale, label, anchor);
  const overhangLeft = Math.ceil(Math.max(_.min(scale.range()) - labelLeft, 0));
  const overhangRight = Math.ceil(Math.max(labelRight - _.max(scale.range()), 0));
  return [overhangLeft, overhangRight];
}

function getLabelsXOverhang(scale, labels, anchor = 'middle') {
  return _.reduce(labels, ([left, right], label) => {
    const [thisLeft, thisRight] = getLabelXOverhang(scale, label, anchor);
    return [Math.max(left, thisLeft), Math.max(right, thisRight)];
  }, [0, 0]);
}

function getLabelXRange(scale, label, anchor = 'middle') {
  const anchorOffsets = {start: 0, middle: -0.5, end: -1};
  const x1 = scale(label.value) + ((anchorOffsets[anchor] || 0) * label.width);
  return [x1, x1 + label.width];
}

function checkLabelsDistinct(labels) {
  // given a set of label objects with text properties,
  // return true iff each label has distinct text (ie. no duplicate label texts)
  const labelStrs = _.map(labels, 'text');
  return (_.uniq(labelStrs).length === labelStrs.length);
}

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
      console.log('labels are not distinct', _.map(testLabels, 'text'));
      attempts.push({labels: testLabels, format, areLabelsDistinct});
      return false;
    }

    const labelXRanges = testLabels.map(label => getLabelXRange(scale, label, (style.textAnchor || 'middle')));
    const collisionCount = countRangeOverlaps(labelXRanges);
    if(collisionCount) {
      console.log(`labels do not fit on X axis, ${collisionCount} collisions`, _.map(testLabels, 'text'));
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

function makeFormatters(formatStrs, scaleType) {
  return formatStrs.map(formatStr => {
    if(!_.isString(formatStr)) return formatStr;
    return (scaleType === 'time') ?
      (v) => moment(v).format(formatStr) :
      (v) => numeral(v).format(formatStr);
  })
}

class XAxisValueLabels extends React.Component {
  static propTypes = {
    scale: React.PropTypes.object
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
    labels: undefined
  };

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
    const [marginLeft, marginRight] = getLabelsXOverhang(scale, labels, labelStyle.textAnchor || 'middle');

    return _.defaults({
      [position] : marginY,
      left: marginLeft,
      right: marginRight
    }, zeroMargin);
  }

  static getDefaultFormats(scaleType) {
    const timeFormatStrs = ['YYYY', 'YY', 'MMM YYYY', 'M/YY'];
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
    const formats = makeFormatters(formatStrs, scaleType);

    // todo resolve ticks also
    // if there are so many ticks that no combination of labels can fit on the axis,
    // nudge down the tickCount and try again
    // doing this will require communicating the updated ticks/tickCount back to the parent element...

    const {labels} = resolveXLabelsForValues(scale, ticks, formats, style);
    console.log('found labels', labels);
    return labels;
  }

  render() {
    const {height, tickCount, position, distance, labelStyle, labelClassName} = this.props;
    const scale = this.props.scale.x;
    const ticks = this.props.ticks || getScaleTicks(scale, null, tickCount);
    const placement = this.props.placement || ((position === 'top') ? 'above' : 'below');
    const className = `chart-value-label chart-value-label-x ${labelClassName}`;


    // todo: position: 'zero' to position along the zero line
    const transform = (position === 'bottom') ? `translate(0,${height})` : '';

    const style = _.defaults(labelStyle, XAxisValueLabels.defaultProps.labelStyle);

    const labels = this.props.labels || XAxisValueLabels.getLabels(this.props);

    //console.log('found labels', labels);

    return <g className="chart-value-labels-x" transform={transform}>
      {labels.map((label) => {
        const x = scale(label.value);
        const y = (placement === 'above') ?
          -label.height - distance :
          distance;

        return <g>
          {/*
          <rect {...{
            x: x - (label.width / 2),
            y: y,
            width: label.width,
            height: label.height,
            fill: 'thistle'
          }} />
           */}

          <MeasuredValueLabel {...{x, y, className, dy:"0.8em", style}}>
            {label.text}
          </MeasuredValueLabel>
        </g>;
      })}
    </g>;
  }
}

class MeasuredValueLabel extends React.Component {
  static propTypes = {
    value: React.PropTypes.any.isRequired
  };
  static defaultProps = {
    format: _.identity,
    style: {
      fontFamily: "Helvetica, sans-serif",
      fontSize: '20px',
      lineHeight: 1,
      textAnchor: 'middle'
    }
  };
  static getLabel(props) {
    const {value, format} = props;
    const style = _.defaults(props.style, MeasuredValueLabel.defaultProps.style);
    const labelStr = format(value);
    const measured = measureText(_.assign({text: labelStr}, style));

    return {
      value: props.value,
      text: measured.text,
      height: measured.height.value,
      width: measured.width.value
    };
  }

  render() {
    const {value, format} = this.props;
    const passedProps = _.omit(this.props, ['value', 'format']);

    return <text {...passedProps}>
      {React.Children.count(this.props.children) ?
        this.props.children : format(value)
      }
    </text>;
  }
}

export default XAxisValueLabels;
