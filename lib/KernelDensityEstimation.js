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

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _LineChart = require('./LineChart.js');

var _LineChart2 = _interopRequireDefault(_LineChart);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var KernelDensityEstimation = function (_React$Component) {
  _inherits(KernelDensityEstimation, _React$Component);

  function KernelDensityEstimation() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, KernelDensityEstimation);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = KernelDensityEstimation.__proto__ || Object.getPrototypeOf(KernelDensityEstimation)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      kdeData: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(KernelDensityEstimation, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.initKDE(this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      this.initKDE(newProps);
    }
  }, {
    key: 'initKDE',
    value: function initKDE(props) {
      var data = props.data,
          bandwidth = props.bandwidth,
          sampleCount = props.sampleCount,
          scale = props.scale,
          width = props.width;

      var kernel = epanechnikovKernel(bandwidth);
      var samples = scale.x.ticks(sampleCount || Math.ceil(width / 2));
      this.setState({ kdeData: kernelDensityEstimator(kernel, samples)(data) });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          name = _props.name,
          scale = _props.scale,
          width = _props.width,
          height = _props.height,
          plotWidth = _props.plotWidth,
          plotHeight = _props.plotHeight;
      var kdeData = this.state.kdeData;


      return _react2.default.createElement(_LineChart2.default, _extends({
        data: kdeData,
        getX: 0,
        getY: function getY(d) {
          return d[1] * 500;
        }
      }, { name: name, scale: scale, width: width, height: height, plotWidth: plotWidth, plotHeight: plotHeight }));
    }
  }], [{
    key: 'getDomain',
    value: function getDomain() {
      // todo implement real static getDomain method
      return {
        x: null,
        y: [0, 200]
      };
    }
  }]);

  return KernelDensityEstimation;
}(_react2.default.Component);

KernelDensityEstimation.propTypes = {
  // the array of data objects
  data: _react2.default.PropTypes.array.isRequired,

  // kernel bandwidth for kernel density estimator
  // https://en.wikipedia.org/wiki/Kernel_density_estimation#Bandwidth_selection
  // high bandwidth => oversmoothing & underfitting; low bandwidth => undersmoothing & overfitting
  bandwidth: _react2.default.PropTypes.number,
  // number of samples to take from the KDE
  // ie. the resolution/smoothness of the KDE line - more samples => higher resolution, smooth line
  sampleCount: _react2.default.PropTypes.number,

  // common props from XYPlot
  // accessor for data values
  getX: CustomPropTypes.getter,
  getY: CustomPropTypes.getter,
  name: _react2.default.PropTypes.string,
  scale: _react2.default.PropTypes.object,
  axisType: _react2.default.PropTypes.object,
  scaleWidth: _react2.default.PropTypes.number,
  scaleHeight: _react2.default.PropTypes.number
};
KernelDensityEstimation.defaultProps = {
  bandwidth: 0.5,
  sampleCount: null, // null = auto-determined based on width
  name: ''
};


function kernelDensityEstimator(kernel, x) {
  return function (sample) {
    return x.map(function (x) {
      return [x, _d2.default.mean(sample, function (v) {
        return kernel(x - v);
      })];
    });
  };
}

function epanechnikovKernel(scale) {
  return function (u) {
    return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
  };
}

exports.default = KernelDensityEstimation;