'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d3 = require('d3');

var _d32 = _interopRequireDefault(_d3);

var _utilJs = require('../util.js');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _numeral = require('numeral');

var _numeral2 = _interopRequireDefault(_numeral);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var PropTypes = _react2['default'].PropTypes;

var DEFAULTS = {
    margin: { top: null, right: null, left: null, bottom: null }
};

var XYPlot = _react2['default'].createClass({
    displayName: 'XYPlot',

    propTypes: {
        // x & y scale types, defaults to 'number'
        xType: PropTypes.oneOf(['number', 'time', 'ordinal']),
        yType: PropTypes.oneOf(['number', 'time', 'ordinal']),

        // scale domains may be provided, otherwise will be inferred from data
        xDomain: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),
        yDomain: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),

        // (outer) width and height of the chart
        // todo infer from data/other props??
        width: PropTypes.number,
        height: PropTypes.number,

        // chart margins
        marginTop: PropTypes.number,
        marginBottom: PropTypes.number,
        marginLeft: PropTypes.number,
        marginRight: PropTypes.number,

        // todo: padding

        // padding between axis value labels and the axis/ticks
        labelPadding: PropTypes.number,
        // size of axis ticks
        tickLength: PropTypes.number,

        // should we draw axis labels
        showXLabels: PropTypes.bool,
        showYLabels: PropTypes.bool,
        // should we draw the grid lines in the main chart space
        showXGrid: PropTypes.bool,
        showYGrid: PropTypes.bool,
        // should we draw the little tick lines along the axis
        showXTicks: PropTypes.bool,
        showYTicks: PropTypes.bool,
        // should we draw a line showing where zero is
        showXZero: PropTypes.bool,
        showYZero: PropTypes.bool,

        xLabelFormat: PropTypes.string,
        yLabelFormat: PropTypes.string,

        // todo: tickLength, labelPadding
        // todo: labelFormat
        // todo: niceX, niceY
        // todo: xAxisLabel, yAxisLabel

        // todo more interaction?
        onMouseMove: PropTypes.func
    },
    getDefaultProps: function getDefaultProps() {
        return {
            xType: 'number',
            yType: 'number',
            xDomain: null,
            yDomain: null,
            width: 400,
            height: 250,
            marginTop: 10,
            marginBottom: 40,
            marginLeft: 60,
            marginRight: 10,
            margin: DEFAULTS.margin,
            labelPadding: 6,
            tickLength: 6,
            showXLabels: true,
            showYLabels: true,
            showXGrid: true,
            showYGrid: true,
            showXTicks: true,
            showYTicks: true,
            showXZero: true,
            showYZero: true,
            xLabelFormat: null,
            yLabelFormat: null,
            onMouseMove: _lodash2['default'].noop
        };
    },
    getInitialState: function getInitialState() {
        return {};
    },

    componentWillMount: function componentWillMount() {
        this.initDomains(this.props);
        this.initLabelFormats(this.props);
        this.initScale(this.props);
    },
    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.initDomains(newProps);
        this.initLabelFormats(this.props);
        this.initScale(newProps);
    },

    initDomains: function initDomains(props) {
        // figure out the domains for each axis (ie. data extents)
        var chartDomains = [];
        // unless both domains are given, ask each child chart for it's desired domain, & flatten them into one domain.
        // this is so that charts can plot their own modified version of the data (ie. a histogram),
        // even if it has a different domain than the original data
        if (!(props.xDomain && props.yDomain)) {
            _react2['default'].Children.forEach(props.children, function (child) {
                // todo handle domain passed in as prop
                var domain = _lodash2['default'].isFunction(child.type.getDomain) ? child.type.getDomain(child.props, props.xType, props.yType) : { x: null, y: null };
                if (_lodash2['default'].isNull(domain.x)) domain.x = defaultDomain(child.props.data, child.props.getX, props.xType);
                if (_lodash2['default'].isNull(domain.y)) domain.y = defaultDomain(child.props.data, child.props.getY, props.yType);
                chartDomains.push(domain);
            });
        }
        var xDomains = props.xDomain || _lodash2['default'].pluck(chartDomains, 'x');
        var yDomains = props.yDomain || _lodash2['default'].pluck(chartDomains, 'y');
        _lodash2['default'].assign(this, { xDomains: xDomains, yDomains: yDomains });
    },
    initLabelFormats: function initLabelFormats(props) {
        var _this = this;

        ['x', 'y'].forEach(function (letter) {
            var formatKey = letter + 'LabelFormat';
            var axisType = props[letter + 'Type'];

            // use given format if provided
            if (!_lodash2['default'].isNull(props[formatKey])) _this[formatKey] = props[formatKey];
            // otherwise determine appropriate format for axis type
            else if (axisType == 'number') {
                    _this[formatKey] = '0.[000000]a';
                } else if (axisType === 'time') {
                    // todo determine most appropriate date format for this domain
                    //const domains = this[`${letter}Domains`];
                    //const domain = defaultDomain(_.flatten(domains), null, axisType);
                    _this[formatKey] = 'MM-DD';
                }
        });
    },

    initScale: function initScale(props) {
        var _this2 = this;

        // create the X and Y scales shared by charts
        // calculate the inner width and height based on margins
        // todo get padding too
        var width = props.width;
        var height = props.height;
        var xType = props.xType;
        var yType = props.yType;
        var labelPadding = props.labelPadding;
        var tickLength = props.tickLength;
        var showXTicks = props.showXTicks;
        var showYTicks = props.showYTicks;
        var xLabelFormat = this.xLabelFormat;
        var yLabelFormat = this.yLabelFormat;

        this.margin = _lodash2['default'].defaults(this.props.margin, DEFAULTS.margin);

        var shouldMeasureLabels = _lodash2['default'].any(this.margin, _lodash2['default'].isNull);
        if (shouldMeasureLabels) {
            (function () {
                var isDone = false;
                // start with a margin of 10 pixels for all unknown margins
                var margin = _lodash2['default'].transform(_this2.margin, function (result, m, key) {
                    return result[key] = _lodash2['default'].isNull(m) ? 10 : m;
                });
                // make scales using margin, measure labels, make new margins
                // repeat until we converge on a margin that works
                var innerWidth = undefined,
                    innerHeight = undefined,
                    xScale = undefined,
                    yScale = undefined;

                var _loop = function () {
                    innerWidth = width - (margin.left + margin.right);
                    innerHeight = height - (margin.top + margin.bottom);
                    xScale = makeScale(_this2.xDomains, [0, innerWidth], xType);
                    yScale = makeScale(_this2.yDomains, [innerHeight, 0], yType);
                    var xTicks = xType === 'ordinal' ? xScale.domain() : xScale.ticks();
                    var yTicks = yType === 'ordinal' ? yScale.domain() : yScale.ticks();
                    if (xType !== 'ordinal') xScale.nice(xTicks.length);
                    if (yType !== 'ordinal') yScale.nice(yTicks.length);
                    var labelBoxes = measureAxisLabels(xTicks, yTicks, xType, yType, xLabelFormat, yLabelFormat);
                    //console.log(xTicks, yTicks);
                    //console.log(labelBoxes);
                    var newMargin = {
                        top: Math.ceil(_lodash2['default'].last(labelBoxes.y).height / 2),
                        right: Math.ceil(_lodash2['default'].last(labelBoxes.x).width / 2),
                        left: Math.ceil(_d32['default'].max(labelBoxes.y, (0, _utilJs.accessor)('width')) + labelPadding + (showYTicks ? tickLength : 0)),
                        bottom: Math.ceil(_d32['default'].max(labelBoxes.x, (0, _utilJs.accessor)('height')) + labelPadding + (showXTicks ? tickLength : 0))
                    };
                    isDone = _lodash2['default'].all(_lodash2['default'].keys(margin), function (k) {
                        return margin[k] === newMargin[k];
                    });
                    //console.log('calculated margin', newMargin);
                    //console.log(xScale.domain(), yScale.domain());
                    margin = newMargin;
                };

                while (!isDone) {
                    _loop();
                }
                _lodash2['default'].assign(_this2, { margin: margin, innerWidth: innerWidth, innerHeight: innerHeight, xScale: xScale, yScale: yScale });
            })();
        } else {
            // margins are all pre-defined, just make the scales
            var _innerWidth = width - (props.margin.left + props.margin.right);
            var _innerHeight = height - (props.margin.top + props.margin.bottom);
            var xScale = makeScale(this.xDomains, [0, _innerWidth], xType);
            var yScale = makeScale(this.yDomains, [_innerHeight, 0], yType);
            _lodash2['default'].assign(this, { innerWidth: _innerWidth, innerHeight: _innerHeight, xScale: xScale, yScale: yScale });
        }
    },

    onMouseMove: function onMouseMove(e) {
        //if(!this.props.onMouseMove && !this.state.isSelecting) return;
        var chartBB = e.currentTarget.getBoundingClientRect();
        var chartX = e.clientX - chartBB.left - this.props.marginLeft;
        // todo alternative to invert for ordinal scales
        var chartXVal = this.xScale.invert(chartX);

        var chart = this.refs['chart-series-0'];
        var hovered = _lodash2['default'].isFunction(chart.getHovered) ? chart.getHovered(chartXVal) : null;

        this.props.onMouseMove(hovered, e);
    },

    render: function render() {
        var _props = this.props;
        var width = _props.width;
        var height = _props.height;
        var xType = _props.xType;
        var yType = _props.yType;
        var margin = this.margin;
        var xScale = this.xScale;
        var yScale = this.yScale;
        var innerWidth = this.innerWidth;
        var innerHeight = this.innerHeight;

        return _react2['default'].createElement(
            'svg',
            _extends({ className: 'xy-plot' }, { width: width, height: height }, {
                onMouseMove: this.onMouseMove
            }),
            _react2['default'].createElement(
                'g',
                { className: 'chart-inner',
                    transform: 'translate(' + margin.left + ', ' + margin.top + ')'
                },
                this.renderXAxis(),
                this.renderYAxis(),
                _react2['default'].Children.map(this.props.children, function (child, i) {
                    var name = child.props.name || 'chart-series-' + i;
                    return _react2['default'].cloneElement(child, { ref: name, name: name, xType: xType, yType: yType, xScale: xScale, yScale: yScale, innerWidth: innerWidth, innerHeight: innerHeight });
                })
            )
        );
    },

    renderXAxis: function renderXAxis() {
        return this.renderAxis({
            letter: 'x',
            orientation: 'horizontal',
            axisTransform: 'translate(0, ' + this.innerHeight + ')'
        });
    },
    renderYAxis: function renderYAxis() {
        return this.renderAxis({
            letter: 'y',
            orientation: 'vertical'
        });
    },
    renderAxis: function renderAxis(options) {
        var _this3 = this;

        var letter = options.letter;
        var orientation = options.orientation;
        var axisTransform = options.axisTransform;

        var upperLetter = letter.toUpperCase();
        var showLabels = this.props['show' + upperLetter + 'Labels'];
        var showTicks = this.props['show' + upperLetter + 'Ticks'];
        var showGrid = this.props['show' + upperLetter + 'Grid'];
        if (!(showLabels || showTicks || showGrid)) return null;

        var _props2 = this.props;
        var labelPadding = _props2.labelPadding;
        var tickLength = _props2.tickLength;

        var scale = this[letter + 'Scale'];
        var type = this.props[letter + 'Type'];
        var ticks = type === 'ordinal' ? scale.domain() : scale.ticks();
        var tickTransform = function tickTransform(value) {
            return orientation === 'vertical' ? 'translate(0, ' + scale(value) + ')' : 'translate(' + scale(value) + ', 0)';
        };
        var distance = showTicks ? tickLength + labelPadding : labelPadding;
        var labelOffset = orientation === 'vertical' ? { x: -distance } : { y: distance };
        var gridLength = orientation === 'vertical' ? this.innerWidth : this.innerHeight;

        return _react2['default'].createElement(
            'g',
            { ref: letter + 'Axis', className: 'chart-axis chart-axis-' + letter, transform: axisTransform },
            _lodash2['default'].map(ticks, function (value) {
                var tickOptions = { value: value, letter: letter, type: type, orientation: orientation, labelOffset: labelOffset, gridLength: gridLength, tickLength: tickLength };
                return _react2['default'].createElement(
                    'g',
                    { transform: tickTransform(value) },
                    showLabels ? _this3.renderLabel(tickOptions) : null,
                    showGrid ? _this3.renderGrid(tickOptions) : null,
                    showTicks ? _this3.renderTick(tickOptions) : null
                );
            })
        );
    },
    renderLabel: function renderLabel(options) {
        var letter = options.letter;
        var value = options.value;
        var type = options.type;
        var labelOffset = options.labelOffset;

        var className = 'chart-axis-label chart-axis-label-' + letter;
        var format = this[letter + 'LabelFormat'];
        // todo generalize dy for all text sizes...?
        return _react2['default'].createElement(
            'text',
            _extends({ className: className }, { dy: '0.32em' }, labelOffset),
            formatAxisLabel(value, type, format)
        );
    },
    renderTick: function renderTick(options) {
        var letter = options.letter;
        var tickLength = options.tickLength;
        var orientation = options.orientation;

        var className = 'chart-tick chart-tick-' + letter;

        var _ref = orientation === 'vertical' ? [-tickLength, 0] : [0, tickLength];

        var _ref2 = _slicedToArray(_ref, 2);

        var x2 = _ref2[0];
        var y2 = _ref2[1];

        return _react2['default'].createElement('line', { className: className, x2: x2, y2: y2 });
    },
    renderGrid: function renderGrid(options) {
        var letter = options.letter;
        var gridLength = options.gridLength;
        var orientation = options.orientation;

        var className = 'chart-grid chart-grid-' + letter;

        var _ref3 = orientation === 'vertical' ? [gridLength, 0] : [0, -gridLength];

        var _ref32 = _slicedToArray(_ref3, 2);

        var x2 = _ref32[0];
        var y2 = _ref32[1];

        return _react2['default'].createElement('line', { className: className, x2: x2, y2: y2 });
    }
});

