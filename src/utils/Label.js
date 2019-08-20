import isString from "lodash/isString";
import map from "lodash/map";
import uniq from "lodash/uniq";
import tail from "lodash/tail";
import min from "lodash/min";
import max from "lodash/max";
import reduce from "lodash/reduce";
import identity from "lodash/identity";
import { timeFormat } from "d3";
import { format as numberFormat } from "d3-format";

export function getDefaultFormats(scaleType) {
  const defaultTimeFormats = ["%Y", "'%y", "%b %Y", "%m/%Y"];
  // Number format examples for a value of 1234.55555
  // https://github.com/d3/d3-format
  const defaultNumberFormats = [
    "~s", // 1.23456k
    ",d", // 1,235
    ".1~f", // 1234.6
    ".2~f", // 1234.56
    ".4~f", // 1234.5556
    ".6~f" // 1234.555555
  ];

  return scaleType === "ordinal"
    ? [identity]
    : scaleType === "time"
      ? defaultTimeFormats
      : defaultNumberFormats;
}

export function makeLabelFormatters(formats, scaleType) {
  return formats.map(format => {
    if (!isString(format)) return format;
    return scaleType === "time"
      ? value => timeFormat(format)(value)
      : value => numberFormat(format)(value);
  });
}

export function checkLabelsDistinct(labels) {
  // given a set of label objects with text properties,
  // return true iff each label has distinct text (ie. no duplicate label texts)
  const labelStrs = map(labels, "text");
  return uniq(labelStrs).length === labelStrs.length;
}

export function checkRangesOverlap(a, b) {
  // given two number or date ranges of the form [start, end],
  // returns true if the ranges overlap
  if (
    ![a, b].every(
      range =>
        Array.isArray(range) &&
        range.length === 2 &&
        range.every(rangeVal => rangeVal !== null && isFinite(rangeVal)) &&
        range[0] <= range[1]
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

  return tail(ranges).reduce((sum, range, i) => {
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
  const overhangLeft = Math.ceil(Math.max(min(scale.range()) - labelLeft, 0));
  const overhangRight = Math.ceil(Math.max(labelRight - max(scale.range()), 0));
  return [overhangLeft, overhangRight];
}

export function getLabelYOverhang(scale, label, anchor = "middle") {
  const [labelTop, labelBottom] = getLabelYRange(scale, label, anchor);
  const overhangTop = Math.ceil(Math.max(min(scale.range()) - labelTop, 0));
  const overhangBottom = Math.ceil(
    Math.max(labelBottom - max(scale.range()), 0)
  );
  return [overhangTop, overhangBottom];
}

export function getLabelsXOverhang(scale, labels, anchor = "middle") {
  return reduce(
    labels,
    ([left, right], label) => {
      const [thisLeft, thisRight] = getLabelXOverhang(scale, label, anchor);
      return [Math.max(left, thisLeft), Math.max(right, thisRight)];
    },
    [0, 0]
  );
}

export function getLabelsYOverhang(scale, labels, anchor = "middle") {
  return reduce(
    labels,
    ([top, bottom], label) => {
      const [thisTop, thisBottom] = getLabelYOverhang(scale, label, anchor);
      return [Math.max(top, thisTop), Math.max(bottom, thisBottom)];
    },
    [0, 0]
  );
}
