'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d3 = require('d3');

var _d32 = _interopRequireDefault(_d3);

var _utilJs = require('../util.js');

var PropTypes = _react2['default'].PropTypes;

var ScatterPlot = _react2['default'].createClass({
    displayName: 'ScatterPlot',

    mixins: [(0, _utilJs.InterfaceMixin)('XYChart')],
    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessor for X & Y coordinates
        getX: _utilJs.AccessorPropType,
        getY: _utilJs.AccessorPropType,
        // allow user to pass an accessor for setting the class of a point
        getClass: _utilJs.AccessorPropType,

        xScale: PropTypes.func,
        yScale: PropTypes.func,

        // used with the default point symbol (circle), defines the circle radius
        pointRadius: PropTypes.number,
        // text or SVG node to use as custom point symbol, or function which returns text/SVG
        pointSymbol: PropTypes.oneOfType(PropTypes.node, PropTypes.func),
        // manual x and y offset applied to the point to center it, for custom point symbols which can't be auto-centered
        pointOffset: PropTypes.arrayOf(PropTypes.number)
    },
    getDefaultProps: function getDefaultProps() {
        return {
            pointRadius: 3,
            pointSymbol: _react2['default'].createElement('circle', null),
            pointOffset: [0, 0]
        };
    },

    // todo: return spacing in statics.getOptions

    getHovered: function getHovered() {},

    render: function render() {
        return _react2['default'].createElement(
            'g',
            null,
            this.props.data.map(this.renderPoint)
        );
    },
    renderPoint: function renderPoint(d, i) {
        var _props = this.props;
        var xScale = _props.xScale;
        var yScale = _props.yScale;
        var getX = _props.getX;
        var getY = _props.getY;
        var pointRadius = _props.pointRadius;
        var pointOffset = _props.pointOffset;
        var getClass = _props.getClass;
        var pointSymbol = this.props.pointSymbol;

        var className = 'chart-scatterplot-point ' + (getClass ? (0, _utilJs.accessor)(getClass)(d) : '');
        var symbolProps = { className: className };

        // resolve symbol-generating functions into real symbols
        if (_lodash2['default'].isFunction(pointSymbol)) pointSymbol = pointSymbol(d, i);
        // wrap string/number symbols in <text> container
        if (_lodash2['default'].isString(pointSymbol) || _lodash2['default'].isNumber(pointSymbol)) pointSymbol = _react2['default'].createElement(
            'text',
            null,
            pointSymbol
        );
        // use props.pointRadius for circle radius
        if (pointSymbol.type === 'circle' && _lodash2['default'].isUndefined(pointSymbol.props.r)) symbolProps.r = pointRadius;

        // x,y coords of center of symbol
        var cx = xScale((0, _utilJs.accessor)(getX)(d)) + pointOffset[0];
        var cy = yScale((0, _utilJs.accessor)(getY)(d)) + pointOffset[1];

        // set positioning attributes based on symbol type
        if (pointSymbol.type === 'circle' || pointSymbol.type === 'ellipse') {
            _lodash2['default'].assign(symbolProps, { cx: cx, cy: cy });
        } else if (pointSymbol.type === 'text') {
            _lodash2['default'].assign(symbolProps, { x: cx, y: cy, style: { textAnchor: 'middle', dominantBaseline: 'central' } });
        } else {
            _lodash2['default'].assign(symbolProps, { x: cx, y: cy, style: { transform: "translate(-50%, -50%)" } });
        }

        return _react2['default'].cloneElement(pointSymbol, symbolProps);
    }
});

exports['default'] = ScatterPlot;
module.exports = exports['default'];