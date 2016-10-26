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

var _d2 = require('d3');

var _d3 = _interopRequireDefault(_d2);

var _util = require('./util.js');

var _Data = require('./utils/Data');

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PropTypes = _react2.default.PropTypes;


var DEFAULT_PROPS = {
  getValue: null,
  margin: { top: 0, bottom: 0, left: 0, right: 0 },
  markerLineClass: 'marker-line',
  markerLineOverhangInner: 2,
  markerLineOverhangOuter: 2
};

// default height/width, used only if height & width & radius are all undefined
var DEFAULT_SIZE = 150;

var PieChart = function (_React$Component) {
  _inherits(PieChart, _React$Component);

  function PieChart() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, PieChart);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PieChart.__proto__ || Object.getPrototypeOf(PieChart)).call.apply(_ref, [this].concat(args))), _this), _this.onMouseEnterSlice = function (e, d) {
      _this.props.onMouseEnterSlice(e, d);
    }, _this.onMouseMoveSlice = function (e, d) {
      _this.props.onMouseMoveSlice(e, d);
    }, _this.onMouseLeaveSlice = function (e, d) {
      _this.props.onMouseLeaveSlice(e, d);
    }, _this.onMouseEnterLine = function (e, d) {
      _this.props.onMouseEnterLine(e, d);
    }, _this.onMouseMoveLine = function (e, d) {
      _this.props.onMouseMoveLine(e, d);
    }, _this.onMouseLeaveLine = function (e, d) {
      _this.props.onMouseLeaveLine(e, d);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(PieChart, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var margin = _lodash2.default.isNumber(this.props.margin) ? { top: this.props.margin, bottom: this.props.margin, left: this.props.margin, right: this.props.margin } : _lodash2.default.defaults({}, this.props.margin, DEFAULT_PROPS.margin);
      // sizes fallback based on provided info: given dimension -> radius + margin -> other dimension -> default
      var width = this.props.width || (this.props.radius ? this.props.radius * 2 + margin.left + margin.right : this.props.height) || DEFAULT_SIZE;
      var height = this.props.height || (this.props.radius ? this.props.radius * 2 + margin.top + margin.bottom : this.props.width) || DEFAULT_SIZE;
      var radius = this.props.radius || Math.min((width - (margin.left + margin.right)) / 2, (height - (margin.top + margin.bottom)) / 2);
      var holeRadius = this.props.holeRadius;

      var center = { x: margin.left + radius, y: margin.top + radius };

      var _props = this.props,
          markerLineValue = _props.markerLineValue,
          markerLineClass = _props.markerLineClass,
          markerLineOverhangInner = _props.markerLineOverhangInner,
          markerLineOverhangOuter = _props.markerLineOverhangOuter;


      var valueAccessor = (0, _Data.makeAccessor)(this.props.getValue);
      var sum = _lodash2.default.sumBy(this.props.data, valueAccessor);
      var total = this.props.total || sum;
      var markerLinePercent = _lodash2.default.isFinite(markerLineValue) ? markerLineValue / total : null;

      var startPercent = 0;
      return _react2.default.createElement(
        'svg',
        _extends({ className: 'pie-chart' }, { width: width, height: height }),
        this.props.data.map(function (d, i) {
          var _map = ['onMouseEnterSlice', 'onMouseMoveSlice', 'onMouseLeaveSlice'].map(function (eventName) {
            // partially apply this bar's data point as 2nd callback argument
            var callback = (0, _util.methodIfFuncProp)(eventName, _this2.props, _this2);
            return _lodash2.default.isFunction(callback) ? _lodash2.default.partial(callback, _lodash2.default, d) : null;
          }),
              _map2 = _slicedToArray(_map, 3),
              onMouseEnter = _map2[0],
              onMouseMove = _map2[1],
              onMouseLeave = _map2[2];

          var className = 'pie-slice pie-slice-' + i;
          var slicePercent = valueAccessor(d) / total;
          var endPercent = startPercent + slicePercent;
          var pathStr = pieSlicePath(startPercent, endPercent, center, radius, holeRadius);
          startPercent += slicePercent;
          var key = 'pie-slice-' + i;

          return _react2.default.createElement('path', { className: className, d: pathStr, onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave, key: key });
        }),
        sum < total ? // draw empty slice if the sum of slices is less than expected total
        _react2.default.createElement('path', {
          className: 'pie-slice pie-slice-empty',
          d: pieSlicePath(startPercent, 1, center, radius, holeRadius),
          key: 'pie-slice-empty'
        }) : null,
        _lodash2.default.isFinite(markerLinePercent) ? this.renderMarkerLine(markerLineClass, markerLine(markerLinePercent, center, radius, holeRadius, markerLineOverhangOuter, markerLineOverhangInner), 'pie-slice-marker-line') : null,
        this.props.centerLabel ? this.renderCenterLabel(center) : null
      );
    }
  }, {
    key: 'renderMarkerLine',
    value: function renderMarkerLine(className, pathData, key) {
      var _this3 = this;

      var lineD = {
        value: this.props.markerLineValue
      };

      var _map3 = ['onMouseEnterLine', 'onMouseMoveLine', 'onMouseLeaveLine'].map(function (eventName) {
        // partially apply this bar's data point as 2nd callback argument
        var callback = (0, _util.methodIfFuncProp)(eventName, _this3.props, _this3);
        return _lodash2.default.isFunction(callback) ? _lodash2.default.partial(callback, _lodash2.default, lineD) : null;
      }),
          _map4 = _slicedToArray(_map3, 3),
          onMouseEnter = _map4[0],
          onMouseMove = _map4[1],
          onMouseLeave = _map4[2];

      return _react2.default.createElement('path', _extends({
        className: className,
        d: pathData,
        key: key
      }, { onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave }));
    }
  }, {
    key: 'renderCenterLabel',
    value: function renderCenterLabel(center) {
      var x = center.x,
          y = center.y;

      var style = { textAnchor: 'middle', dominantBaseline: 'central' };
      return _react2.default.createElement(
        'text',
        _extends({ className: 'pie-label-center' }, { x: x, y: y, style: style }),
        this.props.centerLabel
      );
    }
  }]);

  return PieChart;
}(_react2.default.Component);

