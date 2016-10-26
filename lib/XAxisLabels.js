'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _MeasuredValueLabel = require('./MeasuredValueLabel');

var _MeasuredValueLabel2 = _interopRequireDefault(_MeasuredValueLabel);

var _Scale = require('./utils/Scale');

var _Label = require('./utils/Label');

var _xyPropsEqual = require('./utils/xyPropsEqual');

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function resolveXLabelsForValues(scale, values, formats, style) {
  var force = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

  // given a set of values to label, and a list of formatters to try,
  // find the first formatter that produces a set of labels
  // which are A) distinct and B) fit on the axis without colliding with each other
  // returns the formatter and the generated labels

  var labels = void 0;
  var attempts = [];
  var goodFormat = _lodash2.default.find(formats, function (format) {
    var testLabels = values.map(function (value) {
      return _MeasuredValueLabel2.default.getLabel({ value: value, format: format, style: style });
    });

    var areLabelsDistinct = (0, _Label.checkLabelsDistinct)(testLabels);
    if (!areLabelsDistinct) {
      // console.log('labels are not distinct', _.map(testLabels, 'text'));
      attempts.push({ labels: testLabels, format: format, areLabelsDistinct: areLabelsDistinct });
      return false;
    }

    var labelXRanges = testLabels.map(function (label) {
      return (0, _Label.getLabelXRange)(scale, label, style.textAnchor || 'middle');
    });
    var collisionCount = (0, _Label.countRangeOverlaps)(labelXRanges);
    if (collisionCount) {
      // console.log(`labels do not fit on X axis, ${collisionCount} collisions`, _.map(testLabels, 'text'));
      attempts.push({ labels: testLabels, format: format, areLabelsDistinct: areLabelsDistinct, collisionCount: collisionCount });
      return false;
    }

    labels = testLabels;
    return true;
  });

  if (!_lodash2.default.isUndefined(goodFormat)) {
    // found labels which work, return them
    return { labels: labels, format: goodFormat, areLabelsDistinct: true, collisionCount: 0 };
  } else {
    // none of the sets of labels are good
    if (!force) // if we're not forced to decide, return all the labels we tried (let someone else decide)
      return { attempts: attempts };

    // forced to decide, choose the least bad option
    // todo warn that we couldn't find good labels
    var distinctAttempts = attempts.filter(function (attempt) {
      return attempt.areLabelsDistinct;
    });
    return distinctAttempts.length === 0 ?
    // super bad, we don't have any label sets with distinct labels. return the last attempt.
    _lodash2.default.last(attempts) :
    // return the attempt with the fewest collisions between distinct labels
    _lodash2.default.minBy(distinctAttempts, 'collisionCount');
  }
}

