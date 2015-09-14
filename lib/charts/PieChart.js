'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactAddons = require('react/addons');

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d3 = require('d3');

var _d32 = _interopRequireDefault(_d3);

var _utilJs = require('../util.js');

var PropTypes = _reactAddons2['default'].PropTypes;

var DEFAULT_PROPS = {
    getValue: null,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
};

// default height/width, used only if height & width & radius are all undefined
var DEFAULT_SIZE = 150;

var PieChart = _reactAddons2['default'].createClass({
    displayName: 'PieChart',

    propTypes: {
        // array of data to plot with pie chart
        data: PropTypes.array.isRequired,
        // (optional) accessor for getting the values plotted on the pie chart
        // if not provided, just uses the value itself at given index
        getValue: _utilJs.AccessorPropType,
        // (optional) total expected sum of all the pie slice values
        // if provided && slices don't add up to total, an "empty" slice will be rendered for the rest
        // if not provided, will be the sum of all values (ie. all values will always add up to 100%)
        total: PropTypes.number,
        // (optional) height and width of the SVG
        // if only one is passed, same # is used for both (ie. width=100 means height=100 also)
        // if neither is passed, but radius is, radius+margins is used
        // if neither is passed, and radius isn't either, DEFAULTS.size is used
        width: PropTypes.number,
        height: PropTypes.number,
        // (optional) main radius of the pie chart, inferred from margin/width/height if not provided
        radius: PropTypes.number,
        // (optional) margins (between svg edges and pie circle), inferred from radius/width/height if not provided
        // can either be a single number (to make all margins equal), or {top, bottom, left, right} object
        margin: PropTypes.oneOfType(PropTypes.object, PropTypes.number),
        // (optional) radius of the "donut hole" circle drawn on top of the pie chart to turn it into a donut chart
        holeRadius: PropTypes.number,
        // (optional) label text to display in the middle of the pie/donut
        centerLabel: PropTypes.string
    },
    getDefaultProps: function getDefaultProps() {
        return DEFAULT_PROPS;
    },

    render: function render() {
        var margin = _lodash2['default'].isNumber(this.props.margin) ? { top: this.props.margin, bottom: this.props.margin, left: this.props.margin, right: this.props.margin } : _lodash2['default'].defaults({}, this.props.margin, DEFAULT_PROPS.margin);
        // sizes fallback based on provided info: given dimension -> radius + margin -> other dimension -> default
        var width = this.props.width || (this.props.radius ? this.props.radius * 2 + margin.left + margin.right : this.props.height) || DEFAULT_SIZE;
        var height = this.props.height || (this.props.radius ? this.props.radius * 2 + margin.top + margin.bottom : this.props.width) || DEFAULT_SIZE;
        var radius = this.props.radius || Math.min((width - (margin.left + margin.right)) / 2, (height - (margin.top + margin.bottom)) / 2);
        var holeRadius = this.props.holeRadius;

        var center = { x: margin.left + radius, y: margin.top + radius };

        var valueAccessor = (0, _utilJs.accessor)(this.props.getValue);
        var sum = _lodash2['default'].sum(this.props.data, valueAccessor);
        var total = this.props.total || sum;

        var startPercent = 0;
        return _reactAddons2['default'].createElement(
            'svg',
            _extends({ className: 'pie-chart' }, { width: width, height: height }),
            this.props.data.map(function (d, i) {
                var className = 'pie-slice pie-slice-' + i;
                var slicePercent = valueAccessor(d) / total;
                var endPercent = startPercent + slicePercent;
                var pathStr = pieSlicePath(startPercent, endPercent, center, radius, holeRadius);
                startPercent += slicePercent;
                //const path =

                return _reactAddons2['default'].createElement('path', { className: className, d: pathStr });
            }),
            sum < total ? // draw empty slice if the sum of slices is less than expected total
            _reactAddons2['default'].createElement('path', {
                className: 'pie-slice pie-slice-empty',
                d: pieSlicePath(startPercent, 1, center, radius, holeRadius)
            }) : null,
            this.props.centerLabel ? this.renderCenterLabel(center) : null
        );
    },
    renderCenterLabel: function renderCenterLabel(center) {
        var x = center.x;
        var y = center.y;

        var style = { textAnchor: 'middle', dominantBaseline: 'central' };
        return _reactAddons2['default'].createElement(
            'text',
            _extends({ className: 'pie-label-center' }, { x: x, y: y, style: style }),
            this.props.centerLabel
        );
    }
});

function pieSlicePath(startPercent, endPercent, center, radius) {
    var holeRadius = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];

    if (endPercent == 1) endPercent = .9999999; // arc cannot be a full circle
    var startX = Math.sin(2 * Math.PI / (1 / startPercent));
    var startY = Math.cos(2 * Math.PI / (1 / startPercent));
    var endX = Math.sin(2 * Math.PI / (1 / endPercent));
    var endY = Math.cos(2 * Math.PI / (1 / endPercent));
    var largeArc = endPercent - startPercent <= 0.5 ? 0 : 1;
    var c = center;
    var r = radius;
    var rH = holeRadius;
    var x0 = startX;
    var x1 = endX;
    var y0 = startY;
    var y1 = endY;

    return [// construct a string representing the pie slice path
    'M ' + (c.x + x0 * rH) + ',' + (c.y - y0 * rH), // start at edge of inner (hole) circle, or center if no hole
    'L ' + (c.x + x0 * r) + ',' + (c.y - y0 * r), // straight line to outer circle, along radius
    'A ' + r + ',' + r + ' 0 ' + largeArc + ' 1 ' + (c.x + x1 * r) + ',' + (c.y - y1 * r) // outer arc
    ].concat(holeRadius ? [// if we have an inner (donut) hole, draw an inner arc too, otherwise we're done
    'L ' + (c.x + x1 * rH) + ',' + (c.y - y1 * rH), // straight line to inner (hole) circle, along radius
    'A ' + rH + ',' + rH + ' 0 ' + largeArc + ' 0 ' + (c.x + x0 * rH) + ',' + (c.y - y0 * rH) + ' z' // inner arc
    ] : 'z').join(' ');
}

exports['default'] = PieChart;
module.exports = exports['default'];