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

var _XLine = require('./XLine');

var _XLine2 = _interopRequireDefault(_XLine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var XGrid = function (_React$Component) {
  _inherits(XGrid, _React$Component);

  function XGrid() {
    _classCallCheck(this, XGrid);

    return _possibleConstructorReturn(this, (XGrid.__proto__ || Object.getPrototypeOf(XGrid)).apply(this, arguments));
  }

  _createClass(XGrid, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          height = _props.height,
          spacing = _props.spacing,
          tickCount = _props.tickCount,
          lineClassName = _props.lineClassName,
          lineStyle = _props.lineStyle;

      var scale = this.props.scale.x;
      var ticks = this.props.ticks || (0, _Scale.getScaleTicks)(scale, null, tickCount);
      var className = 'chart-grid-line chart-grid-line-x ' + (lineClassName || '');

      return _react2.default.createElement(
        'g',
        { className: 'chart-grid-x' },
        ticks.map(function (tick, i) {
          return _react2.default.createElement(_XLine2.default, {
            height: height, className: className, spacing: spacing,
            scale: _this2.props.scale,
            value: tick,
            style: lineStyle,
            key: 'grid-x-line-' + i
          });
        })
      );
    }
  }], [{
    key: 'getTickDomain',
    value: function getTickDomain(props) {
      if (!_lodash2.default.get(props, 'scale.x')) return;
      props = _lodash2.default.defaults({}, props, XGrid.defaultProps);
      return { x: (0, _Scale.getTickDomain)(props.scale.x, props) };
    }
  }]);

  return XGrid;
}(_react2.default.Component);

XGrid.propTypes = {
  scale: _propTypes2.default.shape({ x: _propTypes2.default.func.isRequired }),
  width: _propTypes2.default.number,
  height: _propTypes2.default.number,
  nice: _propTypes2.default.bool,
  ticks: _propTypes2.default.array,
  tickCount: _propTypes2.default.number,
  lineClassName: _propTypes2.default.string,
  lineStyle: _propTypes2.default.object
};
XGrid.defaultProps = {
  nice: true,
  lineStyle: {}
};
exports.default = XGrid;