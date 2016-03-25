'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d2 = require('d3');

var _d3 = _interopRequireDefault(_d2);

var _util = require('./util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import shallowCompare from 'react-addons-shallow-compare';
// import PureRenderDebug from 'react-pure-render-debug';
var PropTypes = _react2.default.PropTypes;

// import resolveXYScales from './utils/resolveXYScales';
// import resolveObjectProps from './utils/resolveObjectProps';

// import shallowEqual from 'recompose/shallowEqual';

var LineChart = _react2.default.createClass({
  displayName: 'LineChart',

  mixins: [(0, _util.InterfaceMixin)('XYChart')],
  propTypes: {
    // the array of data objects
    data: PropTypes.array.isRequired,
    // accessor for X & Y coordinates
    getValue: PropTypes.object,

    // props from XYPlot
    scale: PropTypes.object
  },

  componentWillMount: function componentWillMount() {
    this.initBisector(this.props);
  },
  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    this.initBisector(newProps);
  },

  // shouldComponentUpdate(nextProps, nextState) {
  //   const shallowKeys = ['data', 'getValue'];
  //   const [shallowProps, shallowNextProps] = [this.props, nextProps].map(p => _.pick(p, shallowKeys));
  //   const isShallowEqual = shallowEqual(shallowProps, shallowNextProps);
  //
  //   const deeperKeys = ['scale'];
  //   const [deeperProps, deeperNextProps] = [this.props, nextProps].map(p => _.pick(p, deeperKeys));
  //   const isDeeperEqual = _.every(deeperKeys, k => shallowEqual(this.props[k], nextProps[k]));
  //
  //   const shouldUpdate = isShallowEqual && isDeeperEqual;
  //   // const shouldUpdate = PureRenderDebug.shouldComponentUpdate.call(this, nextProps, nextState);
  //   console.log('shouldUpdate', isShallowEqual, isDeeperEqual, shouldUpdate);
  //   return shouldUpdate;
  // },

  initBisector: function initBisector(props) {
    var _this = this;

    this.setState({ bisectX: _d3.default.bisector(function (d) {
        return (0, _util.accessor)(_this.props.getValue.x)(d);
      }).left });
  },
  getHovered: function getHovered(x, y) {
    var closestDataIndex = this.state.bisectX(this.props.data, x);
    //console.log(closestDataIndex, this.props.data[closestDataIndex]);
    return this.props.data[closestDataIndex];
  },
  render: function render() {
    var _props = this.props;
    var data = _props.data;
    var getValue = _props.getValue;
    var scale = _props.scale;

    var accessors = _lodash2.default.fromPairs(['x', 'y'].map(function (k) {
      return [k, (0, _util.accessor)((getValue || {})[k])];
    }));
    var points = _lodash2.default.map(data, function (d) {
      return [scale.x(accessors.x(d)), scale.y(accessors.y(d))];
    });
    var pathStr = pointsToPathStr(points);

    return _react2.default.createElement(
      'g',
      { className: this.props.name },
      _react2.default.createElement('path', { d: pathStr })
    );
  }
});

function pointsToPathStr(points) {
  // takes array of points in [[x, y], [x, y]... ] format
  // returns SVG path string in "M X Y L X Y" format
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
  return _lodash2.default.map(points, function (_ref, i) {
    var _ref2 = _slicedToArray(_ref, 2);

    var x = _ref2[0];
    var y = _ref2[1];

    var command = i === 0 ? 'M' : 'L';
    return command + ' ' + x + ' ' + y;
  }).join(' ');
}

var xyKeys = ['domain', 'nice', 'invertAxis', 'tickCount', 'ticks', 'tickLength', 'labelValues', 'labelFormat', 'labelPadding', 'showLabels', 'showGrid', 'showTicks', 'showZero', 'axisLabel', 'axisLabelAlign', 'axisLabelPadding'];
var dirKeys = ['margin', 'padding', 'spacing'];
//
// const LineChartResolved = _.flow([
//   resolveXYScales,
//   _.partial(resolveObjectProps, _, xyKeys, ['x', 'y']),
//   _.partial(resolveObjectProps, _, dirKeys, ['top', 'bottom', 'left', 'right'])
// ])(LineChart);

// export default LineChartResolved;

//export default resolveXYScales(LineChart);

// import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
//
// export default onlyUpdateForKeys(['data', 'getValue'], LineChart);
//
exports.default = LineChart;