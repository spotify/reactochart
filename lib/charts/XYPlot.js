'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

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
    margin: { top: null, bottom: null, left: null, right: null },
    spacing: { top: 0, bottom: 0, left: 0, right: 0 },
    xAxisLabelAlign: { horizontal: 'left', vertical: 'top' },
    yAxisLabelAlign: { horizontal: 'right', vertical: 'top' }
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

        // approximate # of ticks to include on each axis (actual # may be slightly different, to get nicest intervals)
        xTickCount: PropTypes.number,
        yTickCount: PropTypes.number,

        // (outer) width and height of the chart
        // todo infer from data/other props??
        width: PropTypes.number,
        height: PropTypes.number,

        // chart margins
        margin: PropTypes.shape({
            top: PropTypes.number,
            bottom: PropTypes.number,
            left: PropTypes.number,
            right: PropTypes.number
        }),

        // whether or not to extend the scales to end on nice values (see docs for d3 scale.linear.nice())
        niceX: PropTypes.bool,
        niceY: PropTypes.bool,

        // todo: ability to pass in array of ticks
        // todo: minMargin - margin will be at least X, or more if necessary
        // todo: extraMargin
        // todo: padding, minPadding, extraPadding
        // todo: spacing, minSpacing, extraSpacing ???
        // todo: niceX, niceY
        // todo: xAxisLabel, yAxisLabel

        // format to use for the axis value labels
        // interpreted as momentjs formats for time axes, or numeraljs formats for number axes
        xLabelFormat: PropTypes.string,
        yLabelFormat: PropTypes.string,

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

        xAxisLabel: PropTypes.string,
        xAxisLabelAlign: PropTypes.shape({
            horizontal: PropTypes.oneOf(['left', 'center', 'right']),
            vertical: PropTypes.oneOf(['top', 'bottom'])
        }),
        xAxisLabelPadding: PropTypes.number,

        yAxisLabel: PropTypes.string,
        yAxisLabelAlign: PropTypes.shape({
            horizontal: PropTypes.oneOf(['left', 'center', 'right']),
            vertical: PropTypes.oneOf(['top', 'bottom'])
        }),
        yAxisLabelPadding: PropTypes.number,

        // todo more interaction?
        onMouseMove: PropTypes.func
    },
    getDefaultProps: function getDefaultProps() {
        return {
            xType: 'number',
            yType: 'number',
            xDomain: null,
            yDomain: null,
            xTickCount: 10,
            yTickCount: 10,
            width: 400,
            height: 250,
            margin: DEFAULTS.margin,
            niceX: true,
            niceY: true,
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
            xAxisLabel: null,
            xAxisLabelAlign: DEFAULTS.xAxisLabelAlign,
            xAxisLabelPadding: 10,
            yAxisLabel: null,
            yAxisLabelAlign: DEFAULTS.yAxisLabelAlign,
            yAxisLabelPadding: 10,
            onMouseMove: _lodash2['default'].noop
        };
    },
    getInitialState: function getInitialState() {
        return {};
    },

    componentWillMount: function componentWillMount() {
        this.initLabelFormats(this.props);
        this.initDomains(this.props);
        this.initScale(this.props);
    },
    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.initLabelFormats(newProps);
        this.initDomains(newProps);
        this.initScale(newProps);
    },

    initDomains: function initDomains(props) {
        var _props = this.props;

        // figure out the domains for each axis (ie. data extents)
        var xType = _props.xType;
        var yType = _props.yType;
        var allChartOptions = [];
        // unless both domains are given, ask each child chart for it's desired domain, & flatten them into one domain.
        // this is so that charts can plot their own modified version of the data (ie. a histogram),
        // even if it has a different domain than the original data
        //if(!(props.xDomain && props.yDomain)) {
        _react2['default'].Children.forEach(props.children, function (child) {
            if (!child) return;
            var childProps = _lodash2['default'].assign({}, { xType: xType, yType: yType }, child.props);
            // todo handle children which aren't chart components? render with same props?

            // todo handle domain passed in as prop

            var _ref = _lodash2['default'].isFunction(child.type.getOptions) ? child.type.getOptions(childProps) : { xDomain: null, yDomain: null, spacing: null };

            var xDomain = _ref.xDomain;
            var yDomain = _ref.yDomain;
            var spacing = _ref.spacing;

            if (_lodash2['default'].isNull(xDomain)) xDomain = defaultDomain(child.props.data, child.props.getX, xType);
            if (_lodash2['default'].isNull(yDomain)) yDomain = defaultDomain(child.props.data, child.props.getY, yType);
            spacing = _lodash2['default'].isNull(spacing) ? _lodash2['default'].clone(DEFAULTS.spacing) : _lodash2['default'].defaults({}, spacing, DEFAULTS.spacing);

            allChartOptions.push({ xDomain: xDomain, yDomain: yDomain, spacing: spacing });
        });
        //}
        var xDomains = props.xDomain || _lodash2['default'].pluck(allChartOptions, 'xDomain');
        var yDomains = props.yDomain || _lodash2['default'].pluck(allChartOptions, 'yDomain');
        var spacings = props.spacing || _lodash2['default'].pluck(allChartOptions, 'spacing');
        _lodash2['default'].assign(this, { xDomains: xDomains, yDomains: yDomains, spacings: spacings });
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
        var xTickCount = props.xTickCount;
        var yTickCount = props.yTickCount;
        var niceX = props.niceX;
        var niceY = props.niceY;
        var xAxisLabel = props.xAxisLabel;
        var xAxisLabelPadding = props.xAxisLabelPadding;
        var yAxisLabel = props.yAxisLabel;
        var yAxisLabelPadding = props.yAxisLabelPadding;
        var labelPadding = props.labelPadding;
        var tickLength = props.tickLength;
        var showXTicks = props.showXTicks;
        var showYTicks = props.showYTicks;
        var spacings = this.spacings;
        var xLabelFormat = this.xLabelFormat;
        var yLabelFormat = this.yLabelFormat;

        var origMargin = _lodash2['default'].defaults({}, this.props.margin, DEFAULTS.margin);

        var shouldMeasureLabels = _lodash2['default'].any(origMargin, _lodash2['default'].isNull);
        if (shouldMeasureLabels) {
            (function () {
                var isDone = false;
                // start with a margin of 10 pixels for all unknown margins
                var margin = _lodash2['default'].transform(origMargin, function (result, m, key) {
                    return result[key] = _lodash2['default'].isNull(m) ? 10 : m;
                });
                // and padding equal to the first chart's spacing
                var padding = _lodash2['default'].clone(spacings[0]);
                // make scales using margin, measure labels, make new margins
                // repeat until we converge on a margin that works
                var xScale = undefined,
                    yScale = undefined,
                    scaleWidth = undefined,
                    scaleHeight = undefined,
                    chartWidth = undefined,
                    chartHeight = undefined,
                    labelBoxes = undefined;
                var i = 0,
                    limit = 5; // ensure we dont loop forever

                var _loop = function () {
                    i++;
                    scaleWidth = width - (margin.left + margin.right + padding.left + padding.right);
                    scaleHeight = height - (margin.top + margin.bottom + padding.top + padding.bottom);
                    xScale = makeScale(_this2.xDomains, [padding.left, scaleWidth + padding.left], xType);
                    yScale = makeScale(_this2.yDomains, [scaleHeight + padding.top, padding.top], yType);
                    // todo cleanup ticks... doing more than i need to here...
                    var xTicks = xType === 'ordinal' ? xScale.domain() : xScale.ticks(xTickCount);
                    var yTicks = yType === 'ordinal' ? yScale.domain() : yScale.ticks(yTickCount);
                    if (niceX && xType !== 'ordinal') xTicks = xScale.nice(xTicks.length);
                    if (niceY && yType !== 'ordinal') yTicks = yScale.nice(yTicks.length).ticks();

                    labelBoxes = measureAxisLabels(_this2.getXAxisProps({ scaleWidth: scaleWidth, scaleHeight: scaleHeight, scale: xScale }), _this2.getYAxisProps({ scaleWidth: scaleWidth, scaleHeight: scaleHeight, scale: yScale }), xAxisLabel ? _this2.getXAxisLabelProps({ margin: margin }) : null, yAxisLabel ? _this2.getYAxisLabelProps({ margin: margin }) : null);

                    // calculate padding based on spacings and domains
                    // spacing is the amount of outer space ('margin') required by the outermost elements of each chart,
                    // so that they still fit within the chart boundaries, defined by chartWidth and chartHeight.
                    // padding is the actual amount of extra space required, after taking into account the scales.
                    // if the outermost chart elements are on the scale extrema, padding = spacing,
                    // but the scale may extend beyond the last element anyway, so we may not need the extra padding.
                    // todo: temporarily set as padding = max spacing, implement this for real
                    padding = _lodash2['default'].reduce(spacings, function (result, spacing) {
                        return _lodash2['default'].transform(spacing, function (max, space, dir) {
                            return max[dir] = Math.max(result[dir] || space);
                        });
                    }, {});

                    // todo: modify to handle all possible label alignments
                    // todo: handle case of labels not shown (ie if !this.props.showYLabels)
                    var hasXAxisLabel = xAxisLabel && labelBoxes.xAxis;
                    var hasYAxisLabel = yAxisLabel && labelBoxes.yAxis;
                    var hasXValLabels = !!labelBoxes.xVal.length;
                    var hasYValLabels = !!labelBoxes.yVal.length;

                    var xRange = xScale.range();

                    // find # of pixels by which the top- and bottom-most y axis labels overhang the top/bottom chart edges
                    var yRange = yScale.range();

                    var topYTick = _lodash2['default'].min(yTicks, yScale);

                    var bottomYTick = _lodash2['default'].max(yTicks, yScale);

                    var topYTickFromTop = Math.abs(yScale(topYTick) - _lodash2['default'].min(yRange));
                    var bottomYTickFromBottom = Math.abs(yScale(bottomYTick) - _lodash2['default'].max(yRange));

                    var _ref2 = hasYValLabels ? [_lodash2['default'].min(labelBoxes.yVal, (0, _utilJs.accessor)('top')), _lodash2['default'].max(labelBoxes.yVal, (0, _utilJs.accessor)('top'))] : [null, null];

                    var _ref22 = _slicedToArray(_ref2, 2);

                    var topYValBox = _ref22[0];
                    var bottomYValBox = _ref22[1];

                    var _ref3 = hasYValLabels ? [Math.ceil(Math.max(0.5 * topYValBox.height - (topYTickFromTop + padding.top), 0)), Math.ceil(Math.max(0.5 * bottomYValBox.height - (bottomYTickFromBottom + padding.bottom), 0))] : [0, 0];

                    // find # of pixels by which the left- and right-most x axis labels overhang the left/right chart edges
                    // todo: do the rest of this
                    //const [leftXTick, rightXTick] = [_.min(xTicks, yScale), _.max(yTicks, yScale)];

                    // todo: modify to handle padding!!
                    //
                    //const topYValOverhang = hasYValLabels ? Math.ceil(_.last(labelBoxes.yVal).height / 2) : 0;

                    var _ref32 = _slicedToArray(_ref3, 2);

                    var topYValOverhang = _ref32[0];
                    var bottomYValOverhang = _ref32[1];
                    var xAxisLabelOuterHeight = hasXAxisLabel ? Math.ceil(labelBoxes.xAxis.height + xAxisLabelPadding) : 0;
                    var yAxisLabelOuterHeight = hasYAxisLabel ? Math.ceil(labelBoxes.yAxis.height + yAxisLabelPadding) : 0;

                    var topMargin = _lodash2['default'].isNull(origMargin.top) ? Math.max(topYValOverhang, xAxisLabelOuterHeight, yAxisLabelOuterHeight) : origMargin.top;

                    var yTickAndPadSpace = (hasYValLabels || hasYAxisLabel ? labelPadding : 0) + (showYTicks ? tickLength : 0);

                    var maxYValWidth = (hasYValLabels ? Math.ceil(_d32['default'].max(labelBoxes.yVal, (0, _utilJs.accessor)('width'))) : 0) + yTickAndPadSpace;
                    var yAxisLabelOuterWidth = hasYAxisLabel ? Math.ceil(labelBoxes.yAxis.width) + yTickAndPadSpace : 0;
                    //console.log(maxYValWidth, yAxisLabelOuterWidth);

                    var leftMargin = _lodash2['default'].isNull(origMargin.left) ? Math.max(maxYValWidth, yAxisLabelOuterWidth) : origMargin.left;

                    var xTickAndPadSpace = (hasXValLabels || hasXAxisLabel ? labelPadding : 0) + (showXTicks ? tickLength : 0);

                    var rightXValOverhang = hasXValLabels ? Math.ceil(_lodash2['default'].last(labelBoxes.xVal).width / 2) : 0;

                    var maxXValHeight = (hasXValLabels ? Math.ceil(_d32['default'].max(labelBoxes.xVal, (0, _utilJs.accessor)('height'))) : 0) + xTickAndPadSpace;

                    var requiredMargin = {
                        top: topMargin,
                        bottom: maxXValHeight,
                        left: leftMargin,
                        right: rightXValOverhang
                    };

                    var newMargin = (0, _lodash2['default'])(requiredMargin).map(function (v, k) {
                        return [k, _lodash2['default'].isNull(origMargin[k]) ? v : origMargin[k]];
                    }).object().value();

                    //let newMargin = {
                    //    top: topMargin,
                    //    right: _.isNull(origMargin.right) ?
                    //        rightXValOverhang : origMargin.right,
                    //    left: leftMargin,
                    //    bottom: _.isNull(origMargin.bottom) ?
                    //        maxXValHeight : origMargin.bottom
                    //};
                    isDone = _lodash2['default'].all(_lodash2['default'].keys(margin), function (k) {
                        return margin[k] === newMargin[k];
                    });
                    //console.log('calculated margin', newMargin);
                    //console.log(xScale.domain(), yScale.domain());
                    margin = newMargin;
                    scaleWidth = width - (margin.left + margin.right + padding.left + padding.right);
                    scaleHeight = height - (margin.top + margin.bottom + padding.top + padding.bottom);
                };

                while (!isDone && i < limit) {
                    _loop();
                }
                //console.log('padding', padding);
                //console.log({scaleWidth, scaleHeight});
                _lodash2['default'].assign(_this2, { margin: margin, padding: padding, scaleWidth: scaleWidth, scaleHeight: scaleHeight, xScale: xScale, yScale: yScale, labelBoxes: labelBoxes });
            })();
        } else {
            // margins are all pre-defined, just make the scales
            var scaleWidth = width - (props.margin.left + props.margin.right);
            var scaleHeight = height - (props.margin.top + props.margin.bottom);
            var xScale = makeScale(this.xDomains, [0, scaleWidth], xType);
            var yScale = makeScale(this.yDomains, [scaleHeight, 0], yType);
            _lodash2['default'].assign(this, { margin: props.margin, scaleWidth: scaleWidth, scaleHeight: scaleHeight, xScale: xScale, yScale: yScale });
        }
    },

    onMouseMove: function onMouseMove(e) {
        //if(!this.props.onMouseMove && !this.state.isSelecting) return;
        var chartBB = e.currentTarget.getBoundingClientRect();
        var chartX = e.clientX - chartBB.left - this.margin.left;
        // todo alternative to invert for ordinal scales
        var chartXVal = this.xScale.invert(chartX);

        var chart = this.refs['chart-series-0'];
        var hovered = _lodash2['default'].isFunction(chart.getHovered) ? chart.getHovered(chartXVal) : null;

        this.props.onMouseMove(hovered, e);
    },

    render: function render() {
        var _props2 = this.props;
        var width = _props2.width;
        var height = _props2.height;
        var xType = _props2.xType;
        var yType = _props2.yType;
        var xAxisLabel = _props2.xAxisLabel;
        var yAxisLabel = _props2.yAxisLabel;
        var margin = this.margin;
        var padding = this.padding;
        var xScale = this.xScale;
        var yScale = this.yScale;
        var scaleWidth = this.scaleWidth;
        var scaleHeight = this.scaleHeight;

        var chartWidth = scaleWidth + padding.left + padding.right;
        var chartHeight = scaleHeight + padding.top + padding.bottom;
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
                _react2['default'].createElement('rect', { className: 'chart-background', width: chartWidth, height: chartHeight }),
                _react2['default'].createElement(ChartAxis, this.getXAxisProps()),
                _react2['default'].createElement(ChartAxis, this.getYAxisProps()),
                _react2['default'].Children.map(this.props.children, function (child, i) {
                    if (!child) return null;
                    var name = child.props.name || 'chart-series-' + i;
                    return _react2['default'].cloneElement(child, { ref: name, name: name, xType: xType, yType: yType, xScale: xScale, yScale: yScale, scaleWidth: scaleWidth, scaleHeight: scaleHeight });
                })
            ),
            xAxisLabel ? _react2['default'].createElement(XAxisLabel, this.getXAxisLabelProps()) : null,
            yAxisLabel ? _react2['default'].createElement(YAxisLabel, this.getYAxisLabelProps()) : null
        );
    },

    getXAxisProps: function getXAxisProps() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var scaleHeight = options.scaleHeight || this.scaleHeight;
        var padding = options.padding || this.padding || {};
        return this.getAxisProps(_lodash2['default'].assign({
            letter: 'x',
            orientation: 'horizontal',
            axisTransform: 'translate(0, ' + (scaleHeight + (padding.top || 0) + (padding.bottom || 0)) + ')'
        }, options));
    },
    getYAxisProps: function getYAxisProps() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return this.getAxisProps(_lodash2['default'].assign({
            letter: 'y',
            orientation: 'vertical'
        }, options));
    },
    getAxisProps: function getAxisProps(options) {
        var letter = options.letter;
        var orientation = options.orientation;
        var axisTransform = options.axisTransform;

        var upperLetter = letter.toUpperCase();

        return {
            letter: letter, orientation: orientation, axisTransform: axisTransform,
            labelPadding: options.labelPadding || this.props.labelPadding,
            tickLength: options.tickLength || this.props.tickLength,
            scaleWidth: options.scaleWidth || this.scaleWidth,
            scaleHeight: options.scaleWidth || this.scaleHeight,
            padding: options.padding || this.padding,
            scale: options.scale || this[letter + 'Scale'],
            type: options.type || this.props[letter + 'Type'],
            tickCount: options.tickCount || this.props[letter + 'TickCount'],
            labelFormat: options.labelFormat || this[letter + 'LabelFormat'],
            showLabels: options.showLabels || this.props['show' + upperLetter + 'Labels'],
            showTicks: options.showTicks || this.props['show' + upperLetter + 'Ticks'],
            showGrid: options.showGrid || this.props['show' + upperLetter + 'Grid']
        };
    },

    getXAxisLabelProps: function getXAxisLabelProps() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var labelBoxes = this.labelBoxes;

        return _lodash2['default'].defaults(options, {
            label: this.props.xAxisLabel,
            margin: this.margin,
            scaleWidth: this.scaleWidth,
            scaleHeight: this.scaleHeight,
            alignment: this.props.xAxisLabelAlign,
            axisLabelPadding: this.props.xAxisLabelPadding,
            valueLabelPadding: this.props.labelPadding,
            tickLength: this.props.tickLength,
            showTicks: this.props.showXTicks,
            labelBox: labelBoxes && labelBoxes.xAxis ? labelBoxes.xAxis : { width: 10, height: 10 }
        });
    },
    getYAxisLabelProps: function getYAxisLabelProps() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var labelBoxes = this.labelBoxes;

        return _lodash2['default'].defaults(options, {
            label: this.props.yAxisLabel,
            margin: this.margin,
            scaleWidth: this.scaleWidth,
            scaleHeight: this.scaleHeight,
            alignment: this.props.yAxisLabelAlign,
            axisLabelPadding: this.props.yAxisLabelPadding,
            valueLabelPadding: this.props.labelPadding,
            tickLength: this.props.tickLength,
            showTicks: this.props.showYTicks,
            labelBox: labelBoxes && labelBoxes.yAxis ? labelBoxes.yAxis : { width: 10, height: 10 }
        });
    }
});

