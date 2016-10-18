'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

function resolveYLabelsForValues(scale, values, formats, style) {
  var force = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];

  // given a set of Y-values to label, and a list of formatters to try,
  // find the first formatter that produces a set of labels which are distinct
  // since we currently do not support rotated axis value labels,
  // we do not check if they fit on the axis (unlike X labels), since all Y labels will have the same height
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

    labels = testLabels;
    return true;
  });

  if (!_lodash2.default.isUndefined(goodFormat)) {
    // found labels which work, return them
    return { labels: labels, format: goodFormat, areLabelsDistinct: true, collisionCount: 0 };
  } else {
    // none of the sets of labels are good
    // if we're not forced to decide, return all the labels we tried (let someone else decide)
    if (!force) return { attempts: attempts };

    // forced to decide, choose the least bad option
    // super bad, we don't have any label sets with distinct labels. return the last attempt.
    return _lodash2.default.last(attempts);
  }
}

var YAxisValueLabels = function (_React$Component) {
  _inherits(YAxisValueLabels, _React$Component);

  function YAxisValueLabels() {
    _classCallCheck(this, YAxisValueLabels);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(YAxisValueLabels).apply(this, arguments));
  }

  _createClass(YAxisValueLabels, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _xyPropsEqual2.default)(this.props, nextProps);
    }
    // placement: undefined,
    // format: undefined,
    // formats: undefined,
    // labels: undefined

  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      // todo: position: 'zero' prop to position along the zero line
      var _props = this.props;
      var width = _props.width;
      var position = _props.position;
      var distance = _props.distance;
      var labelStyle = _props.labelStyle;
      var labelClassName = _props.labelClassName;
      var onMouseEnterLabel = _props.onMouseEnterLabel;
      var onMouseMoveLabel = _props.onMouseMoveLabel;
      var onMouseLeaveLabel = _props.onMouseLeaveLabel;

      var scale = this.props.scale.y;
      var placement = this.props.placement || (position === 'left' ? 'before' : 'after');
      var className = 'chart-value-label chart-value-label-y ' + labelClassName;
      var textAnchor = placement === 'before' ? 'end' : 'start';
      var style = _lodash2.default.defaults({ textAnchor: textAnchor }, labelStyle, YAxisValueLabels.defaultProps.labelStyle);

      var labels = this.props.labels || YAxisValueLabels.getLabels(this.props);

      var transform = position === 'left' ? '' : 'translate(' + width + ',0)';
      return _react2.default.createElement(
        'g',
        { className: 'chart-value-labels-y', transform: transform },
        labels.map(function (label, i) {
          var y = scale(label.value);
          var x = placement === 'before' ? -distance : distance;

          var _map = ['onMouseEnterLabel', 'onMouseMoveLabel', 'onMouseLeaveLabel'].map(function (eventName) {
            // partially apply this bar's data point as 2nd callback argument
            var callback = _lodash2.default.get(_this2.props, eventName);
            return _lodash2.default.isFunction(callback) ? _lodash2.default.partial(callback, _lodash2.default, label.value) : null;
          });

          var _map2 = _slicedToArray(_map, 3);

          var onMouseEnter = _map2[0];
          var onMouseMove = _map2[1];
          var onMouseLeave = _map2[2];


          return _react2.default.createElement(
            'g',
            _extends({ key: 'x-axis-label-' + i }, { onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave }),
            _react2.default.createElement(
              _MeasuredValueLabel2.default,
              { x: x, y: y, className: className, dy: "0.35em", style: style },
              label.text
            )
          );
        })
      );
    }
  }], [{
    key: 'getTickDomain',
    value: function getTickDomain(props) {
      if (!_lodash2.default.get(props, 'scale.y')) return;
      props = _lodash2.default.defaults({}, props, YAxisValueLabels.defaultProps);
      return { y: (0, _Scale.getTickDomain)(props.scale.y, props) };
    }
  }, {
    key: 'getMargin',
    value: function getMargin(props) {
      var _$defaults;

      props = _lodash2.default.defaults({}, props, YAxisValueLabels.defaultProps);
      var _props2 = props;
      var position = _props2.position;
      var placement = _props2.placement;
      var distance = _props2.distance;
      var labelStyle = _props2.labelStyle;

      var scale = props.scale.y;
      var labels = props.labels || YAxisValueLabels.getLabels(props);
      var zeroMargin = { top: 0, bottom: 0, left: 0, right: 0 };

      if (position === 'left' && placement === 'after' || position == 'right' && placement === 'before') return zeroMargin;

      var marginX = _lodash2.default.max(labels.map(function (label) {
        return Math.ceil(distance + label.width);
      }));

      var _getLabelsYOverhang = (0, _Label.getLabelsYOverhang)(scale, labels, 'middle');

      var _getLabelsYOverhang2 = _slicedToArray(_getLabelsYOverhang, 2);

      var top = _getLabelsYOverhang2[0];
      var bottom = _getLabelsYOverhang2[1];


      return _lodash2.default.defaults((_$defaults = {}, _defineProperty(_$defaults, position, marginX), _defineProperty(_$defaults, 'top', top), _defineProperty(_$defaults, 'bottom', bottom), _$defaults), zeroMargin);
    }
  }, {
    key: 'getDefaultFormats',
    value: function getDefaultFormats(scaleType) {
      var timeFormatStrs = ['YYYY', 'YY', 'MMM YYYY', 'M/YY'];
      var numberFormatStrs = ["0.[00]a", "0,0", "0.[0]", "0.[00]", "0.[0000]", "0.[000000]"];

      return scaleType === 'ordinal' ? [_lodash2.default.identity] : scaleType === 'time' ? timeFormatStrs : numberFormatStrs;
    }
  }, {
    key: 'getLabels',
    value: function getLabels(props) {
      var _$defaults2 = _lodash2.default.defaults(props, {}, YAxisValueLabels.defaultProps);

      var tickCount = _$defaults2.tickCount;
      var labelStyle = _$defaults2.labelStyle;

      var scale = props.scale.y;
      var ticks = props.ticks || (0, _Scale.getScaleTicks)(scale, null, tickCount);
      var style = _lodash2.default.defaults(labelStyle, YAxisValueLabels.defaultProps.labelStyle);

      var scaleType = (0, _Scale.inferScaleType)(scale);
      var propsFormats = props.format ? [props.format] : props.formats;
      var formatStrs = _lodash2.default.isArray(propsFormats) && propsFormats.length ? propsFormats : YAxisValueLabels.getDefaultFormats(scaleType);
      var formats = (0, _Label.makeLabelFormatters)(formatStrs, scaleType);

      // todo resolve ticks also
      // if there are so many ticks that no combination of labels can fit on the axis,
      // nudge down the tickCount and try again
      // doing this will require communicating the updated ticks/tickCount back to the parent element...

      var start = performance.now();

      var _resolveYLabelsForVal = resolveYLabelsForValues(scale, ticks, formats, style);

      var labels = _resolveYLabelsForVal.labels;
      // console.log('resolveYLabelsForValues took ', performance.now() - start);
      // console.log('found labels', labels);

      return labels;
    }
  }]);

  return YAxisValueLabels;
}(_react2.default.Component);

