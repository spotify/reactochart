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

var YTicks = function (_React$Component) {
  _inherits(YTicks, _React$Component);

  function YTicks() {
    _classCallCheck(this, YTicks);

    return _possibleConstructorReturn(this, (YTicks.__proto__ || Object.getPrototypeOf(YTicks)).apply(this, arguments));
  }

  _createClass(YTicks, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          width = _props.width,
          tickCount = _props.tickCount,
          position = _props.position,
          tickLength = _props.tickLength,
          tickStyle = _props.tickStyle,
          tickClassName = _props.tickClassName;

      var scale = this.props.scale.y;
      var placement = this.props.placement || (position === 'left' ? 'before' : 'after');
      var ticks = this.props.ticks || (0, _Scale.getScaleTicks)(scale, null, tickCount);
      var className = 'chart-tick chart-tick-y ' + (tickClassName || '');
      var transform = position === 'right' ? 'translate(' + width + ', 0)' : '';

      return _react2.default.createElement(
        'g',
        { className: 'chart-ticks-y', transform: transform },
        ticks.map(function (tick, i) {
          var y1 = scale(tick);
          var x2 = placement === 'before' ? -tickLength : tickLength;

          return _react2.default.createElement('line', {
            x1: 0, x2: x2, y1: y1, y2: y1,
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
      if (!_lodash2.default.get(props, 'scale.y')) return;
      props = _lodash2.default.defaults({}, props, YTicks.defaultProps);
      return { y: (0, _Scale.getTickDomain)(props.scale.y, props) };
    }
  }, {
    key: 'getMargin',
    value: function getMargin(props) {
      var _$defaults = _lodash2.default.defaults({}, props, YTicks.defaultProps),
          tickLength = _$defaults.tickLength,
          position = _$defaults.position;

      var placement = props.placement || (position === 'left' ? 'before' : 'after');
      var zeroMargin = { top: 0, bottom: 0, left: 0, right: 0 };

      if (position === 'left' && placement === 'after' || position == 'right' && placement === 'before') return zeroMargin;

      return _lodash2.default.defaults(_defineProperty({}, position, tickLength || 0), zeroMargin);
    }
  }]);

  return YTicks;
}(_react2.default.Component);

YTicks.propTypes = {
  scale: _react2.default.PropTypes.shape({ y: _react2.default.PropTypes.func.isRequired })
};
YTicks.defaultProps = {
  position: 'left',
  nice: true,
  tickLength: 5,
  tickStyle: {}
};
exports.default = YTicks;