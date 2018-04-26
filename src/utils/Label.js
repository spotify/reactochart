import _ from "lodash";
import moment from "moment";
import numeral from "numeral";

export function makeLabelFormatters(formatStrs, scaleType) {
  return formatStrs.map(formatStr => {
    if (!_.isString(formatStr)) return formatStr;
    return scaleType === "time"
      ? v => moment(v).format(formatStr)
      : v => numeral(v).format(formatStr);
  });
}

export function checkLabelsDistinct(labels) {
  // given a set of label objects with text properties,
  // return true iff each label has distinct text (ie. no duplicate label texts)
  const labelStrs = _.map(labels, "text");
  return _.uniq(labelStrs).length === labelStrs.length;
}

export function checkRangesOverlap(a, b) {
  // given two number or date ranges of the form [start, end],
  // returns true if the ranges overlap
  if (
    !_.every(
      [a, b],
      r =>
        _.isArray(r) && r.length === 2 && _.every(r, _.isFinite) && r[0] <= r[1]
    )
  )
    throw new Error(
      "checkRangesOverlap expects 2 range arrays with 2 numbers each, first <= second"
    );

  return a[0] <= b[1] && b[0] <= a[1];
}

export function countRangeOverlaps(ranges) {
  // given a list of ranges of the form [[start, end], ...]
  // counts the number of adjacent ranges which touch or overlap each other
  // todo: instead of counting overlaps, sum the amount by which they overlap & choose least overlap

  return _.tail(ranges).reduce((sum, range, i) => {
    const prevRange = ranges[i]; // (not [i-1], _.tail skips first range)
    return checkRangesOverlap(prevRange, range) ? sum + 1 : sum;
  }, 0);
}

export function getLabelXRange(scale, label, anchor = "middle") {
  const anchorOffsets = { start: 0, middle: -0.5, end: -1 };
  const x1 = scale(label.value) + (anchorOffsets[anchor] || 0) * label.width;
  return [x1, x1 + label.width];
}

export function getLabelYRange(scale, label, anchor = "middle") {
  const anchorOffsets = { top: 0, middle: -0.5, bottom: -1 };
  const y1 = scale(label.value) + (anchorOffsets[anchor] || 0) * label.height;
  return [y1, y1 + label.height];
}

export function getLabelXOverhang(scale, label, anchor = "middle") {
  const [labelLeft, labelRight] = getLabelXRange(scale, label, anchor);
  const overhangLeft = Math.ceil(Math.max(_.min(scale.range()) - labelLeft, 0));
  const overhangRight = Math.ceil(
    Math.max(labelRight - _.max(scale.range()), 0)
  );
  return [overhangLeft, overhangRight];
}

function getLabelYOverhang(scale, label, anchor = "middle") {
  const [labelTop, labelBottom] = getLabelYRange(scale, label, anchor);
  const overhangTop = Math.ceil(Math.max(_.min(scale.range()) - labelTop, 0));
  const overhangBottom = Math.ceil(
    Math.max(labelBottom - _.max(scale.range()), 0)
  );
  return [overhangTop, overhangBottom];
}

export function getLabelsXOverhang(scale, labels, anchor = "middle") {
  return _.reduce(
    labels,
    ([left, right], label) => {
      const [thisLeft, thisRight] = getLabelXOverhang(scale, label, anchor);
      return [Math.max(left, thisLeft), Math.max(right, thisRight)];
    },
    [0, 0]
  );
}

export function getLabelsYOverhang(scale, labels, anchor = "middle") {
  return _.reduce(
    labels,
    ([top, bottom], label) => {
      const [thisTop, thisBottom] = getLabelYOverhang(scale, label, anchor);
      return [Math.max(top, thisTop), Math.max(bottom, thisBottom)];
    },
    [0, 0]
  );
}
