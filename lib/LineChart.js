'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _shallowEqual = require('./utils/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Data = require('./utils/Data');

var _xyPropsEqual = require('./utils/xyPropsEqual');

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LineChart = function (_React$Component) {
  _inherits(LineChart, _React$Component);

  function LineChart() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, LineChart);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = LineChart.__proto__ || Object.getPrototypeOf(LineChart)).call.apply(_ref, [this].concat(args))), _this), _this.getHovered = function (x, y) {
      var closestDataIndex = _this.state.bisectX(_this.props.data, x);
      return _this.props.data[closestDataIndex];
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(LineChart, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.initBisector(this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.initBisector(nextProps);
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _xyPropsEqual2.default)(this.props, nextProps, ['lineStyle', 'lineClassName']);
    }
  }, {
    key: 'initBisector',
    value: function initBisector(props) {
      this.setState({ bisectX: (0, _d.bisector)(function (d) {
          return (0, _Data.getValue)(props.x, d);
        }).left });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          data = _props.data,
          xScale = _props.xScale,
          yScale = _props.yScale,
          x = _props.x,
          y = _props.y,
          lineStyle = _props.lineStyle,
          lineClassName = _props.lineClassName;


      var points = _lodash2.default.map(data, function (d, i) {
        return [xScale((0, _Data.getValue)(x, d, i)), yScale((0, _Data.getValue)(y, d, i))];
      });
      var pathStr = pointsToPathStr(points);

      return _react2.default.createElement(
        'g',
        { className: this.props.name + ' ' + lineClassName },
        _react2.default.createElement('path', { d: pathStr, style: lineStyle })
      );
    }
  }]);

  return LineChart;
}(_react2.default.Component);

LineChart.propTypes = {
  /**
   * the array of data objects
   */
  data: _propTypes2.default.array.isRequired,
  /**
   * Accessor function for line X values, called once per datum, or a single X value to be used for the entire line.
   */
  x: CustomPropTypes.valueOrAccessor,
  /**
   * Accessor function for line Y values, called once per datum, or a single Y value to be used for the entire line.
   */
  y: CustomPropTypes.valueOrAccessor,
  /**
   * Inline style object to be applied to the line path
   */
  lineStyle: _propTypes2.default.object,
  /**
   * Class attribute to be applied to the line path
   */
  lineClassName: _propTypes2.default.string,
  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: _propTypes2.default.func,
  /**
   * D3 scale for Y axis - provided by XYPlot
   */
  yScale: _propTypes2.default.func
};
LineChart.defaultProps = {
  lineStyle: {},
  lineClassName: ''
};
exports.default = LineChart;


function pointsToPathStr(points) {
  // takes array of points in [[x, y], [x, y]... ] format
  // returns SVG path string in "M X Y L X Y" format
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
  // todo: replace this with d3 path generator
  return _lodash2.default.map(points, function (_ref2, i) {
    var _ref3 = _slicedToArray(_ref2, 2),
        x = _ref3[0],
        y = _ref3[1];

    var command = i === 0 ? 'M' : 'L';
    return command + ' ' + x + ' ' + y;
  }).join(' ');
}
//# sourceMappingURL=LineChart.js.map