function isNullOrUndefined(d) {
    return _lodash2['default'].isNull(d) || _lodash2['default'].isUndefined(d);
}

function makeScale(domains, range, axisType) {
    var domain = defaultDomain(_lodash2['default'].flatten(domains), null, axisType);
    var scale = initScale(axisType).domain(domain);
    axisType === 'ordinal' ? scale.rangePoints(range) : scale.range(range);
    return scale;
}

function defaultDomain(data, getter, scaleType) {
    switch (scaleType) {
        // extent for number & time scales, coerce dates to numbers
        case 'number':
        case 'time':
            return _d32['default'].extent(data, function (d) {
                return +(0, _utilJs.accessor)(getter)(d);
            });
        // all unique values for ordinal scale
        case 'ordinal':
            return _lodash2['default'].uniq(data.map((0, _utilJs.accessor)(getter)));
    }
    return [];
}

function initScale(type) {
    switch (type) {
        case 'number':
            return _d32['default'].scale.linear().nice();
        case 'ordinal':
            return _d32['default'].scale.ordinal();
        case 'time':
            return _d32['default'].time.scale().nice();
    }
}

function formatAxisLabel(value, type, format) {
    return type === 'number' ? (0, _numeral2['default'])(value).format(format) : type === 'time' ? (0, _moment2['default'])(value).format(format) : value;
}

