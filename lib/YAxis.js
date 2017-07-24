'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

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
          spacing = _props.spacing,
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

      var axisLineX = position === 'left' ? -spacing.left : width + spacing.right;
      // `height` is height of inner chart *not* including spacing - add spacing to figure out where to draw axis line
      var axisLineHeight = height + spacing.top + spacing.bottom;

      return _react2.default.createElement(
        'g',
        { className: 'chart-axis chart-axis-y' },
        showGrid ? _react2.default.createElement(_YGrid2.default, gridProps) : null,
        showTicks ? _react2.default.createElement(_YTicks2.default, ticksProps) : null,
        showLabels ? _react2.default.createElement(_YAxisLabels2.default, labelsProps) : null,
        showTitle ? _react2.default.createElement(_YAxisTitle2.default, titleProps) : null,
        _react2.default.createElement('line', {
          className: 'chart-axis-line chart-axis-line-y',
          x1: axisLineX, x2: axisLineX,
          y1: -spacing.top, y2: height + spacing.bottom
        })
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
  scale: _propTypes2.default.shape({ y: _propTypes2.default.func.isRequired }),

  width: _propTypes2.default.number,
  height: _propTypes2.default.number,
  position: _propTypes2.default.string,
  placement: _propTypes2.default.string,
  nice: _propTypes2.default.bool,
  ticks: _propTypes2.default.array,
  tickCount: _propTypes2.default.number,

  showTitle: _propTypes2.default.bool,
  showLabels: _propTypes2.default.bool,
  showTicks: _propTypes2.default.bool,
  showGrid: _propTypes2.default.bool,

  title: _propTypes2.default.string,
  titleDistance: _propTypes2.default.number,
  titleAlign: _propTypes2.default.string,
  titleRotate: _propTypes2.default.bool,
  titleStyle: _propTypes2.default.object,

  labelDistance: _propTypes2.default.number,
  labelClassName: _propTypes2.default.string,
  labelStyle: _propTypes2.default.object,
  labelFormat: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  labelFormats: _propTypes2.default.array,
  labels: _propTypes2.default.array,

  tickLength: _propTypes2.default.number,
  tickClassName: _propTypes2.default.string,
  tickStyle: _propTypes2.default.object,

  gridLineClassName: _propTypes2.default.string,
  gridLineStyle: _propTypes2.default.object,

  onMouseEnterLabel: _propTypes2.default.func,
  onMouseMoveLabel: _propTypes2.default.func,
  onMouseLeaveLabel: _propTypes2.default.func
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
  titleDistance: 5,
  spacing: { top: 0, bottom: 0, left: 0, right: 0 }
};
exports.default = YAxis;