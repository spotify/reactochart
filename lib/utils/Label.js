'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.makeLabelFormatters = makeLabelFormatters;
exports.checkLabelsDistinct = checkLabelsDistinct;
exports.checkRangesOverlap = checkRangesOverlap;
exports.countRangeOverlaps = countRangeOverlaps;
exports.getLabelXRange = getLabelXRange;
exports.getLabelYRange = getLabelYRange;
exports.getLabelXOverhang = getLabelXOverhang;
exports.getLabelsXOverhang = getLabelsXOverhang;
exports.getLabelsYOverhang = getLabelsYOverhang;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _numeral = require('numeral');

var _numeral2 = _interopRequireDefault(_numeral);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeLabelFormatters(formatStrs, scaleType) {
  return formatStrs.map(function (formatStr) {
    if (!_lodash2.default.isString(formatStr)) return formatStr;
    return scaleType === 'time' ? function (v) {
      return (0, _moment2.default)(v).format(formatStr);
    } : function (v) {
      return (0, _numeral2.default)(v).format(formatStr);
    };
  });
}

function checkLabelsDistinct(labels) {
  // given a set of label objects with text properties,
  // return true iff each label has distinct text (ie. no duplicate label texts)
  var labelStrs = _lodash2.default.map(labels, 'text');
  return _lodash2.default.uniq(labelStrs).length === labelStrs.length;
}

function checkRangesOverlap(a, b) {
  // given two number or date ranges of the form [start, end],
  // returns true if the ranges overlap
  if (!_lodash2.default.every([a, b], function (r) {
    return _lodash2.default.isArray(r) && r.length === 2 && _lodash2.default.every(r, _lodash2.default.isFinite) && r[0] <= r[1];
  })) throw new Error('checkRangesOverlap expects 2 range arrays with 2 numbers each, first <= second');

  return a[0] <= b[1] && b[0] <= a[1];
}

function countRangeOverlaps(ranges) {
  // given a list of ranges of the form [[start, end], ...]
  // counts the number of adjacent ranges which touch or overlap each other
  // todo: instead of counting overlaps, sum the amount by which they overlap & choose least overlap

  return _lodash2.default.tail(ranges).reduce(function (sum, range, i) {
    var prevRange = ranges[i]; // (not [i-1], _.tail skips first range)
    return checkRangesOverlap(prevRange, range) ? sum + 1 : sum;
  }, 0);
}

function getLabelXRange(scale, label) {
  var anchor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'middle';

  var anchorOffsets = { start: 0, middle: -0.5, end: -1 };
  var x1 = scale(label.value) + (anchorOffsets[anchor] || 0) * label.width;
  return [x1, x1 + label.width];
}

function getLabelYRange(scale, label) {
  var anchor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'middle';

  var anchorOffsets = { top: 0, middle: -0.5, bottom: -1 };
  var y1 = scale(label.value) + (anchorOffsets[anchor] || 0) * label.height;
  return [y1, y1 + label.height];
}

function getLabelXOverhang(scale, label) {
  var anchor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'middle';

  var _getLabelXRange = getLabelXRange(scale, label, anchor),
      _getLabelXRange2 = _slicedToArray(_getLabelXRange, 2),
      labelLeft = _getLabelXRange2[0],
      labelRight = _getLabelXRange2[1];

  var overhangLeft = Math.ceil(Math.max(_lodash2.default.min(scale.range()) - labelLeft, 0));
  var overhangRight = Math.ceil(Math.max(labelRight - _lodash2.default.max(scale.range()), 0));
  return [overhangLeft, overhangRight];
}

function getLabelYOverhang(scale, label) {
  var anchor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'middle';

  var _getLabelYRange = getLabelYRange(scale, label, anchor),
      _getLabelYRange2 = _slicedToArray(_getLabelYRange, 2),
      labelTop = _getLabelYRange2[0],
      labelBottom = _getLabelYRange2[1];

  var overhangTop = Math.ceil(Math.max(_lodash2.default.min(scale.range()) - labelTop, 0));
  var overhangBottom = Math.ceil(Math.max(labelBottom - _lodash2.default.max(scale.range()), 0));
  return [overhangTop, overhangBottom];
}

function getLabelsXOverhang(scale, labels) {
  var anchor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'middle';

  return _lodash2.default.reduce(labels, function (_ref, label) {
    var _ref2 = _slicedToArray(_ref, 2),
        left = _ref2[0],
        right = _ref2[1];

    var _getLabelXOverhang = getLabelXOverhang(scale, label, anchor),
        _getLabelXOverhang2 = _slicedToArray(_getLabelXOverhang, 2),
        thisLeft = _getLabelXOverhang2[0],
        thisRight = _getLabelXOverhang2[1];

    return [Math.max(left, thisLeft), Math.max(right, thisRight)];
  }, [0, 0]);
}

function getLabelsYOverhang(scale, labels) {
  var anchor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'middle';

  return _lodash2.default.reduce(labels, function (_ref3, label) {
    var _ref4 = _slicedToArray(_ref3, 2),
        top = _ref4[0],
        bottom = _ref4[1];

    var _getLabelYOverhang = getLabelYOverhang(scale, label, anchor),
        _getLabelYOverhang2 = _slicedToArray(_getLabelYOverhang, 2),
        thisTop = _getLabelYOverhang2[0],
        thisBottom = _getLabelYOverhang2[1];

    return [Math.max(top, thisTop), Math.max(bottom, thisBottom)];
  }, [0, 0]);
}