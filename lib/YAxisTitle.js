'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _measureText = require('measure-text');

var _measureText2 = _interopRequireDefault(_measureText);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var YAxisTitle = function (_React$Component) {
  _inherits(YAxisTitle, _React$Component);

  function YAxisTitle() {
    _classCallCheck(this, YAxisTitle);

    return _possibleConstructorReturn(this, (YAxisTitle.__proto__ || Object.getPrototypeOf(YAxisTitle)).apply(this, arguments));
  }

  _createClass(YAxisTitle, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          height = _props.height,
          width = _props.width,
          distance = _props.distance,
          position = _props.position,
          alignment = _props.alignment,
          style = _props.style,
          spacingLeft = _props.spacingLeft,
          spacingRight = _props.spacingRight;

      var title = this.props.title || this.props.children;
      var placement = this.props.placement || (position === 'left' ? 'before' : 'after');

      var rotate = this.props.rotate ? -90 : 0;
      var posX = position === 'right' ? width + spacingRight : -spacingLeft;
      var translateX = posX + (placement === 'before' ? -distance : distance);
      var translateY = alignment === 'middle' ? height / 2 : alignment === 'bottom' ? height : 0;
      var textAnchor = rotate && alignment === 'top' ? 'end' : rotate && alignment === 'middle' ? 'middle' : rotate && alignment === 'bottom' ? 'start' : placement === 'before' ? 'end' : 'start';
      var dy = rotate && placement == 'before' ? '-0.2em' : rotate ? '0.8em' : alignment === 'top' ? '0.8em' : alignment === 'middle' ? '0.3em' : null;

      return _react2.default.createElement(
        'g',
        { transform: 'translate(' + translateX + ',' + translateY + ')' },
        _react2.default.createElement(
          'text',
          { style: _extends({}, style, { textAnchor: textAnchor }), transform: 'rotate(' + rotate + ')', dy: dy },
          title
        )
      );
    }
  }], [{
    key: 'getMargin',
    value: function getMargin(props) {
      props = _lodash2.default.defaults({}, props, YAxisTitle.defaultProps);
      var _props2 = props,
          distance = _props2.distance,
          position = _props2.position,
          rotate = _props2.rotate;

      var placement = props.placement || (position === 'left' ? 'before' : 'after');
      var zeroMargin = { marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 };

      if (position === 'left' && placement === 'after' || position === 'right' && placement === 'before') return zeroMargin;

      var title = props.title || props.children;
      var style = _lodash2.default.defaults(props.style, YAxisTitle.defaultProps.style);
      var measured = (0, _measureText2.default)(_lodash2.default.assign({ text: title }, style));

      var marginValue = distance + Math.ceil(rotate ? measured.height.value : measured.width.value);

      return position === 'left' ? _extends({}, zeroMargin, { marginLeft: marginValue }) : _extends({}, zeroMargin, { marginRight: marginValue });
    }
  }]);

  return YAxisTitle;
}(_react2.default.Component);

YAxisTitle.propTypes = {
  height: _propTypes2.default.number,
  width: _propTypes2.default.number,
  distance: _propTypes2.default.number,
  position: _propTypes2.default.oneOf(['left', 'right']),
  alignment: _propTypes2.default.oneOf(['top', 'middle', 'bottom']),
  placement: _propTypes2.default.oneOf(['before', 'after']),
  rotate: _propTypes2.default.bool,
  style: _propTypes2.default.object,
  spacingLeft: _propTypes2.default.number,
  spacingRight: _propTypes2.default.number
};
YAxisTitle.defaultProps = {
  height: 250,
  width: 400,
  distance: 5,
  position: 'left',
  alignment: 'middle',
  placement: undefined,
  rotate: true,
  style: {
    fontFamily: "Helvetica, sans-serif",
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: 1
  },
  spacingLeft: 0,
  spacingRight: 0
};
exports.default = YAxisTitle;
//# sourceMappingURL=YAxisTitle.js.map