var XAxisLabel = _react2['default'].createClass({
    displayName: 'XAxisLabel',

    propTypes: {
        label: PropTypes.string,
        //letter: PropTypes.string,
        margin: PropTypes.object,
        scaleWidth: PropTypes.number,
        scaleHeight: PropTypes.number,
        alignment: PropTypes.shape({
            horizontal: PropTypes.oneOf(['left', 'center', 'right']),
            vertical: PropTypes.oneOf(['top', 'bottom'])
        }),
        axisLabelPadding: PropTypes.number,
        valueLabelPadding: PropTypes.number,
        tickLength: PropTypes.number,
        // bounding box of the label
        labelBox: PropTypes.object
    },
    getDefaultProps: function getDefaultProps() {
        return {
            labelBox: { height: 10, width: 10 },
            scaleWidth: 0
        };
    },
    render: function render() {
        var _props3 = this.props;
        var label = _props3.label;
        var labelBox = _props3.labelBox;
        var margin = _props3.margin;
        var alignment = _props3.alignment;

        var top = labelBox.height;
        var left = margin.left;
        var x = alignment.horizontal === 'left' ? 0 : alignment.horizontal === 'right' ? this.props.scaleWidth : this.props.scaleWidth / 2;
        var textAnchor = alignment.horizontal === 'left' ? 'start' : alignment.horizontal === 'right' ? 'end' : 'middle';

        // todo implement vertical alignment

        return _react2['default'].createElement(
            'g',
            {
                className: 'chart-axis-label chart-axis-label-x',
                transform: 'translate(' + left + ',' + top + ')'
            },
            _react2['default'].createElement(
                'text',
                { x: x, style: { textAnchor: textAnchor } },
                label
            )
        );
    }
});

