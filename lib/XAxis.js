'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _shallowEqual = require('./utils/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Scale = require('./utils/Scale');

var _Margin = require('./utils/Margin');

var _Axis = require('./utils/Axis');

var _xyPropsEqual = require('./utils/xyPropsEqual');

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

var _XTicks = require('./XTicks');

var _XTicks2 = _interopRequireDefault(_XTicks);

var _XGrid = require('./XGrid');

var _XGrid2 = _interopRequireDefault(_XGrid);

var _XAxisLabels = require('./XAxisLabels');

var _XAxisLabels2 = _interopRequireDefault(_XAxisLabels);

var _XAxisTitle = require('./XAxisTitle');

var _XAxisTitle2 = _interopRequireDefault(_XAxisTitle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var XAxis = function (_React$Component) {
  _inherits(XAxis, _React$Component);

  function XAxis() {
    _classCallCheck(this, XAxis);

    return _possibleConstructorReturn(this, (XAxis.__proto__ || Object.getPrototypeOf(XAxis)).apply(this, arguments));
  }

  _createClass(XAxis, [{
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
          spacingTop = _props.spacingTop,
          spacingBottom = _props.spacingBottom,
          spacingLeft = _props.spacingLeft,
          spacingRight = _props.spacingRight,
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
        var labelsMargin = _XAxisLabels2.default.getMargin(labelsProps);
        titleProps.distance = titleDistance + labelsMargin['margin' + _lodash2.default.upperFirst(position)];
      } else if (showTitle && showTicks) {
        titleProps.distance = titleDistance + tickLength;
      }

      var axisLineY = position === 'bottom' ? height + spacingBottom : -spacingTop;
      // `width` is width of inner chart *not* including spacing - add spacing to figure out where to draw line
      var axisLineWidth = width + spacingLeft + spacingRight;

      return _react2.default.createElement(
        'g',
        { className: 'chart-axis chart-axis-x' },
        showGrid ? _react2.default.createElement(_XGrid2.default, gridProps) : null,
        showTicks ? _react2.default.createElement(_XTicks2.default, ticksProps) : null,
        showLabels ? _react2.default.createElement(_XAxisLabels2.default, labelsProps) : null,
        showTitle ? _react2.default.createElement(_XAxisTitle2.default, titleProps) : null,
        _react2.default.createElement('line', {
          className: 'chart-axis-line chart-axis-line-x',
          x1: -spacingLeft, x2: width + spacingRight,
          y1: axisLineY, y2: axisLineY
        })
      );
    }
  }], [{
    key: 'getTickDomain',
    value: function getTickDomain(props) {
      if (!props.xScale) return;
      props = _lodash2.default.defaults({}, props, XAxis.defaultProps);
      return { xTickDomain: (0, _Scale.getTickDomain)(props.xScale, props) };
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

      if (props.showTicks) margins.push(_XTicks2.default.getMargin(ticksProps));

      if (props.showTitle && props.title) margins.push(_XAxisTitle2.default.getMargin(titleProps));

      if (props.showLabels) margins.push(_XAxisLabels2.default.getMargin(labelsProps));

      return (0, _Margin.sumMargins)(margins, 'margin');
    }
  }]);

  return XAxis;
}(_react2.default.Component);

XAxis.propTypes = {
  xScale: _propTypes2.default.func,
  width: _propTypes2.default.number,
  height: _propTypes2.default.number,
  position: _propTypes2.default.string,
  placement: _propTypes2.default.string,
  nice: _propTypes2.default.bool,
  ticks: _propTypes2.default.array,
  tickCount: _propTypes2.default.number,
  spacingTop: _propTypes2.default.number,
  spacingBottom: _propTypes2.default.number,
  spacingLeft: _propTypes2.default.number,
  spacingRight: _propTypes2.default.number,

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
  labelFormat: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
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
XAxis.defaultProps = {
  width: 400,
  height: 250,
  position: 'bottom',
  nice: true,
  showTitle: true,
  showLabels: true,
  showTicks: true,
  showGrid: true,
  tickLength: 5,
  labelDistance: 3,
  titleDistance: 5,
  spacingTop: 0,
  spacingBottom: 0,
  spacingLeft: 0,
  spacingRight: 0
};
exports.default = XAxis;
//# sourceMappingURL=XAxis.js.map