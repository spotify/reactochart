'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _isUndefined = require('lodash/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

var _util = require('./util');

var _Scale = require('./utils/Scale');

var _Data = require('./utils/Data');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// RangeRect is a low-level component to be used in XYPlot-type charts (namely AreaBarChart)
// It is a rectangle which represents a range (min & max) of values on both (X & Y) axes.
// Takes a single datum object, and getters which specify how to retrieve the range values from it

var RangeRect = function (_React$Component) {
  _inherits(RangeRect, _React$Component);

  function RangeRect() {
    _classCallCheck(this, RangeRect);

    return _possibleConstructorReturn(this, (RangeRect.__proto__ || Object.getPrototypeOf(RangeRect)).apply(this, arguments));
  }

  _createClass(RangeRect, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          scale = _props.scale,
          datum = _props.datum,
          getX = _props.getX,
          getXEnd = _props.getXEnd,
          getY = _props.getY,
          getYEnd = _props.getYEnd,
          style = _props.style;


      (0, _invariant2.default)((0, _Scale.hasXYScales)(scale), 'Bar.props.scale.x and scale.y must both be valid d3 scales');
      // todo warn if getX/Y/etc return bad values

      var className = 'chart-range-rect ' + (this.props.className || '');
      var x0 = scale.x((0, _Data.makeAccessor)(getX)(datum));
      var x1 = scale.x((0, _Data.makeAccessor)(getXEnd)(datum));
      var y0 = scale.y((0, _Data.makeAccessor)(getY)(datum));
      var y1 = scale.y((0, _Data.makeAccessor)(getYEnd)(datum));
      var x = Math.min(x0, x1);
      var y = Math.min(y0, y1);
      var width = Math.abs(x1 - x0);
      var height = Math.abs(y1 - y0);

      // todo onMouseEnter, onMouseMove, onMouseLeave
      return _react2.default.createElement('rect', { x: x, y: y, width: width, height: height, className: className, style: style });
    }
  }]);

  return RangeRect;
}(_react2.default.Component);

RangeRect.propTypes = {
  scale: _react2.default.PropTypes.shape({ x: _react2.default.PropTypes.func.isRequired, y: _react2.default.PropTypes.func.isRequired }),
  datum: _react2.default.PropTypes.any,
  getX: CustomPropTypes.getter,
  getXEnd: CustomPropTypes.getter,
  getY: CustomPropTypes.getter,
  getYEnd: CustomPropTypes.getter,
  className: _react2.default.PropTypes.string,
  style: _react2.default.PropTypes.object
};
RangeRect.defaultProps = {
  className: '',
  style: {}
};
exports.default = RangeRect;