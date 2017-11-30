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

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Data = require('./utils/Data');

var _Scale = require('./utils/Scale');

var _xyPropsEqual = require('./utils/xyPropsEqual');

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FunnelChart = function (_React$Component) {
  _inherits(FunnelChart, _React$Component);

  function FunnelChart() {
    _classCallCheck(this, FunnelChart);

    return _possibleConstructorReturn(this, (FunnelChart.__proto__ || Object.getPrototypeOf(FunnelChart)).apply(this, arguments));
  }

  _createClass(FunnelChart, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      var shouldUpdate = !(0, _xyPropsEqual2.default)(this.props, nextProps, []);
      return shouldUpdate;
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
          horizontal = _props.horizontal;


      var funnelArea = (0, _d.area)();
      if (horizontal) {
        funnelArea.x0(function (d, i) {
          return xScale(-(0, _Data.getValue)(x, d, i));
        }).x1(function (d, i) {
          return xScale((0, _Data.getValue)(x, d, i));
        }).y(function (d, i) {
          return yScale((0, _Data.getValue)(y, d, i));
        });
      } else {
        funnelArea.x(function (d, i) {
          return xScale((0, _Data.getValue)(x, d, i));
        }).y0(function (d, i) {
          return yScale(-(0, _Data.getValue)(y, d, i));
        }).y1(function (d, i) {
          return yScale((0, _Data.getValue)(y, d, i));
        });
      }

      var colors = (0, _d.scaleOrdinal)(_d.schemeCategory20b).domain(_lodash2.default.range(10));

      return _react2.default.createElement(
        'g',
        { className: 'funnel-chart' },
        data.map(function (d, i) {
          if (i === 0) return null;
          var pathStr = funnelArea([data[i - 1], d]);

          return _react2.default.createElement('path', { d: pathStr, style: { fill: colors(i - 1), stroke: 'transparent' } });
        })
      );
    }
  }], [{
    key: 'getDomain',
    value: function getDomain(props) {
      var data = props.data,
          xScaleType = props.xScaleType,
          yScaleType = props.yScaleType,
          x = props.x,
          y = props.y,
          horizontal = props.horizontal;
      var _ref = [(0, _Data.makeAccessor2)(x), (0, _Data.makeAccessor2)(y)],
          xAccessor = _ref[0],
          yAccessor = _ref[1];
      var _ref2 = [(0, _Scale.dataTypeFromScaleType)(xScaleType), (0, _Scale.dataTypeFromScaleType)(yScaleType)],
          xDataType = _ref2[0],
          yDataType = _ref2[1];


      return horizontal ? {
        xDomain: (0, _Data.combineDomains)([(0, _Data.domainFromData)(data, xAccessor, xDataType), (0, _Data.domainFromData)(data, function (d, i) {
          return -xAccessor(d, i);
        }, xDataType)]),
        yDomain: (0, _Data.domainFromData)(data, yAccessor, yDataType)
      } : {
        xDomain: (0, _Data.domainFromData)(data, xAccessor, xDataType),
        yDomain: (0, _Data.combineDomains)([(0, _Data.domainFromData)(data, yAccessor, yDataType), (0, _Data.domainFromData)(data, function (d, i) {
          return -yAccessor(d, i);
        }, yDataType)])
      };
    }
  }]);

  return FunnelChart;
}(_react2.default.Component);

FunnelChart.propTypes = {
  // data array
  data: _propTypes2.default.array.isRequired,
  // data getters
  x: CustomPropTypes.valueOrAccessor,
  y: CustomPropTypes.valueOrAccessor,
  horizontal: _propTypes2.default.bool,
  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: _propTypes2.default.func,
  /**
   * D3 scale for Y axis - provided by XYPlot
   */
  yScale: _propTypes2.default.func
};
FunnelChart.defaultProps = {};
exports.default = FunnelChart;
//# sourceMappingURL=FunnelChart.js.map