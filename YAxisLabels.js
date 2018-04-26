"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _MeasuredValueLabel = require("./MeasuredValueLabel");

var _MeasuredValueLabel2 = _interopRequireDefault(_MeasuredValueLabel);

var _Scale = require("./utils/Scale");

var _Label = require("./utils/Label");

var _xyPropsEqual = require("./utils/xyPropsEqual");

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function resolveYLabelsForValues(scale, values, formats, style) {
  var force = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

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
    return {
      labels: labels,
      format: goodFormat,
      areLabelsDistinct: true,
      collisionCount: 0
    };
  } else {
    // none of the sets of labels are good
    // if we're not forced to decide, return all the labels we tried (let someone else decide)
    if (!force) return { attempts: attempts };

    // forced to decide, choose the least bad option
    // super bad, we don't have any label sets with distinct labels. return the last attempt.
    return _lodash2.default.last(attempts);
  }
}

var YAxisLabels = function (_React$Component) {
  _inherits(YAxisLabels, _React$Component);

  function YAxisLabels() {
    _classCallCheck(this, YAxisLabels);

    return _possibleConstructorReturn(this, (YAxisLabels.__proto__ || Object.getPrototypeOf(YAxisLabels)).apply(this, arguments));
  }

  _createClass(YAxisLabels, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _xyPropsEqual2.default)(this.props, nextProps);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      // todo: position: 'zero' prop to position along the zero line
      var _props = this.props,
          width = _props.width,
          yScale = _props.yScale,
          position = _props.position,
          distance = _props.distance,
          labelStyle = _props.labelStyle,
          labelClassName = _props.labelClassName,
          onMouseEnterLabel = _props.onMouseEnterLabel,
          onMouseMoveLabel = _props.onMouseMoveLabel,
          onMouseLeaveLabel = _props.onMouseLeaveLabel,
          spacingLeft = _props.spacingLeft,
          spacingRight = _props.spacingRight;

      var placement = this.props.placement || (position === "left" ? "before" : "after");
      var className = "chart-value-label chart-value-label-y " + labelClassName;
      var textAnchor = placement === "before" ? "end" : "start";
      var style = _lodash2.default.defaults({ textAnchor: textAnchor }, labelStyle, YAxisLabels.defaultProps.labelStyle);
      var labels = this.props.labels || YAxisLabels.getLabels(this.props);
      var transform = position === "left" ? "translate(" + -spacingLeft + ", 0)" : "translate(" + (width + spacingRight) + ", 0)";

      return _react2.default.createElement(
        "g",
        { className: "chart-value-labels-y", transform: transform },
        labels.map(function (label, i) {
          var y = yScale(label.value);
          var x = placement === "before" ? -distance : distance;

          var _map = ["onMouseEnterLabel", "onMouseMoveLabel", "onMouseLeaveLabel"].map(function (eventName) {
            // partially apply this bar's data point as 2nd callback argument
            var callback = _lodash2.default.get(_this2.props, eventName);
            return _lodash2.default.isFunction(callback) ? _lodash2.default.partial(callback, _lodash2.default, label.value) : null;
          }),
              _map2 = _slicedToArray(_map, 3),
              onMouseEnter = _map2[0],
              onMouseMove = _map2[1],
              onMouseLeave = _map2[2];

          return _react2.default.createElement(
            "g",
            _extends({
              key: "x-axis-label-" + i
            }, { onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave }),
            _react2.default.createElement(
              _MeasuredValueLabel2.default,
              _extends({
                value: label.value
              }, { x: x, y: y, className: className, dy: "0.35em", style: style }),
              label.text
            )
          );
        })
      );
    }
  }], [{
    key: "getTickDomain",
    value: function getTickDomain(props) {
      if (!props.yScale) return;
      props = _lodash2.default.defaults({}, props, YAxisLabels.defaultProps);
      return { yTickDomain: (0, _Scale.getTickDomain)(props.yScale, props) };
    }
  }, {
    key: "getMargin",
    value: function getMargin(props) {
      var _$defaults;

      props = _lodash2.default.defaults({}, props, YAxisLabels.defaultProps);
      var _props2 = props,
          yScale = _props2.yScale,
          position = _props2.position,
          placement = _props2.placement,
          distance = _props2.distance,
          labelStyle = _props2.labelStyle;

      var labels = props.labels || YAxisLabels.getLabels(props);
      var zeroMargin = {
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0
      };

      if (position === "left" && placement === "after" || position === "right" && placement === "before") return zeroMargin;

      var marginX = _lodash2.default.max(labels.map(function (label) {
        return Math.ceil(distance + label.width);
      }));

      var _getLabelsYOverhang = (0, _Label.getLabelsYOverhang)(yScale, labels, "middle"),
          _getLabelsYOverhang2 = _slicedToArray(_getLabelsYOverhang, 2),
          marginTop = _getLabelsYOverhang2[0],
          marginBottom = _getLabelsYOverhang2[1];

      return _lodash2.default.defaults((_$defaults = {}, _defineProperty(_$defaults, "margin" + _lodash2.default.capitalize(position), marginX), _defineProperty(_$defaults, "marginTop", marginTop), _defineProperty(_$defaults, "marginBottom", marginBottom), _$defaults), zeroMargin);
    }
  }, {
    key: "getDefaultFormats",
    value: function getDefaultFormats(scaleType) {
      var timeFormatStrs = ["YYYY", "'YY", "MMM YYYY", "M/YY"];
      var numberFormatStrs = ["0.[00]a", "0,0", "0.[0]", "0.[00]", "0.[0000]", "0.[000000]"];

      return scaleType === "ordinal" ? [_lodash2.default.identity] : scaleType === "time" ? timeFormatStrs : numberFormatStrs;
    }
  }, {
    key: "getLabels",
    value: function getLabels(props) {
      var _$defaults2 = _lodash2.default.defaults(props, {}, YAxisLabels.defaultProps),
          tickCount = _$defaults2.tickCount,
          labelStyle = _$defaults2.labelStyle,
          yScale = _$defaults2.yScale;

      var ticks = props.ticks || (0, _Scale.getScaleTicks)(yScale, null, tickCount);
      var style = _lodash2.default.defaults(labelStyle, YAxisLabels.defaultProps.labelStyle);

      var scaleType = (0, _Scale.inferScaleType)(yScale);
      var propsFormats = props.format ? [props.format] : props.formats;
      var formatStrs = _lodash2.default.isArray(propsFormats) && propsFormats.length ? propsFormats : YAxisLabels.getDefaultFormats(scaleType);
      var formats = (0, _Label.makeLabelFormatters)(formatStrs, scaleType);

      // todo resolve ticks also
      // if there are so many ticks that no combination of labels can fit on the axis,
      // nudge down the tickCount and try again
      // doing this will require communicating the updated ticks/tickCount back to the parent element...

      var _resolveYLabelsForVal = resolveYLabelsForValues(yScale, ticks, formats, style),
          labels = _resolveYLabelsForVal.labels;
      // console.log('resolveYLabelsForValues took ', performance.now() - start);
      // console.log('found labels', labels);


      return labels;
    }
  }]);

  return YAxisLabels;
}(_react2.default.Component);

