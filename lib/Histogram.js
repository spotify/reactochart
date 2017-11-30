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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _Data = require('./utils/Data');

var _xyPropsEqual = require('./utils/xyPropsEqual');

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

var _AreaBarChart = require('./AreaBarChart');

var _AreaBarChart2 = _interopRequireDefault(_AreaBarChart);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// todo make histogram work horizontally *or* vertically
var Histogram = function (_React$Component) {
  _inherits(Histogram, _React$Component);

  function Histogram() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Histogram);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Histogram.__proto__ || Object.getPrototypeOf(Histogram)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      histogramData: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Histogram, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      var shouldUpdate = !(0, _xyPropsEqual2.default)(this.props, nextProps, []);
      return shouldUpdate;
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _props = this.props,
          xDomain = _props.xDomain,
          value = _props.value,
          data = _props.data;

      var chartHistogram = (0, _d.histogram)().domain(xDomain)
      // todo - get this working with arbitrary getValue accessor - seems to be broken -DD
      .value((0, _Data.makeAccessor2)(value)).thresholds(30);

      var histogramData = chartHistogram(data);

      this.setState({ histogramData: histogramData });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state.histogramData) return _react2.default.createElement('g', null);
      var _props2 = this.props,
          name = _props2.name,
          scale = _props2.scale,
          axisType = _props2.axisType,
          scaleWidth = _props2.scaleWidth,
          scaleHeight = _props2.scaleHeight,
          plotWidth = _props2.plotWidth,
          plotHeight = _props2.plotHeight;


      return _react2.default.createElement(_AreaBarChart2.default, _extends({}, this.props, {
        data: this.state.histogramData,
        x: getX0,
        xEnd: getX1,
        y: getLength
      }));
    }
  }], [{
    key: 'getScaleType',
    value: function getScaleType() {
      return {
        xScaleType: 'linear',
        yScaleType: 'linear'
      };
    }
  }, {
    key: 'getDomain',
    value: function getDomain(props) {
      var data = props.data,
          value = props.value;
      // todo implement for real

      return {
        // x: null,
        xDomain: (0, _Data.domainFromData)(data, (0, _Data.makeAccessor2)(value)),
        yDomain: [0, 200]
      };
    }
  }]);

  return Histogram;
}(_react2.default.Component);

Histogram.propTypes = {
  /**
   * the array of data objects
   */
  data: _propTypes2.default.array.isRequired,
  value: CustomPropTypes.valueOrAccessor,
  axisType: _propTypes2.default.object,
  scale: _propTypes2.default.object
};
exports.default = Histogram;


function getX0(d) {
  return d.x0;
}
function getX1(d) {
  return d.x1;
}
function getLength(d) {
  return d.length;
}
//# sourceMappingURL=Histogram.js.map