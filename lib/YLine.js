'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var YLine = function (_React$Component) {
  _inherits(YLine, _React$Component);

  function YLine() {
    _classCallCheck(this, YLine);

    return _possibleConstructorReturn(this, (YLine.__proto__ || Object.getPrototypeOf(YLine)).apply(this, arguments));
  }

  _createClass(YLine, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          yScale = _props.yScale,
          value = _props.value,
          width = _props.width,
          spacingLeft = _props.spacingLeft,
          spacingRight = _props.spacingRight,
          style = _props.style;

      var className = 'chart-line-y ' + (this.props.className || '');
      var lineY = yScale(value);

      return _react2.default.createElement('line', {
        x1: -spacingLeft,
        x2: width + spacingRight,
        y1: lineY,
        y2: lineY,
        className: className, style: style
      });
    }
  }]);

  return YLine;
}(_react2.default.Component);

YLine.propTypes = {
  yScale: _propTypes2.default.func,
  value: _propTypes2.default.any.isRequired,
  spacingLeft: _propTypes2.default.number,
  spacingRight: _propTypes2.default.number,
  style: _propTypes2.default.object,
  className: _propTypes2.default.string
};
YLine.defaultProps = {
  style: {},
  className: '',
  spacingLeft: 0,
  spacingRight: 0
};
exports.default = YLine;
//# sourceMappingURL=YLine.js.map