var YAxisLabel = _react2['default'].createClass({
    displayName: 'YAxisLabel',

    propTypes: {
        label: PropTypes.string,
        //letter: PropTypes.string,
        margin: PropTypes.object,
        scaleWidth: PropTypes.number,
        scaleHeight: PropTypes.number,
        alignment: PropTypes.shape({
            horizontal: PropTypes.oneOf(['left', 'center', 'right']),
            vertical: PropTypes.oneOf(['top', 'bottom'])
        }),
        axisLabelPadding: PropTypes.number,
        valueLabelPadding: PropTypes.number,
        tickLength: PropTypes.number,
        showTicks: PropTypes.bool,
        // bounding box of the label
        labelBox: PropTypes.object
    },
    getDefaultProps: function getDefaultProps() {
        return {
            labelBox: { height: 10, width: 10 },
            scaleWidth: 0
        };
    },
    render: function render() {
        var _props4 = this.props;
        var label = _props4.label;
        var labelBox = _props4.labelBox;
        var margin = _props4.margin;
        var valueLabelPadding = _props4.valueLabelPadding;
        var showTicks = _props4.showTicks;
        var tickLength = _props4.tickLength;
        var alignment = _props4.alignment;

        var yTickAndPadSpace = valueLabelPadding + (showTicks ? tickLength : 0);

        var top = labelBox.height;
        var left = 0;
        var x = alignment.horizontal === 'left' ? 0 : alignment.horizontal === 'right' ? margin.left - yTickAndPadSpace : (margin.left - yTickAndPadSpace) / 2;
        var textAnchor = alignment.horizontal === 'left' ? 'start' : alignment.horizontal === 'right' ? 'end' : 'middle';

        // todo implement vertical alignment

        return _react2['default'].createElement(
            'g',
            {
                className: 'chart-axis-label chart-axis-label-y',
                transform: 'translate(' + left + ',' + top + ')'
            },
            _react2['default'].createElement(
                'text',
                { x: x, style: { textAnchor: textAnchor } },
                label
            )
        );
    }
});