var XAxisValueLabels = function (_React$Component) {
  _inherits(XAxisValueLabels, _React$Component);

  function XAxisValueLabels() {
    _classCallCheck(this, XAxisValueLabels);

    return _possibleConstructorReturn(this, (XAxisValueLabels.__proto__ || Object.getPrototypeOf(XAxisValueLabels)).apply(this, arguments));
  }

  _createClass(XAxisValueLabels, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _xyPropsEqual2.default)(this.props, nextProps);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          height = _props.height,
          position = _props.position,
          distance = _props.distance,
          labelStyle = _props.labelStyle,
          labelClassName = _props.labelClassName;

      var scale = this.props.scale.x;
      var labels = this.props.labels || XAxisValueLabels.getLabels(this.props);
      var placement = this.props.placement || (position === 'top' ? 'above' : 'below');
      var style = _lodash2.default.defaults(labelStyle, XAxisValueLabels.defaultProps.labelStyle);
      var className = 'chart-value-label chart-value-label-x ' + labelClassName;
      var transform = position === 'bottom' ? 'translate(0,' + height + ')' : '';
      // todo: position: 'zero' to position along the zero line

      return _react2.default.createElement(
        'g',
        { className: 'chart-value-labels-x', transform: transform },
        labels.map(function (label, i) {
          var x = scale(label.value);
          var y = placement === 'above' ? -label.height - distance : distance;

          return _react2.default.createElement(
            'g',
            { key: 'x-axis-label-' + i },
            _react2.default.createElement(
              _MeasuredValueLabel2.default,
              _extends({ value: label.value }, { x: x, y: y, className: className, dy: "0.8em", style: style }),
              label.text
            )
          );
        })
      );
    }
  }], [{
    key: 'getTickDomain',
    value: function getTickDomain(props) {
      if (!_lodash2.default.get(props, 'scale.x')) return;
      props = _lodash2.default.defaults({}, props, XAxisValueLabels.defaultProps);
      return { x: (0, _Scale.getTickDomain)(props.scale.x, props) };
    }
  }, {
    key: 'getMargin',
    value: function getMargin(props) {
      var _$defaults;

      props = _lodash2.default.defaults({}, props, XAxisValueLabels.defaultProps);
      var _props2 = props,
          position = _props2.position,
          placement = _props2.placement,
          distance = _props2.distance,
          tickCount = _props2.tickCount,
          labelStyle = _props2.labelStyle;

      var scale = props.scale.x;
      var labels = props.labels || XAxisValueLabels.getLabels(props);
      var zeroMargin = { top: 0, bottom: 0, left: 0, right: 0 };

      if (position === 'bottom' && placement === 'above' || position == 'top' && placement === 'below') return zeroMargin;

      var marginY = _lodash2.default.max(labels.map(function (label) {
        return Math.ceil(distance + label.height);
      }));

      var _getLabelsXOverhang = (0, _Label.getLabelsXOverhang)(scale, labels, labelStyle.textAnchor || 'middle'),
          _getLabelsXOverhang2 = _slicedToArray(_getLabelsXOverhang, 2),
          left = _getLabelsXOverhang2[0],
          right = _getLabelsXOverhang2[1];

      return _lodash2.default.defaults((_$defaults = {}, _defineProperty(_$defaults, position, marginY), _defineProperty(_$defaults, 'left', left), _defineProperty(_$defaults, 'right', right), _$defaults), zeroMargin);
    }
  }, {
    key: 'getDefaultFormats',
    value: function getDefaultFormats(scaleType) {
      var timeFormatStrs = ['YYYY', "'YY", 'MMM YYYY', 'M/YY'];
      var numberFormatStrs = ["0.[00]a", "0,0", "0.[0]", "0.[00]", "0.[0000]", "0.[000000]"];

      return scaleType === 'ordinal' ? [_lodash2.default.identity] : scaleType === 'time' ? timeFormatStrs : numberFormatStrs;
    }
  }, {
    key: 'getLabels',
    value: function getLabels(props) {
      var _$defaults2 = _lodash2.default.defaults(props, {}, XAxisValueLabels.defaultProps),
          tickCount = _$defaults2.tickCount,
          labelStyle = _$defaults2.labelStyle;

      var scale = props.scale.x;
      var ticks = props.ticks || (0, _Scale.getScaleTicks)(scale, null, tickCount);
      var style = _lodash2.default.defaults(labelStyle, XAxisValueLabels.defaultProps.labelStyle);

      var scaleType = (0, _Scale.inferScaleType)(scale);
      var propsFormats = props.format ? [props.format] : props.formats;
      var formatStrs = _lodash2.default.isArray(propsFormats) && propsFormats.length ? propsFormats : XAxisValueLabels.getDefaultFormats(scaleType);
      var formats = (0, _Label.makeLabelFormatters)(formatStrs, scaleType);

      // todo resolve ticks also
      // if there are so many ticks that no combination of labels can fit on the axis,
      // nudge down the tickCount and try again
      // doing this will require communicating the updated ticks/tickCount back to the parent element...

      var _resolveXLabelsForVal = resolveXLabelsForValues(scale, ticks, formats, style),
          labels = _resolveXLabelsForVal.labels;
      // console.log('found labels', labels);


      return labels;
    }
  }]);

  return XAxisValueLabels;
}(_react2.default.Component);

XAxisValueLabels.propTypes = {
  scale: _react2.default.PropTypes.object
};
XAxisValueLabels.defaultProps = {
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

var XAxisLabelDebugRect = function (_React$Component2) {
  _inherits(XAxisLabelDebugRect, _React$Component2);

  function XAxisLabelDebugRect() {
    _classCallCheck(this, XAxisLabelDebugRect);

    return _possibleConstructorReturn(this, (XAxisLabelDebugRect.__proto__ || Object.getPrototypeOf(XAxisLabelDebugRect)).apply(this, arguments));
  }

  _createClass(XAxisLabelDebugRect, [{
    key: 'render',
    value: function render() {
      var _props3 = this.props,
          x = _props3.x,
          y = _props3.y,
          label = _props3.label;

      return _react2.default.createElement('rect', {
        x: x - label.width / 2,
        y: y,
        width: label.width,
        height: label.height,
        fill: 'orange'
      });
    }
  }]);

  return XAxisLabelDebugRect;
}(_react2.default.Component);

exports.default = XAxisValueLabels;