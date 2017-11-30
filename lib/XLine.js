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

var XLine = function (_React$Component) {
  _inherits(XLine, _React$Component);

  function XLine() {
    _classCallCheck(this, XLine);

    return _possibleConstructorReturn(this, (XLine.__proto__ || Object.getPrototypeOf(XLine)).apply(this, arguments));
  }

  _createClass(XLine, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          xScale = _props.xScale,
          value = _props.value,
          height = _props.height,
          style = _props.style,
          spacingTop = _props.spacingTop,
          spacingBottom = _props.spacingBottom;

      var className = 'chart-line-x ' + this.props.className;
      var lineX = xScale(value);

      return _react2.default.createElement('line', {
        x1: lineX,
        x2: lineX,
        y1: -spacingTop,
        y2: height + spacingBottom,
        className: className, style: style
      });
    }
  }]);

  return XLine;
}(_react2.default.Component);

XLine.propTypes = {
  xScale: _propTypes2.default.func,
  value: _propTypes2.default.any.isRequired,
  spacingTop: _propTypes2.default.number,
  spacingBottom: _propTypes2.default.number,
  style: _propTypes2.default.object,
  className: _propTypes2.default.string
};
XLine.defaultProps = {
  style: {},
  className: '',
  spacingTop: 0,
  spacingBottom: 0
};
exports.default = XLine;
//# sourceMappingURL=XLine.js.map