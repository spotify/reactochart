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
          yScale = _props.yScale,
          tickCount = _props.tickCount,
          position = _props.position,
          tickLength = _props.tickLength,
          tickStyle = _props.tickStyle,
          tickClassName = _props.tickClassName,
          spacingLeft = _props.spacingLeft,
          spacingRight = _props.spacingRight;

      var placement = this.props.placement || (position === 'left' ? 'before' : 'after');
      var ticks = this.props.ticks || (0, _Scale.getScaleTicks)(yScale, null, tickCount);
      var className = 'chart-tick chart-tick-y ' + (tickClassName || '');
      var transform = position === 'right' ? 'translate(' + (width + spacingRight) + ', 0)' : 'translate(' + -spacingLeft + ', 0)';

      return _react2.default.createElement(
        'g',
        { className: 'chart-ticks-y', transform: transform },
        ticks.map(function (tick, i) {
          var y1 = yScale(tick);
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
      if (!props.yScale) return;
      props = _lodash2.default.defaults({}, props, YTicks.defaultProps);
      return { yTickDomain: (0, _Scale.getTickDomain)(props.yScale, props) };
    }
  }, {
    key: 'getMargin',
    value: function getMargin(props) {
      var _$defaults = _lodash2.default.defaults({}, props, YTicks.defaultProps),
          tickLength = _$defaults.tickLength,
          position = _$defaults.position;

      var placement = props.placement || (position === 'left' ? 'before' : 'after');
      var zeroMargin = { marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 };

      if (position === 'left' && placement === 'after' || position === 'right' && placement === 'before') return zeroMargin;

      return _lodash2.default.defaults(_defineProperty({}, 'margin' + _lodash2.default.capitalize(position), tickLength || 0), zeroMargin);
    }
  }]);

  return YTicks;
}(_react2.default.Component);

YTicks.propTypes = {
  yScale: _propTypes2.default.func,
  position: _propTypes2.default.oneOf(['left', 'right']),
  placement: _propTypes2.default.oneOf(['before', 'after']),
  ticks: _propTypes2.default.array,
  tickCount: _propTypes2.default.number,
  tickLength: _propTypes2.default.number,
  tickStyle: _propTypes2.default.object,
  tickClassName: _propTypes2.default.string,
  spacingLeft: _propTypes2.default.number,
  spacingRight: _propTypes2.default.number
};
YTicks.defaultProps = {
  position: 'left',
  nice: true,
  tickLength: 5,
  tickStyle: {},
  spacingLeft: 0,
  spacingRight: 0
};
exports.default = YTicks;
//# sourceMappingURL=YTicks.js.map