YAxisValueLabels.propTypes = {
  scale: _react2.default.PropTypes.object,
  // Label Handling
  onMouseEnterLabel: _react2.default.PropTypes.func,
  onMouseMoveLabel: _react2.default.PropTypes.func,
  onMouseLeaveLabel: _react2.default.PropTypes.func };
YAxisValueLabels.defaultProps = {
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
  }
};

var YAxisLabelDebugRect = function (_React$Component2) {
  _inherits(YAxisLabelDebugRect, _React$Component2);

  function YAxisLabelDebugRect() {
    _classCallCheck(this, YAxisLabelDebugRect);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(YAxisLabelDebugRect).apply(this, arguments));
  }

  _createClass(YAxisLabelDebugRect, [{
    key: 'render',
    value: function render() {
      var _props3 = this.props;
      var x = _props3.x;
      var y = _props3.y;
      var label = _props3.label;
      var style = _props3.style;

      var xAdj = style.textAnchor === 'end' ? x - label.width : x;
      return _react2.default.createElement('rect', {
        x: xAdj,
        y: y - label.height / 2,
        width: label.width,
        height: label.height,
        fill: 'orange'
      });
    }
  }]);

  return YAxisLabelDebugRect;
}(_react2.default.Component);

exports.default = YAxisValueLabels;