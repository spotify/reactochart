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

var _Data = require('./utils/Data');

var _util = require('./util.js');

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PropTypes = _react2.default.PropTypes;

var ScatterPlot = function (_React$Component) {
  _inherits(ScatterPlot, _React$Component);

  function ScatterPlot() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, ScatterPlot);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ScatterPlot.__proto__ || Object.getPrototypeOf(ScatterPlot)).call.apply(_ref, [this].concat(args))), _this), _this.onMouseEnterPoint = function (e, d) {
      _this.props.onMouseEnterPoint(e, d);
    }, _this.onMouseMovePoint = function (e, d) {
      _this.props.onMouseMovePoint(e, d);
    }, _this.onMouseLeavePoint = function (e, d) {
      _this.props.onMouseLeavePoint(e, d);
    }, _this.renderPoint = function (d, i) {
      var _map = ['onMouseEnterPoint', 'onMouseMovePoint', 'onMouseLeavePoint'].map(function (eventName) {
        // partially apply this bar's data point as 2nd callback argument
        var callback = (0, _util.methodIfFuncProp)(eventName, _this.props, _this);
        return _lodash2.default.isFunction(callback) ? _lodash2.default.partial(callback, _lodash2.default, d) : null;
      }),
          _map2 = _slicedToArray(_map, 3),
          onMouseEnter = _map2[0],
          onMouseMove = _map2[1],
          onMouseLeave = _map2[2];

      var _this$props = _this.props,
          scale = _this$props.scale,
          getX = _this$props.getX,
          getY = _this$props.getY,
          pointRadius = _this$props.pointRadius,
          pointOffset = _this$props.pointOffset,
          pointStyle = _this$props.pointStyle,
          getClass = _this$props.getClass;
      var pointSymbol = _this.props.pointSymbol;

      var className = 'chart-scatterplot-point ' + (getClass ? (0, _Data.makeAccessor)(getClass)(d) : '');
      var symbolProps = { className: className, onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave, key: 'scatter-point-' + i };

      // resolve symbol-generating functions into real symbols
      if (_lodash2.default.isFunction(pointSymbol)) pointSymbol = pointSymbol(d, i);
      // wrap string/number symbols in <text> container
      if (_lodash2.default.isString(pointSymbol) || _lodash2.default.isNumber(pointSymbol)) pointSymbol = _react2.default.createElement(
        'text',
        null,
        pointSymbol
      );
      // use props.pointRadius for circle radius
      if (pointSymbol.type === 'circle' && _lodash2.default.isUndefined(pointSymbol.props.r)) symbolProps.r = pointRadius;

      // x,y coords of center of symbol
      var cx = scale.x((0, _Data.makeAccessor)(getX)(d)) + pointOffset[0];
      var cy = scale.y((0, _Data.makeAccessor)(getY)(d)) + pointOffset[1];

      // set positioning attributes based on symbol type
      if (pointSymbol.type === 'circle' || pointSymbol.type === 'ellipse') {
        _lodash2.default.assign(symbolProps, { cx: cx, cy: cy, style: pointStyle });
      } else if (pointSymbol.type === 'text') {
        _lodash2.default.assign(symbolProps, { x: cx, y: cy, style: _extends({ textAnchor: 'middle', dominantBaseline: 'central' }, pointStyle) });
      } else {
        _lodash2.default.assign(symbolProps, { x: cx, y: cy, style: _extends({ transform: "translate(-50%, -50%)" }, pointStyle) });
      }

      return _react2.default.cloneElement(pointSymbol, symbolProps);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  // todo: implement getSpacing or getPadding static

  _createClass(ScatterPlot, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'g',
        { className: this.props.name },
        this.props.data.map(this.renderPoint)
      );
    }
  }]);

  return ScatterPlot;
}(_react2.default.Component);

ScatterPlot.propTypes = {
  // the array of data objects
  data: PropTypes.array.isRequired,
  // accessors for X & Y coordinates
  getX: CustomPropTypes.getter,
  getY: CustomPropTypes.getter,
  // allow user to pass an accessor for setting the class of a point
  getClass: CustomPropTypes.getter,

  scaleType: PropTypes.object,
  scale: PropTypes.object,

  // used with the default point symbol (circle), defines the circle radius
  pointRadius: PropTypes.number,
  // text or SVG node to use as custom point symbol, or function which returns text/SVG
  pointSymbol: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  // manual x and y offset applied to the point to center it, for custom point symbols which can't be auto-centered
  pointOffset: PropTypes.arrayOf(PropTypes.number),
  // inline styles for points
  pointStyle: PropTypes.object,

  onMouseEnterPoint: PropTypes.func,
  onMouseMovePoint: PropTypes.func,
  onMouseLeavePoint: PropTypes.func
};
ScatterPlot.defaultProps = {
  pointRadius: 3,
  pointSymbol: _react2.default.createElement('circle', null),
  pointOffset: [0, 0],
  pointStyle: {}
};
exports.default = ScatterPlot;