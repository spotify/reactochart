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
          style = _props.style;

      var title = this.props.title || this.props.children;
      var placement = this.props.placement || (position === 'left' ? 'before' : 'after');

      var rotate = this.props.rotate ? -90 : 0;
      var posX = position === 'right' ? width : 0;
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
      var zeroMargin = { top: 0, bottom: 0, left: 0, right: 0 };

      if (position === 'left' && placement === 'after' || position == 'right' && placement === 'before') return zeroMargin;

      var title = props.title || props.children;
      var style = _lodash2.default.defaults(props.style, YAxisTitle.defaultProps.style);
      var measured = (0, _measureText2.default)(_lodash2.default.assign({ text: title }, style));

      var marginValue = distance + Math.ceil(rotate ? measured.height.value : measured.width.value);

      return position === 'left' ? _extends({}, zeroMargin, { left: marginValue }) : _extends({}, zeroMargin, { right: marginValue });
    }
  }]);

  return YAxisTitle;
}(_react2.default.Component);

YAxisTitle.propTypes = {
  height: _react2.default.PropTypes.number,
  width: _react2.default.PropTypes.number,
  distance: _react2.default.PropTypes.number,
  position: _react2.default.PropTypes.oneOf(['left', 'right']),
  alignment: _react2.default.PropTypes.oneOf(['top', 'middle', 'bottom']),
  placement: _react2.default.PropTypes.oneOf(['before', 'after']),
  rotate: _react2.default.PropTypes.bool,
  style: _react2.default.PropTypes.object
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
  }
};
exports.default = YAxisTitle;