function measureAxisLabels(xLabels, yLabels, xType, yType, xFormat, yFormat) {
    var xLabelEls = xLabels.map(function (l) {
        return '<text class=\'chart-axis-label chart-axis-label-x\'>' + formatAxisLabel(l, xType, xFormat) + '</text>';
    });
    var yLabelEls = yLabels.map(function (l) {
        return '<text class=\'chart-axis-label chart-axis-label-y\'>' + formatAxisLabel(l, yType, yFormat) + '</text>';
    });
    // todo don't use jquery
    var $testSvg = (0, _jquery2['default'])('<svg class="xy-plot">        <g class="chart-inner">            <g class="chart-axis chart-axis-x">' + xLabelEls.join('') + '</g>            <g class="chart-axis chart-axis-y">' + yLabelEls.join('') + '</g>        </g>    </svg>').css({ visibility: 'hidden' });
    (0, _jquery2['default'])('body').append($testSvg);
    var xLabelBoxes = _lodash2['default'].map($testSvg.find('.chart-axis-label-x'), function (el) {
        return el.getBoundingClientRect();
    });
    var yLabelBoxes = _lodash2['default'].map($testSvg.find('.chart-axis-label-y'), function (el) {
        return el.getBoundingClientRect();
    });
    $testSvg.remove();
    return { x: xLabelBoxes, y: yLabelBoxes };
}

exports['default'] = XYPlot;
module.exports = exports['default'];