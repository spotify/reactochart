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

var _YLine = require('./YLine');

var _YLine2 = _interopRequireDefault(_YLine);

var _Scale = require('./utils/Scale');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var YGrid = function (_React$Component) {
  _inherits(YGrid, _React$Component);

  function YGrid() {
    _classCallCheck(this, YGrid);

    return _possibleConstructorReturn(this, (YGrid.__proto__ || Object.getPrototypeOf(YGrid)).apply(this, arguments));
  }

  _createClass(YGrid, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          width = _props.width,
          yScale = _props.yScale,
          tickCount = _props.tickCount,
          lineClassName = _props.lineClassName,
          lineStyle = _props.lineStyle,
          spacingTop = _props.spacingTop,
          spacingBottom = _props.spacingBottom,
          spacingLeft = _props.spacingLeft,
          spacingRight = _props.spacingRight;

      var ticks = this.props.ticks || (0, _Scale.getScaleTicks)(yScale, null, tickCount);
      var className = 'chart-grid-line chart-grid-line-y ' + (lineClassName || '');

      return _react2.default.createElement(
        'g',
        { className: 'chart-grid-y' },
        ticks.map(function (tick, i) {
          return _react2.default.createElement(_YLine2.default, {
            width: width, yScale: yScale, className: className,
            spacingTop: spacingTop, spacingBottom: spacingBottom, spacingLeft: spacingLeft, spacingRight: spacingRight,
            value: tick,
            style: lineStyle,
            key: 'grid-y-line-' + i
          });
        })
      );
    }
  }], [{
    key: 'getTickDomain',
    value: function getTickDomain(props) {
      if (!props.yScale) return;
      props = _lodash2.default.defaults({}, props, YGrid.defaultProps);
      return { yTickDomain: (0, _Scale.getTickDomain)(props.yScale, props) };
    }
  }]);

  return YGrid;
}(_react2.default.Component);

YGrid.propTypes = {
  width: _propTypes2.default.number,
  height: _propTypes2.default.number,
  yScale: _propTypes2.default.func,
  spacingTop: _propTypes2.default.number,
  spacingBottom: _propTypes2.default.number,
  spacingLeft: _propTypes2.default.number,
  spacingRight: _propTypes2.default.number,
  nice: _propTypes2.default.bool,
  ticks: _propTypes2.default.array,
  tickCount: _propTypes2.default.number,
  lineClassName: _propTypes2.default.string,
  lineStyle: _propTypes2.default.object
};
YGrid.defaultProps = {
  nice: true,
  lineStyle: {}
};
exports.default = YGrid;
//# sourceMappingURL=YGrid.js.map