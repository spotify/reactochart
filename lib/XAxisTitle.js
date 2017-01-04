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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var XAxisTitle = function (_React$Component) {
  _inherits(XAxisTitle, _React$Component);

  function XAxisTitle() {
    _classCallCheck(this, XAxisTitle);

    return _possibleConstructorReturn(this, (XAxisTitle.__proto__ || Object.getPrototypeOf(XAxisTitle)).apply(this, arguments));
  }

  _createClass(XAxisTitle, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          height = _props.height,
          width = _props.width,
          distance = _props.distance,
          position = _props.position,
          alignment = _props.alignment,
          style = _props.style;

      var title = this.props.title || this.props.children;
      var placement = this.props.placement || (position === 'bottom' ? 'below' : 'above');
      var rotate = this.props.rotate ? -90 : 0;

      var posY = position === 'bottom' ? height : 0;
      var translateY = posY + (placement === 'above' ? -distance : distance);
      var translateX = alignment === 'center' ? width / 2 : alignment === 'right' ? width : 0;

      var textAnchor = rotate && placement === 'above' ? 'start' : rotate && placement === 'below' ? 'end' : alignment === 'left' ? 'start' : alignment === 'right' ? 'end' : 'middle';

      var dy = rotate && alignment === 'right' ? '-0.2em' : rotate && alignment === 'center' ? '0.3em' : rotate ? '0.8em' : placement === 'below' ? '0.8em' : '-0.2em';

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
      props = _lodash2.default.defaults({}, props, XAxisTitle.defaultProps);
      var _props2 = props,
          distance = _props2.distance,
          position = _props2.position,
          rotate = _props2.rotate;

      var placement = props.placement || (position === 'bottom' ? 'below' : 'above');
      var zeroMargin = { top: 0, bottom: 0, left: 0, right: 0 };

      if (position === 'bottom' && placement === 'above' || position == 'top' && placement === 'below') return zeroMargin;

      var title = props.title || props.children;
      var style = _lodash2.default.defaults(props.style, XAxisTitle.defaultProps.style);
      var measured = (0, _measureText2.default)(_lodash2.default.assign({ text: title }, style));

      var marginValue = distance + Math.ceil(rotate ? measured.width.value : measured.height.value);

      return position === 'bottom' ? _extends({}, zeroMargin, { bottom: marginValue }) : _extends({}, zeroMargin, { top: marginValue });
    }
  }]);

  return XAxisTitle;
}(_react2.default.Component);

XAxisTitle.propTypes = {
  height: _react2.default.PropTypes.number,
  width: _react2.default.PropTypes.number,
  distance: _react2.default.PropTypes.number,
  position: _react2.default.PropTypes.oneOf(['top', 'bottom']),
  placement: _react2.default.PropTypes.oneOf(['above', 'below']),
  alignment: _react2.default.PropTypes.oneOf(['left', 'center', 'right']),
  rotate: _react2.default.PropTypes.bool,
  style: _react2.default.PropTypes.object
};
XAxisTitle.defaultProps = {
  height: 250,
  width: 400,
  distance: 5,
  position: 'bottom',
  placement: undefined,
  alignment: 'center',
  rotate: false,
  style: {
    fontFamily: "Helvetica, sans-serif",
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: 1
  }
};
exports.default = XAxisTitle;