YAxisLabels.propTypes = {
  yScale: _propTypes2.default.func,
  height: _propTypes2.default.number,
  width: _propTypes2.default.number,
  position: _propTypes2.default.oneOf(["left", "right"]),
  placement: _propTypes2.default.oneOf(["before", "after"]),
  distance: _propTypes2.default.number,
  nice: _propTypes2.default.bool,
  tickCount: _propTypes2.default.number,
  ticks: _propTypes2.default.array,
  labelClassName: _propTypes2.default.string,
  labelStyle: _propTypes2.default.object,
  spacingLeft: _propTypes2.default.number,
  spacingRight: _propTypes2.default.number,
  // Label Handling
  onMouseEnterLabel: _propTypes2.default.func,
  onMouseMoveLabel: _propTypes2.default.func,
  onMouseLeaveLabel: _propTypes2.default.func
  // format: undefined,
  // formats: undefined,
  // labels: undefined
};
YAxisLabels.defaultProps = {
  height: 250,
  width: 400,
  position: "left",
  distance: 4,
  nice: true,
  tickCount: 10,
  ticks: null,
  labelClassName: "",
  labelStyle: {
    fontFamily: "Helvetica, sans-serif",
    fontSize: "14px",
    lineHeight: 1,
    textAnchor: "end"
  },
  spacingLeft: 0,
  spacingRight: 0
};

var YAxisLabelDebugRect = function (_React$Component2) {
  _inherits(YAxisLabelDebugRect, _React$Component2);

  function YAxisLabelDebugRect() {
    _classCallCheck(this, YAxisLabelDebugRect);

    return _possibleConstructorReturn(this, (YAxisLabelDebugRect.__proto__ || Object.getPrototypeOf(YAxisLabelDebugRect)).apply(this, arguments));
  }

  _createClass(YAxisLabelDebugRect, [{
    key: "render",
    value: function render() {
      var _props3 = this.props,
          x = _props3.x,
          y = _props3.y,
          label = _props3.label,
          style = _props3.style;

      var xAdj = style.textAnchor === "end" ? x - label.width : x;
      return _react2.default.createElement("rect", {
        x: xAdj,
        y: y - label.height / 2,
        width: label.width,
        height: label.height,
        fill: "orange"
      });
    }
  }]);

  return YAxisLabelDebugRect;
}(_react2.default.Component);

exports.default = YAxisLabels;
//# sourceMappingURL=YAxisLabels.js.map