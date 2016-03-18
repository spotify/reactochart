import React from 'react';
import _ from 'lodash';
import measureText from 'measure-text';
import moment from 'moment';

import {getScaleTicks} from 'utils/Scale';
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

  return _.tail(ranges).reduce((sum, range, i) => {
    const prevRange = ranges[i]; // (not [i-1], _.tail skips first range)
    return checkRangesOverlap(prevRange, range) ? sum + 1 : sum;
  }, 0)
}

function getLabelXOverhang(scale, value, width, anchor = 'middle') {
  const anchorOffsets = {start: 0, middle: -0.5, end: -1};
  //const labelLeft = scale(value) + ((anchorOffsets[anchor] || 0) * width);
  //const labelRight = labelLeft + width;
  const [labelLeft, labelRight] = getLabelXRange(scale, {value, width}, anchor);
  const overhangLeft = Math.ceil(Math.max(_.min(scale.range()) - labelLeft, 0));
  const overhangRight = Math.ceil(Math.max(labelRight - _.max(scale.range()), 0));
  return [overhangLeft, overhangRight];
}

function getLabelXRange(scale, label, anchor = 'middle') {
  const anchorOffsets = {start: 0, middle: -0.5, end: -1};
  const x1 = scale(label.value) + ((anchorOffsets[anchor] || 0) * label.width);
  return [x1, x1 + label.width];
}

function checkLabelsFitX(scale, labels, anchor = 'middle') {
  // returns true if all of the given labels can fit on the given x scale,
  // taking into account the fact that they may overhang either edge of the scale
  // assumes the labels will be distributed uniformly along the axis
  // todo should work with custom ticks which are not uniformly distributed?

  const labelXRanges = labels.map(label => getLabelXRange(scale, label, anchor));
  const collisionCount = countRangeOverlaps(labelXRanges);
  console.log(collisionCount, 'collisions');

  const xOverhangs = labels.map(({value, width}) => getLabelXOverhang(scale, value, width, anchor));
  const labelsWidthInner = _.sum(_.map(labels, 'width')) - _.sum(_.flatten(xOverhangs));
  const scaleWidth = _.max(scale.range()) - _.min(scale.range());
  return (labelsWidthInner < scaleWidth);
}

function checkLabelsDistinct(labels) {
  // given a set of label objects with text properties,
  // return true iff each label has distinct text (ie. no duplicate label texts)

  const labelStrs = _.map(labels, 'text');
  return (_.uniq(labelStrs).length === labelStrs.length);
}

function resolveXLabelsForValues(scale, values, formats, style) {
  // given a set of values to label, and a list of formatters to try,
  // find the first formatter that produces a set of labels
  // which are A) distinct and B) fit on the axis without colliding with each other
  // returns the formatter and the generated labels

  let labels, areLabelsDistinct, doLabelsFitX;
  const goodFormat = _.find(formats, format => {
    areLabelsDistinct = doLabelsFitX = undefined;
    labels = values.map(value => MeasuredValueLabel.getSize({value, format, style}));
    areLabelsDistinct = checkLabelsDistinct(labels);
    if(!areLabelsDistinct) console.log('labels are not distinct', _.map(labels, 'text'));
    if(!areLabelsDistinct) return false;
    doLabelsFitX = checkLabelsFitX(scale, labels, (style.textAnchor || 'middle'));
    if(!doLabelsFitX) console.log('labels do not fit on X axis', _.map(labels, 'text'));
    return areLabelsDistinct && doLabelsFitX;
  });
  const format = _.isUndefined(goodFormat) ? _.last(formats) : goodFormat;
  const areLabelsGood = areLabelsDistinct && doLabelsFitX;
  // todo warn if we couldn't find good labels
  return {labels, format, areLabelsGood, areLabelsDistinct, doLabelsFitX};
}

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
    //const ticks = this.props.ticks || getScaleTicks(scale, null, tickCount);
    const ticks = scale.ticks();
    const className = `chart-value-label chart-value-label-x ${labelClassName}`;
    const transform = top ? '' : `translate(0,${height})`;

    const style = _.defaults(labelStyle, XAxisValueLabels.defaultProps.labelStyle);

    const formatStrs = ['YYYY', 'YY', 'MMM, YYYY', 'MMMYY', 'M/YY'];
    const formats = formatStrs.map(formatStr => (v => moment(v).format(formatStr)));

    // todo resolve ticks also
    // if there are so many ticks that no combination of labels can fit on the axis,
    // nudge down the tickCount and try again
    // doing this will require communicating the updated tickCount back to the parent element...

    const labels = resolveXLabelsForValues(scale, ticks, formats, style);
    console.log('found labels', labels);


    return <g className="chart-value-labels-x" transform={transform}>
      {ticks.map((tick, i) => {
        const x = scale(tick);
        const formatLabel = l => moment(l).format('M/YY');
        const labelStr = formatLabel(tick);

        const size = MeasuredValueLabel.getSize({value: tick, format: formatLabel, style: labelStyle});
        console.log('size', size);
        console.log('overhangX', getLabelXOverhang(scale, tick, size.width, 'middle'));

        //const labelStr = "why";
        const measured = measureText(_.assign({text: labelStr}, XAxisValueLabels.defaultProps.labelStyle));
        //console.log(measured);
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
  static getSize(props) {
    const {value, format} = props;
    const style = _.defaults(props.style, MeasuredValueLabel.defaultProps.style);
    const labelStr = format(value);
    const measured = measureText(_.assign({text: labelStr}, style));
    //console.log('measured', measured);
    return {height: measured.height.value, width: measured.width.value, value: props.value, text: measured.text};
  }
  render() {
    const {value, format} = this.props;

    return <text>{format(value)}</text>;
  }
}

export default XAxisValueLabels;
