'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d2 = require('d3');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _util = require('./util.js');

var _Data = require('./utils/Data');

var _xyPropsEqual = require('./utils/xyPropsEqual');

var _xyPropsEqual2 = _interopRequireDefault(_xyPropsEqual);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var CustomPropTypes = _interopRequireWildcard(_CustomPropTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AreaHeatmap = function (_React$Component) {
  _inherits(AreaHeatmap, _React$Component);

  function AreaHeatmap() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, AreaHeatmap);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = AreaHeatmap.__proto__ || Object.getPrototypeOf(AreaHeatmap)).call.apply(_ref, [this].concat(args))), _this), _this.onMouseEnter = function (e) {
      _this.props.onMouseEnter(e);
    }, _this.onMouseLeave = function (e) {
      _this.props.onMouseLeave(e);
    }, _this.onMouseMove = function (e) {
      var _this$props = _this.props,
          xScale = _this$props.xScale,
          yScale = _this$props.yScale,
          onMouseMove = _this$props.onMouseMove;

      if (!_lodash2.default.isFunction(onMouseMove)) return;

      var boundBox = _this.refs.background.getBoundingClientRect();
      if (!boundBox) return;
      var x = e.clientX - (boundBox.left || 0),
          y = e.clientY - (boundBox.top || 0);
      var _ref2 = [xScale.invert(x), yScale.invert(y)],
          xVal = _ref2[0],
          yVal = _ref2[1];


      onMouseMove(e, { xVal: xVal, yVal: yVal });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(AreaHeatmap, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      var shouldUpdate = !(0, _xyPropsEqual2.default)(this.props, nextProps, ['rectStyle']);
      return shouldUpdate;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          data = _props.data,
          area = _props.area,
          x = _props.x,
          xEnd = _props.xEnd,
          y = _props.y,
          yEnd = _props.yEnd,
          xScale = _props.xScale,
          yScale = _props.yScale,
          scaleWidth = _props.scaleWidth,
          scaleHeight = _props.scaleHeight,
          rectClassName = _props.rectClassName,
          rectStyle = _props.rectStyle;

      var _map = [area, x, xEnd, y, yEnd].map(_Data.makeAccessor2),
          _map2 = _slicedToArray(_map, 5),
          areaAccessor = _map2[0],
          xAccessor = _map2[1],
          xEndAccessor = _map2[2],
          yAccessor = _map2[3],
          yEndAccessor = _map2[4];

      // to determine how many data units are represented by 1 square pixel of area,
      // find the bin that would require the highest unit-per-pixel scale if its rectangle filled the whole container


      var unitsPerPixel = this.props.unitsPerPixel || Math.max.apply(this, data.map(function (d, i) {
        // ratio of this bin's area (in data units) to the entire area of its container rectangle (in pixels)
        return (0, _Data.getValue)(area, d, i) / Math.abs((xScale((0, _Data.getValue)(xEnd, d, i)) - xScale((0, _Data.getValue)(x, d, i))) * (yScale((0, _Data.getValue)(yEnd, d, i)) - yScale((0, _Data.getValue)(y, d, i))));
      }));

      var handlers = {
        onMouseMove: (0, _util.methodIfFuncProp)('onMouseMove', this.props, this),
        onMouseEnter: (0, _util.methodIfFuncProp)('onMouseEnter', this.props, this),
        onMouseLeave: (0, _util.methodIfFuncProp)('onMouseLeave', this.props, this)
      };

      return _react2.default.createElement(
        'g',
        _extends({ className: 'area-heatmap-chart' }, handlers),
        _react2.default.createElement('rect', { x: '0', y: '0', width: scaleWidth, height: scaleHeight, ref: 'background', fill: 'transparent' }),
        data.map(function (d, i) {
          var _map3 = [x, xEnd, y, yEnd, area].map(function (getter) {
            return (0, _Data.getValue)(getter, d, i);
          }),
              _map4 = _slicedToArray(_map3, 5),
              xVal = _map4[0],
              xEndVal = _map4[1],
              yVal = _map4[2],
              yEndVal = _map4[3],
              areaVal = _map4[4];
          // full width and height of the containing rectangle


          var fullWidth = Math.abs(xScale(xEndVal) - xScale(xVal));
          var fullHeight = Math.abs(yScale(yEndVal) - yScale(yVal));
          // x / y position of top left of the containing rectangle
          var fullRectX = Math.min(xScale(xEndVal), xScale(xVal));
          var fullRectY = Math.min(yScale(yEndVal), yScale(yVal));

          // we know two facts:
          // 1. the (pixel) area of the rect will be the data value divided by the # of data units per pixel
          //    ie. area = height * width = areaVal / unitsPerPixel
          var pixelArea = areaVal / unitsPerPixel;
          // 2. all rectangles, regardless of size, have the same shape (are congruent), so the ratio
          //    of the rect's width to the full width is equal to the ratio of its height to the full height.
          //    ie. (height / fullHeight) = (width / fullWidth)
          // solve for height and width to get...
          var width = Math.sqrt(pixelArea * (fullWidth / fullHeight));
          var height = Math.sqrt(pixelArea * (fullHeight / fullWidth));

          // center the data rect in the containing rectangle
          var rectX = fullRectX + (fullWidth - width) / 2;
          var rectY = fullRectY + (fullHeight - height) / 2;

          if (!_lodash2.default.every([rectX, rectY, width, height], _lodash2.default.isFinite)) return null;

          var className = 'area-heatmap-rect ' + (0, _Data.getValue)(rectClassName, d, i);
          var style = (0, _Data.getValue)(rectStyle, d, i);
          var key = 'rect-' + i;

          return _react2.default.createElement('rect', { x: rectX, y: rectY, width: width, height: height, className: className, style: style, key: key });
        })
      );
    }
  }], [{
    key: 'getDomain',
    value: function getDomain(props) {
      var data = props.data,
          x = props.x,
          xEnd = props.xEnd,
          y = props.y,
          yEnd = props.yEnd;

      return {
        // x: extent(_.flatten([data.map(makeAccessor(getX)), data.map(makeAccessor(getXEnd))])),
        x: (0, _d2.extent)(_lodash2.default.flatten([data.map((0, _Data.makeAccessor2)(x)), data.map((0, _Data.makeAccessor2)(xEnd))])),
        y: (0, _d2.extent)(_lodash2.default.flatten([data.map((0, _Data.makeAccessor2)(y)), data.map((0, _Data.makeAccessor2)(yEnd))]))
      };
    }
  }]);

  return AreaHeatmap;
}(_react2.default.Component);

AreaHeatmap.propTypes = {
  /**
   * the array of data objects
   */
  data: _propTypes2.default.array.isRequired,
  x: CustomPropTypes.valueOrAccessor,
  xEnd: CustomPropTypes.valueOrAccessor,
  y: CustomPropTypes.valueOrAccessor,
  yEnd: CustomPropTypes.valueOrAccessor,
  area: CustomPropTypes.valueOrAccessor,
  unitsPerPixel: _propTypes2.default.number,
  rectClassName: _propTypes2.default.string,
  rectStyle: _propTypes2.default.object,
  /**
   * D3 scale for X axis - provided by XYPlot
   */
  xScale: _propTypes2.default.func,
  /**
   * D3 scale for Y axis - provided by XYPlot
   */
  yScale: _propTypes2.default.func
};
AreaHeatmap.defaultProps = {
  rectClassName: '',
  rectStyle: {}
};
exports.default = AreaHeatmap;
//# sourceMappingURL=AreaHeatmap.js.map