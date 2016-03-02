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

var _util = require('../util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PropTypes = _react2.default.PropTypes;


var ScatterPlot = _react2.default.createClass({
    displayName: 'ScatterPlot',

    mixins: [(0, _util.InterfaceMixin)('XYChart')],
    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessor for X & Y coordinates
        getValue: PropTypes.object,
        // allow user to pass an accessor for setting the class of a point
        getClass: _util.AccessorPropType,

        axisType: PropTypes.object,
        scale: PropTypes.object,

        // used with the default point symbol (circle), defines the circle radius
        pointRadius: PropTypes.number,
        // text or SVG node to use as custom point symbol, or function which returns text/SVG
        pointSymbol: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
        // manual x and y offset applied to the point to center it, for custom point symbols which can't be auto-centered
        pointOffset: PropTypes.arrayOf(PropTypes.number),

        onMouseEnterPoint: PropTypes.func,
        onMouseMovePoint: PropTypes.func,
        onMouseLeavePoint: PropTypes.func
    },
    getDefaultProps: function getDefaultProps() {
        return {
            pointRadius: 3,
            pointSymbol: _react2.default.createElement('circle', null),
            pointOffset: [0, 0]
        };
    },


    // todo: return spacing in statics.getOptions

    getHovered: function getHovered() {},
    onMouseEnterPoint: function onMouseEnterPoint(e, d) {
        this.props.onMouseEnterPoint(e, d);
    },
    onMouseMovePoint: function onMouseMovePoint(e, d) {
        this.props.onMouseMovePoint(e, d);
    },
    onMouseLeavePoint: function onMouseLeavePoint(e, d) {
        this.props.onMouseLeavePoint(e, d);
    },
    render: function render() {
        return _react2.default.createElement(
            'g',
            { className: this.props.name },
            this.props.data.map(this.renderPoint)
        );
    },
    renderPoint: function renderPoint(d, i) {
        var _this = this;

        var _map = ['onMouseEnterPoint', 'onMouseMovePoint', 'onMouseLeavePoint'].map(function (eventName) {
            // partially apply this bar's data point as 2nd callback argument
            var callback = (0, _util.methodIfFuncProp)(eventName, _this.props, _this);
            return _lodash2.default.isFunction(callback) ? _lodash2.default.partial(callback, _lodash2.default, d) : null;
        });

        var _map2 = _slicedToArray(_map, 3);

        var onMouseEnter = _map2[0];
        var onMouseMove = _map2[1];
        var onMouseLeave = _map2[2];
        var _props = this.props;
        var scale = _props.scale;
        var getValue = _props.getValue;
        var pointRadius = _props.pointRadius;
        var pointOffset = _props.pointOffset;
        var getClass = _props.getClass;
        var pointSymbol = this.props.pointSymbol;

        var className = 'chart-scatterplot-point ' + (getClass ? (0, _util.accessor)(getClass)(d) : '');
        var symbolProps = { className: className, onMouseEnter: onMouseEnter, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave };

        // resolve symbol-generating functions into real symbols
        if (_lodash2.default.isFunction(pointSymbol)) pointSymbol = pointSymbol(d, i);
        // wrap string/number symbols in <text> container
        if (_lodash2.default.isString(pointSymbol) || _lodash2.default.isNumber(pointSymbol)) pointSymbol = _react2.default.createElement(
            'text',
            null,
            pointSymbol
        );
        // use props.pointRadius for circle radius
        if (pointSymbol.type === 'circle' && _lodash2.default.isUndefined(pointSymbol.props.r)) symbolProps.r = pointRadius;

        // x,y coords of center of symbol
        var cx = scale.x((0, _util.accessor)(getValue.x)(d)) + pointOffset[0];
        var cy = scale.y((0, _util.accessor)(getValue.y)(d)) + pointOffset[1];

        // set positioning attributes based on symbol type
        if (pointSymbol.type === 'circle' || pointSymbol.type === 'ellipse') {
            _lodash2.default.assign(symbolProps, { cx: cx, cy: cy });
        } else if (pointSymbol.type === 'text') {
            _lodash2.default.assign(symbolProps, { x: cx, y: cy, style: { textAnchor: 'middle', dominantBaseline: 'central' } });
        } else {
            _lodash2.default.assign(symbolProps, { x: cx, y: cy, style: { transform: "translate(-50%, -50%)" } });
        }

        return _react2.default.cloneElement(pointSymbol, symbolProps);
    }
});

exports.default = ScatterPlot;