'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d2 = require('d3');

var _d3 = _interopRequireDefault(_d2);

var _util = require('./util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PropTypes = _react2.default.PropTypes;


// on the taxonomy of bar charts:

// there are 3 types of bar charts,
// distinguished by whether the 2D data points they plot represent values or ranges

// 1. Value-Value
// typical bar chart, plotting values that look like [[0,5], [1,3], ...]
// with bars that are centered horizontally on x-value and extend from 0 to y-value,
// (or centered vertically on their y-value and extend from 0 to the x-value, in the case of horizontal chart variant)
// eg. http://www.snapsurveys.com/wp-content/uploads/2012/10/bar_2d8.png

// 2. Range-Value
// instead of a single value, one of the two data points represents a range of values
// usually the range is the independent variable and the value is the observation
// most commonly used in histogram, where each bar represents a bin (which is a range)
// data may look something like [[0, 5], 100], [[5, 15], 300], ...] or [{x: 0, xEnd: 5, y:100}...]
// often all bars are the same width, (same range sizes) but not necessarily
// bars still from extend from 0 to y-value,
// but the x-values of their sides, and therefore their width, is determined by the range
// (or vice versa in the case of horizontal variant)
// eg. http://labs.physics.dur.ac.uk/skills/skills/images/histogram4.jpg

// 3. Value-Range
// like Range-Value, one of the two data points represents a range of values
// but generally the range is the dependent variable (ie. observation) instead of vice versa in #2
// bars are centered over their x-value as in #1,
// but their top & bottom y-values, and therefore their length, is determined by the range. they don't extend to 0.
// (or vice versa in the case of horizontal variant)
// eg. (horizontal) http://6.anychart.com/products/anychart/docs/users-guide/img/Samples/sample-range-bar-chart-y-datetime-axis.png

// 4. Range-Range
// both of the data points represent ranges
// ie. data looks like [{x: 10, xEnd: 20, y: 12, yEnd: 40} ...]
// these are simply plotted as floating rectangles whose coordinates, length and width are all determined by the ranges
// there is no horizontal or vertical variant
// eg... can't find a good example

// creating a BarChart component...
// x and y values are represented by getValue.x and getValue.y accessors passed in as props
// to represent a range instead of a single value, call with both getValue.x and getEndValue.x (or y),
// which will be the accessors for the start and end values of the range
// to represent horizontal vs. vertical variant, pass in orientation="horizontal" or orientation="vertical"

// so to create the types described above:
// 1. Value-Value - only pass in getValue.x and getValue.y, + orientation
// 2. Range-Value
//   a. pass in getValue.x, getEndValue.x and getValue.y with orientation="vertical"
//   b. or getValue.x, getValue.y and getEndValue.y with orientation="horizontal"
// 3. Value-Range
//   a. pass in getValue.x, getValue.y and getEndValue.y with orientation="vertical"
//   b. or getValue.x, getEndValue.x and getValue.y with orientation="horizontal"
// 4. Range-Range - pass in ALL of getValue.x, getValue.y, getEndValue.x and getEndValue.y. no need for orientation.

//const BAR_CHART_TYPES = {
//    VALUE_VALUE: 'VALUE_VALUE',
//    RANGE_VALUE: 'RANGE_VALUE',
//    VALUE_RANGE: 'VALUE_RANGE',
//    RANGE_RANGE: 'RANGE_RANGE',
//};

function getBarChartType(props) {
  var getEndValue = props.getEndValue,
      orientation = props.orientation;

  var isVertical = orientation === 'vertical';
  return _lodash2.default.isUndefined(getEndValue.x) && _lodash2.default.isUndefined(getEndValue.y) ? 'ValueValue' : _lodash2.default.isUndefined(getEndValue.y) && isVertical || _lodash2.default.isUndefined(getEndValue.x) && !isVertical ? 'RangeValue' : _lodash2.default.isUndefined(getEndValue.x) && isVertical || _lodash2.default.isUndefined(getEndValue.y) && !isVertical ? 'ValueRange' : 'RangeRange';
}

function barZeroValue(data, dAccessor, scaleType) {
  switch (scaleType) {
    // number bars go from zero to value
    case 'number':
      return 0;
    // time values need a "zero" value to stretch from - the first date minus one day
    // todo make this less arbitrary? should be a rare case anyway.
    case 'time':
      return _d3.default.extent(data, dAccessor)[0] - 24 * 60 * 60 * 1000;
    // ordinal values need a "zero" value to stretch from -
    // empty string since it's unlikely to be used in real data and won't show a label
    case 'ordinal':
      return '';
  }
}

function valueAxisDomain(data, dAccessor, scaleType) {
  switch (scaleType) {
    case 'number':
    case 'time':
      return _d3.default.extent(_d3.default.extent(data, dAccessor).concat(barZeroValue(data, dAccessor, scaleType)));
    case 'ordinal':
      return _lodash2.default.uniq([barZeroValue(data, dAccessor, scaleType)].concat(data.map((0, _util.accessor)(dAccessor))));
  }
  return null;
}

function rangeAxisDomain(data, rangeStartAccessor, rangeEndAccessor, scaleType) {
  switch (scaleType) {
    case 'number':
    case 'time':
      return _d3.default.extent(_lodash2.default.flatten([_d3.default.extent(data, function (d) {
        return +rangeStartAccessor(d);
      }), _d3.default.extent(data, function (d) {
        return +rangeEndAccessor(d);
      })]));
    case 'ordinal':
      return _lodash2.default.uniq(_lodash2.default.flatten([data.map(rangeStartAccessor), data.map(rangeEndAccessor)]));
  }
  return [];
}

var BarChart = _react2.default.createClass({
  displayName: 'BarChart',

  mixins: [(0, _util.InterfaceMixin)('XYChart')],
  propTypes: {
    // the array of data objects
    data: PropTypes.array.isRequired,
    // accessor for X & Y coordinates
    getValue: PropTypes.object,
    getEndValue: PropTypes.object,
    getX: _util.AccessorPropType,
    getY: _util.AccessorPropType,
    getXEnd: _util.AccessorPropType,
    getYEnd: _util.AccessorPropType,
    // allow user to pass an accessor for setting the class of a bar
    getClass: _util.AccessorPropType,
    // thickness of value bars, in pixels, (ignored for RangeValue and RangeRange charts)
    barThickness: PropTypes.number,

    name: PropTypes.string,

    // x & y scale types
    scaleType: PropTypes.object,
    scale: PropTypes.object,

    orientation: PropTypes.oneOf(['vertical', 'horizontal']),

    onMouseEnterBar: PropTypes.func, // A mouse walks into a bar.
    onMouseMoveBar: PropTypes.func, // He is immediately killed by the bartender,
    onMouseLeaveBar: PropTypes.func // who can't risk another "C" rating from the health department.
  },
  getDefaultProps: function getDefaultProps() {
    return {
      barThickness: 10,
      orientation: 'vertical',
      getValue: {},
      getEndValue: {}
    };
  },


  statics: {
    getOptions: function getOptions(props) {
      // todo getDomain, getSpacing
      var data = props.data,
          scaleType = props.scaleType,
          getValue = props.getValue,
          getEndValue = props.getEndValue,
          orientation = props.orientation,
          barThickness = props.barThickness;
      var _ref = [(0, _util.accessor)(getValue.x), (0, _util.accessor)(getValue.y)],
          xAccessor = _ref[0],
          yAccessor = _ref[1];

      var barType = getBarChartType(props);
      var isVertical = orientation === 'vertical';

      var accessors = { x: xAccessor, y: yAccessor };
      var rangeEndAccessors = { x: (0, _util.accessor)(getEndValue.x), y: (0, _util.accessor)(getEndValue.y) };

      var options = { domain: {}, spacing: null };

      if (barType === 'ValueValue') {
        var valueAxis = isVertical ? 'y' : 'x'; // axis along which the bar's length shows value
        options.domain[valueAxis] = valueAxisDomain(data, accessors[valueAxis], scaleType[valueAxis]);
        // the value, and therefore the center of the bar, may fall exactly on the axis min or max,
        // therefore bars need (0.5*barThickness) spacing so they don't hang over the edge of the chart
        var halfBar = Math.ceil(0.5 * barThickness);
        options.spacing = isVertical ? { left: halfBar, right: halfBar } : { top: halfBar, bottom: halfBar };
      } else if (barType === 'RangeValue') {
        // rangeAxis: axis along which the bar's length shows value
        var _ref2 = isVertical ? ['x', 'y'] : ['y', 'x'],
            _ref3 = _slicedToArray(_ref2, 2),
            rangeAxis = _ref3[0],
            _valueAxis = _ref3[1];

        options.domain[_valueAxis] = valueAxisDomain(data, accessors[_valueAxis], scaleType[_valueAxis]);
        options.domain[rangeAxis] = rangeAxisDomain(data, accessors[rangeAxis], rangeEndAccessors[rangeAxis], scaleType[rangeAxis]);
        // no spacing necessary since bars are drawn *between* values, not on them.
      }
      return options;
    }
  },
  getHovered: function getHovered() {},
  onMouseEnterBar: function onMouseEnterBar(e, d) {
    this.props.onMouseEnterBar(e, d);
  },
  onMouseMoveBar: function onMouseMoveBar(e, d) {
    this.props.onMouseMoveBar(e, d);
  },
  onMouseLeaveBar: function onMouseLeaveBar(e, d) {
    this.props.onMouseLeaveBar(e, d);
  },
  render: function render() {
    // const renderer = this[`render${getBarChartType(this.props)}Bars`];
    var renderer = this.renderValueValueBars;
    return _react2.default.createElement(
      'g',
      { className: 'bar-chart ' + (this.props.name || '') },
      renderer()
    );
  },
  renderValueValueBars: function renderValueValueBars() {
    var _this = this;

    // typical bar chart, plotting values that look like [[0,5], [1,3], ...]
    // ie. both independent and dependent variables are single values
    var _props = this.props,
        data = _props.data,
        scale = _props.scale,
        getValue = _props.getValue,
        scaleType = _props.scaleType,
        getClass = _props.getClass,
        barThickness = _props.barThickness,
        orientation = _props.orientation;

    var _map = [getValue.x, getValue.y, getClass].map(_util.accessor),
        _map2 = _slicedToArray(_map, 3),
        xAccessor = _map2[0],
        yAccessor = _map2[1],
        classAccessor = _map2[2];

    var isVertical = this.props.orientation === 'vertical';

    return _react2.default.createElement(
      'g',
      null,
      data.map(function (d, i) {
        var _map3 = ['onMouseEnterBar', 'onMouseMoveBar', 'onMouseLeaveBar'].map(function (eventName) {
          // partially apply this bar's data point as 2nd callback argument
          var callback = (0, _util.methodIfFuncProp)(eventName, _this.props, _this);
          return _lodash2.default.isFunction(callback) ? _lodash2.default.partial(callback, _lodash2.default, d) : null;
        }),
            _map4 = _slicedToArray(_map3, 3),
            onMouseEnter = _map4[0],
            onMouseMove = _map4[1],
            onMouseLeave = _map4[2];

        // essentially the same process, whether horizontal or vertical bars


        var _ref4 = isVertical ? [scale.y, scaleType.y, yAccessor] : [scale.x, scaleType.x, xAccessor],
            _ref5 = _slicedToArray(_ref4, 3),
            valueScale = _ref5[0],
            valueScaleType = _ref5[1],
            valueAccessor = _ref5[2];

        var barZero = barZeroValue(data, valueAccessor, valueScaleType);
        var value = valueAccessor(d);
        var barLength = Math.abs(valueScale(barZero) - valueScale(value));
        var className = 'chart-bar chart-bar-' + orientation + ' ' + (getClass ? classAccessor(d) : '');
        var x = isVertical ? scale.x(xAccessor(d)) - barThickness / 2 : value >= 0 || scaleType.x === 'ordinal' ? scale.x(barZero) : scale.x(barZero) - barLength;
        var y = !isVertical ? scale.y(yAccessor(d)) - barThickness / 2 : value >= 0 || scaleType.y === 'ordinal' ? scale.y(barZero) - barLength : scale.y(barZero);

        var _ref6 = isVertical ? [barThickness, barLength] : [barLength, barThickness],
            _ref7 = _slicedToArray(_ref6, 2),
            width = _ref7[0],
            height = _ref7[1];

        var key = 'chart-bar-' + i;

        if (!_lodash2.default.every([x, y, width, height], _lodash2.default.isFinite)) return null;
        return _react2.default.createElement('rect', { className: className, key: key, x: x, y: y, width: width, height: height, onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave });
      })
    );
  },
  renderRangeValueBars: function renderRangeValueBars() {
    var _this2 = this;

    var _props2 = this.props,
        data = _props2.data,
        scale = _props2.scale,
        getValue = _props2.getValue,
        getEndValue = _props2.getEndValue,
        scaleType = _props2.scaleType,
        getClass = _props2.getClass,
        orientation = _props2.orientation;

    var _$map = _lodash2.default.map([getValue.x, getEndValue.x, getValue.y, getEndValue.y, getClass], _util.accessor),
        _$map2 = _slicedToArray(_$map, 5),
        xAccessor = _$map2[0],
        xEndAccessor = _$map2[1],
        yAccessor = _$map2[2],
        yEndAccessor = _$map2[3],
        classAccessor = _$map2[4];

    return orientation === 'vertical' ? _react2.default.createElement(
      'g',
      null,
      this.props.data.map(function (d, i) {
        var _map5 = ['onMouseEnterBar', 'onMouseMoveBar', 'onMouseLeaveBar'].map(function (eventName) {
          // partially apply this bar's data point as 2nd callback argument
          var callback = (0, _util.methodIfFuncProp)(eventName, _this2.props, _this2);
          return _lodash2.default.isFunction(callback) ? _lodash2.default.partial(callback, _lodash2.default, d) : null;
        }),
            _map6 = _slicedToArray(_map5, 3),
            onMouseEnter = _map6[0],
            onMouseMove = _map6[1],
            onMouseLeave = _map6[2];

        var barZero = barZeroValue(data, yAccessor, scaleType.y);
        var yVal = yAccessor(d);
        var barLength = Math.abs(scale.y(barZero) - scale.y(yVal));
        var barY = yVal >= 0 || scaleType.y === 'ordinal' ? scale.y(barZero) - barLength : scale.y(barZero);
        var barX = Math.round(scale.x(xAccessor(d)));
        var barThickness = Math.round(scale.x(xEndAccessor(d))) - barX;
        var className = 'chart-bar chart-bar-' + orientation + ' ' + (getClass ? classAccessor(d) : '');
        var key = 'chart-bar-' + i;
        if (!_lodash2.default.every([barX, barY, barThickness, barLength], _lodash2.default.isFinite)) return null;

        return _react2.default.createElement('rect', _extends({
          x: barX,
          y: barY,
          width: barThickness,
          height: barLength
        }, { className: className, key: key, onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave }));
      })
    ) : _react2.default.createElement(
      'g',
      null,
      this.props.data.map(function (d, i) {
        var _map7 = ['onMouseEnterBar', 'onMouseMoveBar', 'onMouseLeaveBar'].map(function (eventName) {
          // partially apply this bar's data point as 2nd callback argument
          var callback = (0, _util.methodIfFuncProp)(eventName, _this2.props, _this2);
          return _lodash2.default.isFunction(callback) ? _lodash2.default.partial(callback, _lodash2.default, d) : null;
        }),
            _map8 = _slicedToArray(_map7, 3),
            onMouseEnter = _map8[0],
            onMouseMove = _map8[1],
            onMouseLeave = _map8[2];

        var barZero = barZeroValue(data, xAccessor, scaleType.x);
        var xVal = xAccessor(d);
        var barLength = Math.abs(scale.x(barZero) - scale.x(xVal));
        var barX = xVal >= 0 || scaleType.x === 'ordinal' ? scale.x(barZero) : scale.x(barZero) - barLength;
        var barY = Math.round(scale.y(yEndAccessor(d)));
        var barThickness = Math.round(scale.y(yAccessor(d))) - barY;
        var className = 'chart-bar chart-bar-' + orientation + ' ' + (getClass ? classAccessor(d) : '');
        var key = 'chart-bar-' + i;
        if (!_lodash2.default.every([barX, barY, barThickness, barLength], _lodash2.default.isFinite)) return null;

        return _react2.default.createElement('rect', _extends({
          x: barX,
          y: barY,
          width: barLength,
          height: barThickness
        }, { className: className, key: key, onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave }));
      })
    );
  },
  renderValueRangeBars: function renderValueRangeBars() {
    return renderNotImplemented();
  },
  renderRangeRangeBars: function renderRangeRangeBars() {
    return renderNotImplemented();
  }
});

function renderNotImplemented() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "not implemented yet";

  return _react2.default.createElement(
    'svg',
    { x: 100, y: 100, style: { overflow: 'visible' } },
    _react2.default.createElement(
      'text',
      null,
      text
    )
  );
}

exports.default = BarChart;