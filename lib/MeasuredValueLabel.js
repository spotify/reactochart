'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _measureText = require('measure-text');

var _measureText2 = _interopRequireDefault(_measureText);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MeasuredValueLabel = function (_React$Component) {
  _inherits(MeasuredValueLabel, _React$Component);

  function MeasuredValueLabel() {
    _classCallCheck(this, MeasuredValueLabel);

    return _possibleConstructorReturn(this, (MeasuredValueLabel.__proto__ || Object.getPrototypeOf(MeasuredValueLabel)).apply(this, arguments));
  }

  _createClass(MeasuredValueLabel, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          value = _props.value,
          format = _props.format;

      var passedProps = _lodash2.default.omit(this.props, ['value', 'format']);

      return _react2.default.createElement(
        'text',
        passedProps,
        _react2.default.Children.count(this.props.children) ? this.props.children : format(value)
      );
    }
  }], [{
    key: 'getLabel',
    value: function getLabel(props) {
      var value = props.value,
          format = props.format;

      var style = _lodash2.default.defaults(props.style, MeasuredValueLabel.defaultProps.style);
      var labelStr = format(value);
      var measured = (0, _measureText2.default)(_lodash2.default.assign({ text: labelStr }, style));

      return {
        value: props.value,
        text: measured.text,
        height: measured.height.value,
        width: measured.width.value
      };
    }
  }]);

  return MeasuredValueLabel;
}(_react2.default.Component);

MeasuredValueLabel.propTypes = {
  value: _react2.default.PropTypes.any.isRequired
};
MeasuredValueLabel.defaultProps = {
  format: _lodash2.default.identity,
  style: {
    fontFamily: "Helvetica, sans-serif",
    fontSize: '20px',
    lineHeight: 1,
    textAnchor: 'middle'
  }
};
exports.default = MeasuredValueLabel;