'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Scale = require('./utils/Scale');

var _Margin = require('./utils/Margin');

var _Axis = require('./utils/Axis');

var _xyPropsEqual = require('./utils/xyPropsEqual');

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

var _YTicks = require('./YTicks');

var _YTicks2 = _interopRequireDefault(_YTicks);

var _YGrid = require('./YGrid');

var _YGrid2 = _interopRequireDefault(_YGrid);

var _YAxisLabels = require('./YAxisLabels');

var _YAxisLabels2 = _interopRequireDefault(_YAxisLabels);

var _YAxisTitle = require('./YAxisTitle');

var _YAxisTitle2 = _interopRequireDefault(_YAxisTitle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var YAxis = function (_React$Component) {
  _inherits(YAxis, _React$Component);

  function YAxis() {
    _classCallCheck(this, YAxis);

    return _possibleConstructorReturn(this, (YAxis.__proto__ || Object.getPrototypeOf(YAxis)).apply(this, arguments));
  }

  _createClass(YAxis, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _xyPropsEqual2.default)(this.props, nextProps);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          width = _props.width,
          height = _props.height,
          position = _props.position,
          tickLength = _props.tickLength,
          titleDistance = _props.titleDistance,
          labelDistance = _props.labelDistance,
          showTitle = _props.showTitle,
          showLabels = _props.showLabels,
          showTicks = _props.showTicks,
          showGrid = _props.showGrid;

      var _getAxisChildProps = (0, _Axis.getAxisChildProps)(this.props),
          ticksProps = _getAxisChildProps.ticksProps,
          gridProps = _getAxisChildProps.gridProps,
          labelsProps = _getAxisChildProps.labelsProps,
          titleProps = _getAxisChildProps.titleProps;

      labelsProps.distance = labelDistance + (showTicks ? tickLength : 0);

      if (showTitle && showLabels) {
        // todo optimize so we don't generate labels twice
        var labelsMargin = _YAxisLabels2.default.getMargin(labelsProps);
        titleProps.distance = titleDistance + labelsMargin[position];
      } else if (showTitle && showTicks) {
        titleProps.distance = titleDistance + tickLength;
      }

      var axisLineX = position === 'left' ? 0 : width;

      return _react2.default.createElement(
        'g',
        { className: 'chart-axis chart-axis-y' },
        showGrid ? _react2.default.createElement(_YGrid2.default, gridProps) : null,
        showTicks ? _react2.default.createElement(_YTicks2.default, ticksProps) : null,
        showLabels ? _react2.default.createElement(_YAxisLabels2.default, labelsProps) : null,
        showTitle ? _react2.default.createElement(_YAxisTitle2.default, titleProps) : null,
        _react2.default.createElement('line', { className: 'chart-axis-line chart-axis-line-y', x1: axisLineX, x2: axisLineX, y1: 0, y2: height })
      );
    }
  }], [{
    key: 'getTickDomain',
    value: function getTickDomain(props) {
      if (!_lodash2.default.get(props, 'scale.y')) return;
      props = _lodash2.default.defaults({}, props, YAxis.defaultProps);
      return { y: (0, _Scale.getTickDomain)(props.scale.y, props) };
    }
  }, {
    key: 'getMargin',
    value: function getMargin(props) {
      // todo figure out margin if labels change after margin?
      var _getAxisChildProps2 = (0, _Axis.getAxisChildProps)(props),
          ticksProps = _getAxisChildProps2.ticksProps,
          labelsProps = _getAxisChildProps2.labelsProps,
          titleProps = _getAxisChildProps2.titleProps;

      var margins = [];

      if (props.showTicks) margins.push(_YTicks2.default.getMargin(ticksProps));

      if (props.showTitle && props.title) margins.push(_YAxisTitle2.default.getMargin(titleProps));

      if (props.showLabels) margins.push(_YAxisLabels2.default.getMargin(labelsProps));

      return (0, _Margin.sumMargins)(margins);
    }
  }]);

  return YAxis;
}(_react2.default.Component);

YAxis.propTypes = {
  scale: _react2.default.PropTypes.shape({ y: _react2.default.PropTypes.func.isRequired }),

  width: _react2.default.PropTypes.number,
  height: _react2.default.PropTypes.number,
  position: _react2.default.PropTypes.string,
  placement: _react2.default.PropTypes.string,
  nice: _react2.default.PropTypes.bool,
  ticks: _react2.default.PropTypes.array,
  tickCount: _react2.default.PropTypes.number,

  showTitle: _react2.default.PropTypes.bool,
  showLabels: _react2.default.PropTypes.bool,
  showTicks: _react2.default.PropTypes.bool,
  showGrid: _react2.default.PropTypes.bool,

  title: _react2.default.PropTypes.string,
  titleDistance: _react2.default.PropTypes.number,
  titleAlign: _react2.default.PropTypes.string,
  titleRotate: _react2.default.PropTypes.bool,
  titleStyle: _react2.default.PropTypes.object,

  labelDistance: _react2.default.PropTypes.number,
  labelClassName: _react2.default.PropTypes.string,
  labelStyle: _react2.default.PropTypes.object,
  labelFormat: _react2.default.PropTypes.string,
  labelFormats: _react2.default.PropTypes.array,
  labels: _react2.default.PropTypes.array,

  tickLength: _react2.default.PropTypes.number,
  tickClassName: _react2.default.PropTypes.string,
  tickStyle: _react2.default.PropTypes.object,

  gridLineClassName: _react2.default.PropTypes.string,
  gridLineStyle: _react2.default.PropTypes.object
};
YAxis.defaultProps = {
  width: 400,
  height: 250,
  position: 'left',
  nice: true,
  showTitle: true,
  showLabels: true,
  showTicks: true,
  showGrid: true,
  tickLength: 5,
  labelDistance: 3,
  titleDistance: 5
};
exports.default = YAxis;