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

var _AreaBarChart = require('./AreaBarChart');

var _AreaBarChart2 = _interopRequireDefault(_AreaBarChart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
    key: 'componentWillMount',
    value: function componentWillMount() {
      var histogramData = _d2.default.layout.histogram().bins(30)(this.props.data);
      //console.log('histogram', this.props.data, histogramData);
      this.setState({ histogramData: histogramData });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state.histogramData) return _react2.default.createElement('g', null);
      var _props = this.props,
          name = _props.name,
          scale = _props.scale,
          axisType = _props.axisType,
          scaleWidth = _props.scaleWidth,
          scaleHeight = _props.scaleHeight,
          plotWidth = _props.plotWidth,
          plotHeight = _props.plotHeight;


      return _react2.default.createElement(_AreaBarChart2.default, _extends({
        data: this.state.histogramData,
        getX: 'x',
        getXEnd: function getXEnd(d) {
          return d.x + d.dx;
        },
        getY: 'y'
      }, { name: name, scale: scale, axisType: axisType, scaleWidth: scaleWidth, scaleHeight: scaleHeight, plotWidth: plotWidth, plotHeight: plotHeight }));
    }
  }], [{
    key: 'getDomain',
    value: function getDomain() {
      // todo implement for real
      return { y: 200 };
    }
  }]);

  return Histogram;
}(_react2.default.Component);

Histogram.propTypes = {
  // the array of data objects
  data: _react2.default.PropTypes.array.isRequired,
  // accessor for X & Y coordinates
  getValue: _react2.default.PropTypes.object,
  axisType: _react2.default.PropTypes.object,
  scale: _react2.default.PropTypes.object
};
exports.default = Histogram;