PieChart.propTypes = {
  // array of data to plot with pie chart
  data: PropTypes.array.isRequired,
  // (optional) accessor for getting the values plotted on the pie chart
  // if not provided, just uses the value itself at given index
  getValue: CustomPropTypes.getter,
  // (optional) total expected sum of all the pie slice values
  // if provided && slices don't add up to total, an "empty" slice will be rendered for the rest
  // if not provided, will be the sum of all values (ie. all values will always add up to 100%)
  total: PropTypes.number,
  // (optional) height and width of the SVG
  // if only one is passed, same # is used for both (ie. width=100 means height=100 also)
  // if neither is passed, but radius is, radius+margins is used
  // if neither is passed, and radius isn't either, DEFAULTS.size is used
  width: PropTypes.number,
  height: PropTypes.number,
  // (optional) main radius of the pie chart, inferred from margin/width/height if not provided
  radius: PropTypes.number,
  // (optional) margins (between svg edges and pie circle), inferred from radius/width/height if not provided
  // can either be a single number (to make all margins equal), or {top, bottom, left, right} object
  margin: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  // (optional) radius of the "donut hole" circle drawn on top of the pie chart to turn it into a donut chart
  holeRadius: PropTypes.number,
  // (optional) label text to display in the middle of the pie/donut
  centerLabel: PropTypes.string,

  markerLineValue: PropTypes.number,
  markerLineClass: PropTypes.string,
  markerLineOverhangInner: PropTypes.number,
  markerLineOverhangOuter: PropTypes.number,

  onMouseEnterLine: PropTypes.func,
  onMouseMoveLine: PropTypes.func,
  onMouseLeaveLine: PropTypes.func
};
PieChart.defaultProps = DEFAULT_PROPS;


function markerLine(percentValue, center, radius) {
  var holeRadius = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var overhangOuter = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var overhangInner = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

  if (percentValue == 1) endPercent = .9999999; // arc cannot be a full circle
  var startX = Math.sin(2 * Math.PI / (1 / percentValue));
  var startY = Math.cos(2 * Math.PI / (1 / percentValue));
  var c = center,
      r = radius,
      rH = holeRadius,
      x0 = startX,
      y0 = startY;
  var _ref2 = [Math.max(rH - overhangInner, 0), r + overhangOuter],
      r0 = _ref2[0],
      r1 = _ref2[1];


  return [// construct a string representing the marker line
  'M ' + (c.x + x0 * r0) + ',' + (c.y - y0 * r0), // start at edge of inner (hole) circle, or center if no hole
  'L ' + (c.x + x0 * r1) + ',' + (c.y - y0 * r1) + ' z' // straight line to outer circle, along radius
  ].join(' ');
}

function pieSlicePath(startPercent, endPercent, center, radius) {
  var holeRadius = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

  if (endPercent == 1) endPercent = .9999999; // arc cannot be a full circle
  var startX = Math.sin(2 * Math.PI / (1 / startPercent));
  var startY = Math.cos(2 * Math.PI / (1 / startPercent));
  var endX = Math.sin(2 * Math.PI / (1 / endPercent));
  var endY = Math.cos(2 * Math.PI / (1 / endPercent));
  var largeArc = endPercent - startPercent <= 0.5 ? 0 : 1;
  var c = center,
      r = radius,
      rH = holeRadius,
      x0 = startX,
      x1 = endX,
      y0 = startY,
      y1 = endY;


  return [// construct a string representing the pie slice path
  'M ' + (c.x + x0 * rH) + ',' + (c.y - y0 * rH), // start at edge of inner (hole) circle, or center if no hole
  'L ' + (c.x + x0 * r) + ',' + (c.y - y0 * r), // straight line to outer circle, along radius
  'A ' + r + ',' + r + ' 0 ' + largeArc + ' 1 ' + (c.x + x1 * r) + ',' + (c.y - y1 * r) // outer arc
  ].concat(holeRadius ? [// if we have an inner (donut) hole, draw an inner arc too, otherwise we're done
  'L ' + (c.x + x1 * rH) + ',' + (c.y - y1 * rH), // straight line to inner (hole) circle, along radius
  'A ' + rH + ',' + rH + ' 0 ' + largeArc + ' 0 ' + (c.x + x0 * rH) + ',' + (c.y - y0 * rH) + ' z' // inner arc
  ] : 'z').join(' ');
}

exports.default = PieChart;