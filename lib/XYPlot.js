'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _resolveObjectProps = require('./utils/resolveObjectProps');

var _resolveObjectProps2 = _interopRequireDefault(_resolveObjectProps);

var _resolveXYScales = require('./utils/resolveXYScales');

var _resolveXYScales2 = _interopRequireDefault(_resolveXYScales);

var _Margin = require('./utils/Margin');

var _Scale = require('./utils/Scale');

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function indexOfClosestNumberInList(number, list) {
  return list.reduce(function (closestI, current, i) {
    return Math.abs(current - number) < Math.abs(list[closestI] - number) ? i : closestI;
  }, 0);
}

function getMouseOptions(event, _ref) {
  var scale = _ref.scale,
      height = _ref.height,
      width = _ref.width,
      margin = _ref.margin;

  var chartBB = event.currentTarget.getBoundingClientRect();
  var outerX = Math.round(event.clientX - chartBB.left);
  var outerY = Math.round(event.clientY - chartBB.top);
  var innerX = outerX - (margin.left || 0);
  var innerY = outerY - (margin.top || 0);
  var chartSize = (0, _Margin.innerSize)({ width: width, height: height }, margin);
  var scaleType = { x: (0, _Scale.inferScaleType)(scale.x), y: (0, _Scale.inferScaleType)(scale.y) };

  var xValue = !_lodash2.default.inRange(innerX, 0, chartSize.width /* + padding.left + padding.right */) ? null : scaleType.x === 'ordinal' ? scale.x.domain()[indexOfClosestNumberInList(innerX, scale.x.range())] : scale.x.invert(innerX);
  var yValue = !_lodash2.default.inRange(innerY, 0, chartSize.height /* + padding.top + padding.bottom */) ? null : scaleType.y === 'ordinal' ? scale.y.domain()[indexOfClosestNumberInList(innerY, scale.y.range())] : scale.y.invert(innerY);

  return { event: event, outerX: outerX, outerY: outerY, innerX: innerX, innerY: innerY, xValue: xValue, yValue: yValue, scale: scale, margin: margin };
}

var XYPlot = function (_React$Component) {
  _inherits(XYPlot, _React$Component);

  function XYPlot() {
    var _ref2;

    var _temp, _this, _ret;

    _classCallCheck(this, XYPlot);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = XYPlot.__proto__ || Object.getPrototypeOf(XYPlot)).call.apply(_ref2, [this].concat(args))), _this), _this.onXYMouseEvent = function (callbackKey, event) {
      var callback = _this.props[callbackKey];
      if (!_lodash2.default.isFunction(callback)) return;
      var options = getMouseOptions(event, _this.props);
      callback(options);
    }, _this.onMouseMove = _lodash2.default.partial(_this.onXYMouseEvent, 'onMouseMove'), _this.onMouseDown = _lodash2.default.partial(_this.onXYMouseEvent, 'onMouseDown'), _this.onMouseUp = _lodash2.default.partial(_this.onXYMouseEvent, 'onMouseUp'), _this.onClick = _lodash2.default.partial(_this.onXYMouseEvent, 'onClick'), _this.onMouseEnter = function (event) {
      return _this.props.onMouseEnter({ event: event });
    }, _this.onMouseLeave = function (event) {
      return _this.props.onMouseLeave({ event: event });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(XYPlot, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          width = _props.width,
          height = _props.height,
          margin = _props.margin;

      var chartSize = (0, _Margin.innerSize)({ width: width, height: height }, margin);

      var handlerNames = ['onMouseMove', 'onMouseEnter', 'onMouseLeave', 'onMouseDown', 'onMouseUp', 'onClick'];
      var handlers = _lodash2.default.fromPairs(handlerNames.map(function (n) {
        return [n, (0, _util.methodIfFuncProp)(n, _this2.props, _this2)];
      }));

      var propsToPass = _extends({}, _lodash2.default.omit(this.props, ['children']), chartSize);

      return _react2.default.createElement(
        'svg',
        _extends({ width: width, height: height, className: 'xy-plot', onMouseMove: this.onMouseMove }, handlers),
        _react2.default.createElement('rect', _extends({ className: 'chart-background' }, { width: width, height: height })),
        _react2.default.createElement(
          'g',
          { transform: 'translate(' + margin.left + ', ' + margin.top + ')', className: 'chart-inner' },
          _react2.default.createElement('rect', _extends({ className: 'plot-background' }, chartSize)),
          _react2.default.Children.map(this.props.children, function (child) {
            return _lodash2.default.isNull(child) || _lodash2.default.isUndefined(child) ? null : _react2.default.cloneElement(child, propsToPass);
          })
        )
      );
    }
  }]);

  return XYPlot;
}(_react2.default.Component);

XYPlot.propTypes = {
  width: _react2.default.PropTypes.number,
  height: _react2.default.PropTypes.number,
  scale: _react2.default.PropTypes.object,
  scaleType: _react2.default.PropTypes.object,
  domain: _react2.default.PropTypes.object,
  margin: _react2.default.PropTypes.object,
  // todo spacing & padding...
  nice: _react2.default.PropTypes.object,
  invertScale: _react2.default.PropTypes.object,

  onMouseMove: _react2.default.PropTypes.func,
  onMouseEnter: _react2.default.PropTypes.func,
  onMouseLeave: _react2.default.PropTypes.func,
  onMouseDown: _react2.default.PropTypes.func,
  onMouseUp: _react2.default.PropTypes.func
};
XYPlot.defaultProps = {
  width: 400,
  height: 250,
  // nice: {x: true, y: true},
  invertScale: { x: false, y: false }
  // emptyLabel: "Unknown",

  // these values are inferred from data if not provided, therefore empty defaults
  // scaleType: {},
  // domain: {},
  // margin: {},
  // spacing: {}
};


var xyKeys = ['scaleType', 'domain', 'invertScale'];
var dirKeys = ['margin', 'padding', 'spacing'];

var XYPlotResolved = _lodash2.default.flow([_resolveXYScales2.default, _lodash2.default.partial(_resolveObjectProps2.default, _lodash2.default, xyKeys, ['x', 'y']), _lodash2.default.partial(_resolveObjectProps2.default, _lodash2.default, dirKeys, ['top', 'bottom', 'left', 'right'])])(XYPlot);

exports.default = XYPlotResolved;