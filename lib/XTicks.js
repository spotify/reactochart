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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var XTicks = function (_React$Component) {
  _inherits(XTicks, _React$Component);

  function XTicks() {
    _classCallCheck(this, XTicks);

    return _possibleConstructorReturn(this, (XTicks.__proto__ || Object.getPrototypeOf(XTicks)).apply(this, arguments));
  }

  _createClass(XTicks, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          height = _props.height,
          tickCount = _props.tickCount,
          position = _props.position,
          tickLength = _props.tickLength,
          tickStyle = _props.tickStyle,
          tickClassName = _props.tickClassName;

      var scale = this.props.scale.x;
      var placement = this.props.placement || (position === 'top' ? 'above' : 'below');
      var ticks = this.props.ticks || (0, _Scale.getScaleTicks)(scale, null, tickCount);
      var className = 'chart-tick chart-tick-x ' + (tickClassName || '');
      var transform = position === 'bottom' ? 'translate(0,' + height + ')' : '';

      return _react2.default.createElement(
        'g',
        { className: 'chart-ticks-x', transform: transform },
        ticks.map(function (tick, i) {
          var x1 = scale(tick);
          var y2 = placement === 'above' ? -tickLength : tickLength;

          return _react2.default.createElement('line', {
            x1: x1, x2: x1, y1: 0, y2: y2,
            className: className,
            style: tickStyle,
            key: 'tick-' + i
          });
        })
      );
    }
  }], [{
    key: 'getTickDomain',
    value: function getTickDomain(props) {
      if (!_lodash2.default.get(props, 'scale.x')) return;
      props = _lodash2.default.defaults({}, props, XTicks.defaultProps);
      return { x: (0, _Scale.getTickDomain)(props.scale.x, props) };
    }
  }, {
    key: 'getMargin',
    value: function getMargin(props) {
      var _$defaults = _lodash2.default.defaults({}, props, XTicks.defaultProps),
          tickLength = _$defaults.tickLength,
          position = _$defaults.position;

      var placement = props.placement || (position === 'top' ? 'above' : 'below');
      var zeroMargin = { top: 0, bottom: 0, left: 0, right: 0 };

      if (position === 'bottom' && placement === 'above' || position == 'top' && placement === 'below') return zeroMargin;

      return _lodash2.default.defaults(_defineProperty({}, position, tickLength || 0), zeroMargin);
    }
  }]);

  return XTicks;
}(_react2.default.Component);

XTicks.propTypes = {
  scale: _react2.default.PropTypes.shape({ x: _react2.default.PropTypes.func.isRequired })
};
XTicks.defaultProps = {
  position: 'bottom',
  nice: true,
  tickLength: 5,
  tickStyle: {}
};
exports.default = XTicks;