var ChartAxis = _react2['default'].createClass({
    displayName: 'ChartAxis',

    propTypes: {
        scale: PropTypes.object,
        type: PropTypes.string,
        orientation: PropTypes.string,
        axisTransform: PropTypes.string,
        tickCount: PropTypes.number,
        labelFormat: PropTypes.string,
        letter: PropTypes.string,

        scaleWidth: PropTypes.number,
        scaleHeight: PropTypes.number,
        padding: PropTypes.object,
        labelPadding: PropTypes.number,
        tickLength: PropTypes.number,
        showLabels: PropTypes.bool,
        showTicks: PropTypes.bool,
        showGrid: PropTypes.bool
    },
    getDefaultProps: function getDefaultProps() {
        return { padding: DEFAULTS.spacing };
    },
    render: function render() {
        var _this3 = this;

        var _props5 = this.props;
        var scale = _props5.scale;
        var type = _props5.type;
        var orientation = _props5.orientation;
        var axisTransform = _props5.axisTransform;
        var tickCount = _props5.tickCount;
        var letter = _props5.letter;
        var labelFormat = _props5.labelFormat;
        var scaleWidth = _props5.scaleWidth;
        var scaleHeight = _props5.scaleHeight;
        var padding = _props5.padding;
        var labelPadding = _props5.labelPadding;
        var tickLength = _props5.tickLength;
        var showLabels = _props5.showLabels;
        var showTicks = _props5.showTicks;
        var showGrid = _props5.showGrid;

        if (!(showLabels || showTicks || showGrid)) return null;

        var ticks = type === 'ordinal' ? scale.domain() : scale.ticks(tickCount);
        var distance = showTicks ? tickLength + labelPadding : labelPadding;

        var _ref4 = orientation === 'vertical' ? [function (v) {
            return 'translate(0, ' + scale(v) + ')';
        }, { x: -distance }, scaleWidth + padding.left + padding.right] : [function (v) {
            return 'translate(' + scale(v) + ', 0)';
        }, { y: distance }, scaleHeight + padding.top + padding.bottom];

        var _ref42 = _slicedToArray(_ref4, 3);

        var tickTransform = _ref42[0];
        var labelOffset = _ref42[1];
        var gridLength = _ref42[2];

        return _react2['default'].createElement(
            'g',
            { ref: letter + 'Axis', className: 'chart-axis chart-axis-' + letter, transform: axisTransform },
            _lodash2['default'].map(ticks, function (value) {
                var tickOptions = { value: value, letter: letter, type: type, orientation: orientation, labelOffset: labelOffset, gridLength: gridLength, tickLength: tickLength, labelFormat: labelFormat };
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
        var labelFormat = options.labelFormat;

        var className = 'chart-axis-value-label chart-axis-value-label-' + letter;
        // todo generalize dy for all text sizes...?
        return _react2['default'].createElement(
            'text',
            _extends({ className: className }, { dy: '0.32em' }, labelOffset),
            formatAxisLabel(value, type, labelFormat)
        );
    },
    renderTick: function renderTick(options) {
        var letter = options.letter;
        var tickLength = options.tickLength;
        var orientation = options.orientation;

        var className = 'chart-tick chart-tick-' + letter;

        var _ref5 = orientation === 'vertical' ? [-tickLength, 0] : [0, tickLength];

        var _ref52 = _slicedToArray(_ref5, 2);

        var x2 = _ref52[0];
        var y2 = _ref52[1];

        return _react2['default'].createElement('line', { className: className, x2: x2, y2: y2 });
    },
    renderGrid: function renderGrid(options) {
        var letter = options.letter;
        var gridLength = options.gridLength;
        var orientation = options.orientation;

        var className = 'chart-grid chart-grid-' + letter;

        var _ref6 = orientation === 'vertical' ? [gridLength, 0] : [0, -gridLength];

        var _ref62 = _slicedToArray(_ref6, 2);

        var x2 = _ref62[0];
        var y2 = _ref62[1];

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

function measureAxisLabels(xProps, yProps, xAxisLabelProps, yAxisLabelProps) {
    _lodash2['default'].assign(xProps, { showTicks: false, showGrid: false });
    _lodash2['default'].assign(yProps, { showTicks: false, showGrid: false });
    var xAxisHtml = _react2['default'].renderToStaticMarkup(_react2['default'].createElement(ChartAxis, xProps));
    var yAxisHtml = _react2['default'].renderToStaticMarkup(_react2['default'].createElement(ChartAxis, yProps));
    var xLabelHtml = xAxisLabelProps ? _react2['default'].renderToStaticMarkup(_react2['default'].createElement(XAxisLabel, xAxisLabelProps)) : '';
    var yLabelHtml = yAxisLabelProps ? _react2['default'].renderToStaticMarkup(_react2['default'].createElement(YAxisLabel, yAxisLabelProps)) : '';
    // todo don't use jquery...
    var $testSvg = (0, _jquery2['default'])('<svg class="xy-plot"><g class="chart-inner">        ' + xAxisHtml + yAxisHtml + xLabelHtml + yLabelHtml + '\n    </g></svg>');
    (0, _jquery2['default'])('body').append($testSvg);

    var getRect = function getRect(el) {
        return el.getBoundingClientRect();
    }; // get rekt
    var labelBoxes = {
        xVal: xProps.showLabels ? _lodash2['default'].map($testSvg.find('.chart-axis-value-label-x'), getRect) : [],
        yVal: yProps.showLabels ? _lodash2['default'].map($testSvg.find('.chart-axis-value-label-y'), getRect) : [],
        xAxis: xAxisLabelProps ? $testSvg.find('.chart-axis-label-x text')[0].getBoundingClientRect() : null,
        yAxis: yAxisLabelProps ? $testSvg.find('.chart-axis-label-y text')[0].getBoundingClientRect() : null
    };
    $testSvg.remove();
    return labelBoxes;
}

exports['default'] = XYPlot;
module.exports = exports['default'];