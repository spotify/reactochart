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

var _d2 = _interopRequireDefault(_d);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Data = require('./utils/Data');

var _Scale = require('./utils/Scale');

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
    key: 'render',
    value: function render() {
      var _props = this.props,
          data = _props.data,
          scale = _props.scale,
          getX = _props.getX,
          getY = _props.getY,
          horizontal = _props.horizontal;


      var area = _d2.default.svg.area().x(function (d) {
        return scale.x((0, _Data.makeAccessor)(getX)(d));
      }).y(function (d) {
        return scale.y((0, _Data.makeAccessor)(getY)(d));
      });

      if (horizontal) area.x0(function (d) {
        return scale.x(-(0, _Data.makeAccessor)(getX)(d));
      });else area.y0(function (d) {
        return scale.y(-(0, _Data.makeAccessor)(getY)(d));
      });

      var colors = _d2.default.scale.category20b().domain(_lodash2.default.range(10));

      return _react2.default.createElement(
        'g',
        { className: 'funnel-chart' },
        data.map(function (d, i) {
          if (i == 0) return null;
          var pathStr = area([data[i - 1], d]);

          return _react2.default.createElement('path', { d: pathStr, style: { fill: colors(i - 1), stroke: 'transparent' } });
        })
      );
    }
  }], [{
    key: 'getDomain',
    value: function getDomain(props) {
      var data = props.data,
          scale = props.scale,
          scaleType = props.scaleType,
          getX = props.getX,
          getY = props.getY,
          horizontal = props.horizontal;
      var _ref = [(0, _Data.makeAccessor)(getX), (0, _Data.makeAccessor)(getY)],
          xAccessor = _ref[0],
          yAccessor = _ref[1];
      var _ref2 = [(0, _Scale.dataTypeFromScaleType)(scaleType.x), (0, _Scale.dataTypeFromScaleType)(scaleType.y)],
          xDataType = _ref2[0],
          yDataType = _ref2[1];


      return horizontal ? {
        x: (0, _Data.combineDomains)([(0, _Data.domainFromData)(data, xAccessor, xDataType), (0, _Data.domainFromData)(data, function (d) {
          return -xAccessor(d);
        }, xDataType)]),
        y: (0, _Data.domainFromData)(data, yAccessor, yDataType)
      } : {
        x: (0, _Data.domainFromData)(data, xAccessor, xDataType),
        y: (0, _Data.combineDomains)([(0, _Data.domainFromData)(data, yAccessor, yDataType), (0, _Data.domainFromData)(data, function (d) {
          return -yAccessor(d);
        }, yDataType)])
      };
    }
  }]);

  return FunnelChart;
}(_react2.default.Component);

FunnelChart.propTypes = {
  // passed from xyplot
  scale: CustomPropTypes.xyObjectOf(_react2.default.PropTypes.func.isRequired),
  // data array
  data: _react2.default.PropTypes.array.isRequired,
  // data getters
  getX: CustomPropTypes.getter,
  getY: CustomPropTypes.getter
};
FunnelChart.defaultProps = {};
exports.default = FunnelChart;