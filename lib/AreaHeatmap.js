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

var _d3 = _interopRequireDefault(_d2);

var _util = require('./util.js');

var _Data = require('./utils/Data');

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
          scale = _this$props.scale,
          data = _this$props.data,
          getArea = _this$props.getArea,
          getX = _this$props.getX,
          getXEnd = _this$props.getXEnd,
          getY = _this$props.getY,
          getYEnd = _this$props.getYEnd,
          onMouseMove = _this$props.onMouseMove;

      if (!_lodash2.default.isFunction(onMouseMove)) return;
      // const [xAccessor, xEndAccessor, yAccessor, yEndAccessor] =
      //   [getArea, getX, getXEnd, getY, getYEnd].map(makeAccessor);

      var boundBox = _this.refs.background.getBoundingClientRect();
      if (!boundBox) return;
      var x = e.clientX - (boundBox.left || 0),
          y = e.clientY - (boundBox.top || 0);
      var _ref2 = [scale.x.invert(x), scale.y.invert(y)],
          xVal = _ref2[0],
          yVal = _ref2[1];
      //const xD = _.find(data, d => xVal >= xAccessor(d) && xVal < xEndAccessor(d));
      //const yD = _.find(data, d => yVal >= yAccessor(d) && yVal < yEndAccessor(d));
      //const d = _.find(data,
      //    d => xVal >= xAccessor(d) && xVal < xEndAccessor(d) && yVal >= yAccessor(d) && yVal < yEndAccessor(d));
      //const xBin = [xAccessor(xD), xEndAccessor(xD)];
      //const yBin = [yAccessor(yD), yEndAccessor(yD)];

      //onMouseMove(e, {xVal, yVal, d, xD, yD, xBin, yBin});

      onMouseMove(e, { xVal: xVal, yVal: yVal });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(AreaHeatmap, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          data = _props.data,
          getArea = _props.getArea,
          getX = _props.getX,
          getXEnd = _props.getXEnd,
          getY = _props.getY,
          getYEnd = _props.getYEnd,
          scale = _props.scale,
          scaleWidth = _props.scaleWidth,
          scaleHeight = _props.scaleHeight,
          rectClassName = _props.rectClassName,
          rectStyle = _props.rectStyle;

      var _map = [getArea, getX, getXEnd, getY, getYEnd].map(_Data.makeAccessor),
          _map2 = _slicedToArray(_map, 5),
          areaAccessor = _map2[0],
          xAccessor = _map2[1],
          xEndAccessor = _map2[2],
          yAccessor = _map2[3],
          yEndAccessor = _map2[4];

      // to determine how many data units are represented by 1 square pixel of area,
      // find the bin that would require the highest unit-per-pixel scale if its rectangle filled the whole container


      var unitsPerPixel = this.props.unitsPerPixel || Math.max.apply(this, data.map(function (d) {
        return areaAccessor(d) / Math.abs(
        // area of entire containing rectangle
        (scale.x(xEndAccessor(d)) - scale.x(xAccessor(d))) * (scale.y(yEndAccessor(d)) - scale.y(yAccessor(d))));
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
          // full width and height of the containing rectangle
          var fullWidth = Math.abs(scale.x(xEndAccessor(d)) - scale.x(xAccessor(d)));
          var fullHeight = Math.abs(scale.y(yEndAccessor(d)) - scale.y(yAccessor(d)));
          // x / y position of top left of the containing rectangle
          var x0 = Math.min(scale.x(xEndAccessor(d)), scale.x(xAccessor(d)));
          var y0 = Math.min(scale.y(yEndAccessor(d)), scale.y(yAccessor(d)));

          // we know two facts:
          // 1. the (pixel) area of the rect will be the data value divided by the # of data units per pixel
          //    ie. area = height * width = areaAccessor(d) / unitsPerPixel
          // 2. all rectangles, regardless of size, have the same shape (are congruent), so the ratio
          //    of the rect's width to the full width is equal to the ratio of its height to the full height.
          //    ie. (height / fullHeight) = (width / fullWidth)
          // solve for height and width to get...
          var width = Math.sqrt(areaAccessor(d) / unitsPerPixel * (fullWidth / fullHeight));
          var height = Math.sqrt(areaAccessor(d) / unitsPerPixel * (fullHeight / fullWidth));

          // center the data rect in the containing rectangle
          var x = x0 + (fullWidth - width) / 2;
          var y = y0 + (fullHeight - height) / 2;

          if (!_lodash2.default.every([x, y, width, height], _lodash2.default.isFinite)) return null;

          var className = 'area-heatmap-rect ' + rectClassName;
          var style = rectStyle;
          var key = 'rect-' + i;

          return _react2.default.createElement('rect', { x: x, y: y, width: width, height: height, className: className, style: style, key: key });
        })
      );
    }
  }], [{
    key: 'getDomain',
    value: function getDomain(props) {
      var data = props.data,
          getX = props.getX,
          getXEnd = props.getXEnd,
          getY = props.getY,
          getYEnd = props.getYEnd;

      return {
        x: _d3.default.extent(_lodash2.default.flatten([data.map((0, _Data.makeAccessor)(getX)), data.map((0, _Data.makeAccessor)(getXEnd))])),
        y: _d3.default.extent(_lodash2.default.flatten([data.map((0, _Data.makeAccessor)(getY)), data.map((0, _Data.makeAccessor)(getYEnd))]))
      };
    }
  }]);

  return AreaHeatmap;
}(_react2.default.Component);

AreaHeatmap.propTypes = {
  unitsPerPixel: _react2.default.PropTypes.number,
  rectClassName: _react2.default.PropTypes.string,
  rectStyle: _react2.default.PropTypes.object
};
AreaHeatmap.defaultProps = {
  rectClassName: '',
  rectStyle: {}
};
exports.default = AreaHeatmap;