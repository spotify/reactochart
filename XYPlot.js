"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _resolveXYScales = require("./utils/resolveXYScales");

var _resolveXYScales2 = _interopRequireDefault(_resolveXYScales);

var _Margin = require("./utils/Margin");

var _Scale = require("./utils/Scale");

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function indexOfClosestNumberInList(number, list) {
  return list.reduce(function (closestI, current, i) {
    return Math.abs(current - number) < Math.abs(list[closestI] - number) ? i : closestI;
  }, 0);
}

function invertPointScale(scale, rangeValue) {
  // shim until d3.scalePoint.invert() is implemented for real
  // given a value from the output range, returns the *nearest* corresponding value in the input domain
  var rangePoints = scale.domain().map(function (domainValue) {
    return scale(domainValue);
  });
  var nearestPointIndex = indexOfClosestNumberInList(rangeValue, rangePoints);
  return scale.domain()[nearestPointIndex];
}

function getMouseOptions(event, _ref) {
  var xScale = _ref.xScale,
      yScale = _ref.yScale,
      height = _ref.height,
      width = _ref.width,
      marginTop = _ref.marginTop,
      marginBottom = _ref.marginBottom,
      marginLeft = _ref.marginLeft,
      marginRight = _ref.marginRight;

  var chartBB = event.currentTarget.getBoundingClientRect();
  var outerX = Math.round(event.clientX - chartBB.left);
  var outerY = Math.round(event.clientY - chartBB.top);
  var innerX = outerX - (marginLeft || 0);
  var innerY = outerY - (marginTop || 0);
  var chartSize = (0, _Margin.innerSize)({ width: width, height: height }, {
    top: marginTop,
    bottom: marginBottom,
    left: marginLeft,
    right: marginRight
  });
  var xScaleType = (0, _Scale.inferScaleType)(xScale);
  var yScaleType = (0, _Scale.inferScaleType)(yScale);

  var xValue = !_lodash2.default.inRange(innerX, 0, chartSize.width /* + padding.left + padding.right */
  ) ? null : xScaleType === "ordinal" ? invertPointScale(xScale, innerX) : xScale.invert(innerX);
  var yValue = !_lodash2.default.inRange(innerY, 0, chartSize.height /* + padding.top + padding.bottom */
  ) ? null : yScaleType === "ordinal" ? invertPointScale(yScale, innerY) : yScale.invert(innerY);

  return {
    event: event,
    outerX: outerX,
    outerY: outerY,
    innerX: innerX,
    innerY: innerY,
    xValue: xValue,
    yValue: yValue,
    xScale: xScale,
    yScale: yScale,
    marginTop: marginTop,
    marginBottom: marginBottom,
    marginLeft: marginLeft,
    marginRight: marginRight
  };
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
    }, _this.onMouseMove = _lodash2.default.partial(_this.onXYMouseEvent, "onMouseMove"), _this.onMouseDown = _lodash2.default.partial(_this.onXYMouseEvent, "onMouseDown"), _this.onMouseUp = _lodash2.default.partial(_this.onXYMouseEvent, "onMouseUp"), _this.onClick = _lodash2.default.partial(_this.onXYMouseEvent, "onClick"), _this.onMouseEnter = function (event) {
      return _this.props.onMouseEnter({ event: event });
    }, _this.onMouseLeave = function (event) {
      return _this.props.onMouseLeave({ event: event });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(XYPlot, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          width = _props.width,
          height = _props.height,
          marginTop = _props.marginTop,
          marginBottom = _props.marginBottom,
          marginLeft = _props.marginLeft,
          marginRight = _props.marginRight,
          spacingTop = _props.spacingTop,
          spacingBottom = _props.spacingBottom,
          spacingLeft = _props.spacingLeft,
          spacingRight = _props.spacingRight;
      // subtract margin + spacing from width/height to obtain inner width/height of panel & chart area
      // panelSize is the area including chart + spacing but NOT margin
      // chartSize is smaller, chart *only*, not including margin or spacing

      var panelSize = (0, _Margin.innerSize)({ width: width, height: height }, {
        top: marginTop,
        bottom: marginBottom,
        left: marginLeft,
        right: marginRight
      });
      var chartSize = (0, _Margin.innerSize)(panelSize, {
        top: spacingTop,
        bottom: spacingBottom,
        left: spacingLeft,
        right: spacingRight
      });

      var handlerNames = ["onMouseMove", "onMouseEnter", "onMouseLeave", "onMouseDown", "onMouseUp", "onClick"];
      var handlers = _lodash2.default.fromPairs(handlerNames.map(function (n) {
        return [n, (0, _util.methodIfFuncProp)(n, _this2.props, _this2)];
      }));

      var propsToPass = _extends({}, _lodash2.default.omit(this.props, ["children"]), chartSize);

      return _react2.default.createElement(
        "svg",
        _extends({ width: width, height: height, className: "xy-plot" }, handlers),
        _react2.default.createElement("rect", _extends({ className: "chart-background" }, { width: width, height: height })),
        _react2.default.createElement(
          "g",
          {
            transform: "translate(" + (marginLeft + spacingLeft) + ", " + (marginTop + spacingTop) + ")",
            className: "chart-inner"
          },
          _react2.default.createElement("rect", _extends({
            transform: "translate(" + -spacingLeft + ", " + -spacingTop + ")",
            className: "plot-background"
          }, panelSize)),
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
  /**
   * (outer) width of the chart (SVG element).
   */
  width: _propTypes2.default.number,
  /**
   * (outer) width of the chart (SVG element).
   */
  height: _propTypes2.default.number,
  /**
   * The X and/or Y domains of the data in {x: [...], y: [...]} format.
   * For numerical scales, this is represented as [min, max] of the data;
   * for ordinal/categorical scales it is an array of known values ie. ['a', 'b', 'c'].
   * Automatically determined from data if not passed.
   */
  xDomain: _propTypes2.default.array,
  yDomain: _propTypes2.default.array,
  /**
   * d3 scales for the X and Y axes of the chart, in {x, y} object format.
   * (optional, normally determined automatically by XYPlot)
   */
  xScale: _propTypes2.default.func,
  yScale: _propTypes2.default.func,

  xScaleType: _propTypes2.default.string,
  yScaleType: _propTypes2.default.string,

  /**
   *
   */
  margin: _propTypes2.default.object,
  marginTop: _propTypes2.default.number,
  marginBottom: _propTypes2.default.number,
  marginLeft: _propTypes2.default.number,
  marginRight: _propTypes2.default.number,

  // todo spacing & padding...
  spacingTop: _propTypes2.default.number,
  spacingBottom: _propTypes2.default.number,
  spacingLeft: _propTypes2.default.number,
  spacingRight: _propTypes2.default.number,

  paddingTop: _propTypes2.default.number,
  paddingBottom: _propTypes2.default.number,
  paddingLeft: _propTypes2.default.number,
  paddingRight: _propTypes2.default.number,

  invertXScale: _propTypes2.default.bool,
  invertYScale: _propTypes2.default.bool,

  onMouseMove: _propTypes2.default.func,
  onMouseEnter: _propTypes2.default.func,
  onMouseLeave: _propTypes2.default.func,
  onMouseDown: _propTypes2.default.func,
  onMouseUp: _propTypes2.default.func
};
XYPlot.defaultProps = {
  width: 400,
  height: 250,
  // invertScale: {x: false, y: false},
  invertXScale: false,
  invertYScale: false
  // emptyLabel: "Unknown",

  // these values are inferred from data if not provided, therefore empty defaults
  // scaleType: {},
  // domain: {},
  // margin: {},
  //spacing: {top: 0, bottom: 0, left: 0, right: 0}
};


var XYPlotResolved = (0, _resolveXYScales2.default)(XYPlot);

exports.default = XYPlotResolved;
//# sourceMappingURL=XYPlot.js.map