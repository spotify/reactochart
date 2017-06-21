'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _Data = require('./utils/Data');

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PropTypes = _react2.default.PropTypes;

// AreaChart represents a simple bivariate area chart,
// a filled path drawn between two lines (datasets).

// todo horizontal prop, for filling area horizontally?
// todo support categorical data?
// todo support passing 2 data arrays and generating area between them? d3 doesn't seem to support this
// todo build StackedAreaChart that composes multiple AreaCharts

var AreaChart = function (_React$Component) {
  _inherits(AreaChart, _React$Component);

  function AreaChart() {
    _classCallCheck(this, AreaChart);

    return _possibleConstructorReturn(this, (AreaChart.__proto__ || Object.getPrototypeOf(AreaChart)).apply(this, arguments));
  }

  _createClass(AreaChart, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          name = _props.name,
          data = _props.data,
          getX = _props.getX,
          getY = _props.getY,
          getYEnd = _props.getYEnd,
          scale = _props.scale,
          pathStyle = _props.pathStyle;

      var accessors = { x: (0, _Data.makeAccessor)(getX), y: (0, _Data.makeAccessor)(getY), yEnd: (0, _Data.makeAccessor)(getYEnd) };

      var areaGenerator = (0, _d.area)();
      areaGenerator.x(function (d, i) {
        return scale.x(accessors.x(d, i));
      }).y0(function (d, i) {
        return scale.y(accessors.y(d, i));
      }).y1(function (d, i) {
        return scale.y(accessors.yEnd(d, i));
      });

      var areaPathStr = areaGenerator(data);

      return _react2.default.createElement(
        'g',
        { className: name + ' area-chart' },
        _react2.default.createElement('path', { className: 'area-chart-path', d: areaPathStr, style: pathStyle || {} })
      );
    }
  }], [{
    key: 'getDomain',
    value: function getDomain(props) {
      // custom Y domain - the total (union) extent of getY and getYEnd combined
      var data = props.data,
          getX = props.getX,
          getY = props.getY,
          getYEnd = props.getYEnd;

      var accessors = { x: (0, _Data.makeAccessor)(getX), y: (0, _Data.makeAccessor)(getY), yEnd: (0, _Data.makeAccessor)(getYEnd) };
      return {
        y: (0, _Data.combineDomains)([(0, _Data.domainFromData)(data, accessors.y), (0, _Data.domainFromData)(data, accessors.yEnd)])
      };
    }
  }]);

  return AreaChart;
}(_react2.default.Component);

AreaChart.propTypes = {
  // the array of data objects
  data: PropTypes.array.isRequired,
  // accessors for X & Y coordinates
  getX: CustomPropTypes.getter,
  getY: CustomPropTypes.getter,
  getYEnd: CustomPropTypes.getter,
  // style applied to path element
  pathStyle: PropTypes.object,

  scaleType: PropTypes.object,
  scale: PropTypes.object
};
exports.default = AreaChart;