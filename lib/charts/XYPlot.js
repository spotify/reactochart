'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

//const {PropTypes} = React;

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
PropTypes = _lodash2['default'].assign({}, PropTypes, {
    // all props that can apply to both axes take the form {x: val, y: val}
    xyObjectOf: function xyObjectOf(propType) {
        return PropTypes.shape({ x: propType, y: propType });
    },
    axisType: PropTypes.oneOf(['number', 'time', 'ordinal']),
    //DomainType: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),
    dataArray: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),
    fourDirections: PropTypes.shape({
        top: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number
    }),
    stringFormatter: PropTypes.oneOfType([PropTypes['function'], PropTypes.string])
});

function getXY(obj, xOrY) {
    if (!_lodash2['default'].includes(['x', 'y'], xOrY)) throw Error('getXY must be called with x or y as second argument');
    // if the prop is of form {x: val, y: val}, return the requested value, even if undefined
    // otherwise it is a single value for both axes, so return it
    return _lodash2['default'].isEqual(obj, {}) ? undefined : _lodash2['default'].isObject(obj) && (_lodash2['default'].has(obj, 'x') || _lodash2['default'].has(obj, 'y')) ? obj[xOrY] : obj;
}

var DEFAULTS = {
    axisType: { x: 'number', y: 'number' },
    nice: { x: true, y: true },
    tickCount: { x: 10, y: 10 },
    tickLength: { x: 6, y: 6 },
    labelPadding: { x: 6, y: 6 },
    showLabels: { x: true, y: true },
    showGrid: { x: true, y: true },
    showTicks: { x: true, y: true },
    showZero: { x: false, y: false },
    axisLabelPadding: { x: 10, y: 10 },
    axisLabelAlign: {
        x: { horizontal: 'left', vertical: 'top' },
        y: { horizontal: 'right', vertical: 'top' }
    },

    // these values are inferred from data if not provided, therefore empty defaults
    margin: {}, padding: {}, spacing: {}, domain: {},
    ticks: {}, labelValues: {}, labelFormat: {}, axisLabel: {}
};

var XYPlot = _react2['default'].createClass({
    displayName: 'XYPlot',

    propTypes: {
        // (outer) width and height of the chart
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,

        // chart margins (space around edges where axis labels live)
        margin: PropTypes.fourDirections,
        // internal chart padding (space between scale ends and edge of inner chart background)
        padding: PropTypes.fourDirections,
        // the max extra spacing required by the plot elements, if they were on the edge of the chart
        // eg. if a 10px radius dot is plotted at the end of one axis,
        // it needs 10px of spacing so it doesn't hang over the edge of the chart
        // spacing is the max possible necessary padding, and will == padding if plot elements are on scale extrema
        spacing: PropTypes.fourDirections,

        // axis types - number, time or ordinal
        axisType: PropTypes.xyObjectOf(PropTypes.axisType),
        // scale domains may be provided, otherwise will be inferred from data
        domain: PropTypes.xyObjectOf(PropTypes.dataArray),
        // whether or not to extend the scales to end on nice values (see docs for d3 scale.linear.nice())
        nice: PropTypes.xyObjectOf(PropTypes.bool),

        // approximate # of ticks to include on each axis - 10 is default
        // (actual # may be slightly different, to get nicest intervals)
        tickCount: PropTypes.xyObjectOf(PropTypes.number),
        // or alternatively, you can pass an array of the exact tick values to use on each axis
        ticks: PropTypes.xyObjectOf(PropTypes.dataArray),
        // size of axis ticks
        tickLength: PropTypes.xyObjectOf(PropTypes.number),

        // axis value labels will be created for each tick, unless you specify a different list of values to label
        labelValues: PropTypes.xyObjectOf(PropTypes.dataArray),
        // format to use for the axis value labels. can be a function or a string.
        // if function, called on each label.
        // if string, interpreted as momentjs formats for time axes, or numeraljs formats for number axes
        labelFormat: PropTypes.xyObjectOf(PropTypes.stringFormatter),
        // padding between axis value labels and the axis/ticks
        labelPadding: PropTypes.xyObjectOf(PropTypes.number),

        // should we draw axis value labels
        showLabels: PropTypes.xyObjectOf(PropTypes.bool),
        // should we draw the grid lines in the main chart space
        showGrid: PropTypes.xyObjectOf(PropTypes.bool),
        // should we draw the little tick lines along the axis
        showTicks: PropTypes.xyObjectOf(PropTypes.bool),
        // should we draw a line showing where zero is
        showZero: PropTypes.xyObjectOf(PropTypes.bool),

        //
        axisLabel: PropTypes.xyObjectOf(PropTypes.string),
        axisLabelAlign: PropTypes.xyObjectOf(PropTypes.shape({
            horizontal: PropTypes.oneOf(['left', 'center', 'right']),
            vertical: PropTypes.oneOf(['top', 'bottom'])
        })),
        axisLabelPadding: PropTypes.xyObjectOf(PropTypes.number),

        // todo more interaction
        onMouseMove: PropTypes.func,
        onMouseEnter: PropTypes.func,
        onMouseLeave: PropTypes.func

        // todo: minMargin - margin will be at least X, or more if necessary
        // todo: extraMargin - margin to add to calculated necessary margin
        // todo: padding, minPadding, extraPadding
        // todo: spacing, minSpacing, extraSpacing ???
    },
    getDefaultProps: function getDefaultProps() {
        return {
            width: 400,
            height: 250
        };
    },
    getInitialState: function getInitialState() {
        return {};
    },

    componentWillMount: function componentWillMount() {
        this.trueProps = this.initProps(this.props);
        this.initLabelFormats(this.trueProps);
        this.initDomains(this.trueProps);
        this.initScale(this.trueProps);
    },
    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.trueProps = this.initProps(newProps);
        this.initLabelFormats(this.trueProps);
        this.initDomains(this.trueProps);
        this.initScale(this.trueProps);
    },
    initProps: function initProps(props) {
        // this is a bit hacky, but we can't use getDefaultProps for most of the defaults,
        // because the user can pass in eg. {x: 'ordinal'} and we still want to default y to number
        var xyKeys = ['axisType', 'domain', 'nice', 'tickCount', 'ticks', 'tickLength', 'labelValues', 'labelFormat', 'labelPadding', 'showLabels', 'showGrid', 'showTicks', 'showZero', 'axisLabel', 'axisLabelAlign', 'axisLabelPadding'];
        var dirKeys = ['margin', 'padding', 'spacing'];

        var xyProps = _lodash2['default'].object(xyKeys.map(function (propName) {
            var val = props[propName];
            return _lodash2['default'].has(props, propName) ?
            // for any of the {x,y} props, allow the user to pass in one value for both axes
            _lodash2['default'].any(['x', 'y'], function (k) {
                return _lodash2['default'].has(val, k);
            }) ? [propName, _lodash2['default'].defaults({}, val, DEFAULTS[propName])] : [propName, { x: val, y: val }] : [propName, DEFAULTS[propName]];
        }));

        var dirProps = _lodash2['default'].object(dirKeys.map(function (propName) {
            var val = props[propName];
            return _lodash2['default'].has(props, propName) ?
            // same for directional {top,bottom,left,right} props
            _lodash2['default'].any(['top', 'bottom', 'left', 'right'], function (k) {
                return _lodash2['default'].has(val, k);
            }) ? [propName, _lodash2['default'].defaults({}, val, DEFAULTS[propName])] : [propName, { top: val, bottom: val, left: val, right: val }] : [propName, DEFAULTS[propName]];
        }));

        var otherProps = _lodash2['default'].transform(props, function (result, val, key) {
            if (_lodash2['default'].includes(xyKeys, key) || _lodash2['default'].includes(dirKeys, key)) return;
            result[key] = val;
        });

        return _lodash2['default'].assign({}, xyProps, dirProps, otherProps);
    },

    initDomains: function initDomains(props) {
        var axisType = props.axisType;

        // figure out the domains for each axis (ie. data extents)
        // unless both domains are given, ask each child chart for it's desired domain, & flatten them into one domain.
        // this is so that charts can plot their own modified version of the data (ie. a histogram),
        // even if it has a different domain than the original data
        // todo: only do this when necessary
        var ticks = props.ticks;
        var labelValues = props.labelValues;
        var allChartOptions = [];
        _react2['default'].Children.forEach(props.children, function (child) {
            if (!childIsXYChart(child)) return; // only get options for children which identify themselves as XYCharts

            var childProps = _lodash2['default'].assign({}, { axisType: axisType }, child.props);

            var _ref = _lodash2['default'].isFunction(child.type.getOptions) ? child.type.getOptions(childProps) : {};

            var domain = _ref.domain;
            var spacing = _ref.spacing;

            domain = domain || {};
            ['x', 'y'].forEach(function (k) {
                if (isNullOrUndefined(domain[k])) domain[k] = defaultDomain(child.props.data, child.props.getValue[k], axisType[k]);
            });
            spacing = isNullOrUndefined(spacing) ? _lodash2['default'].clone(DEFAULTS.spacing) : _lodash2['default'].defaults({}, spacing, DEFAULTS.spacing);

            allChartOptions.push({ domain: domain, spacing: spacing });
        });

        // use domain from props if provided, else calculated domains from children
        var domains = _lodash2['default'].object(_lodash2['default'].map(['x', 'y'], function (k) {
            return [k, props.domain[k] || _lodash2['default'].compact(_lodash2['default'].pluck(allChartOptions, 'domain.' + k))];
        }));
        // if user has passed in custom ticks or label values, extend the domain to ensure they are all are included
        ['x', 'y'].forEach(function (k) {
            var isOrdinal = axisType[k] === 'ordinal';
            [ticks[k], labelValues[k]].forEach(function (values) {
                if (values) domains[k].push(isOrdinal ? values : _d32['default'].extent(values));
            });
        });
        // use spacing from props if provided, else calculated spacings from children
        var spacings = _lodash2['default'].pluck(allChartOptions, 'spacing').map(function (spacing) {
            return _lodash2['default'].defaults({}, spacing, props.spacing);
        });

        _lodash2['default'].assign(this, { domains: domains, spacings: spacings });
    },
    initLabelFormats: function initLabelFormats(props) {
        this.labelFormat = _lodash2['default'].object(_lodash2['default'].map(['x', 'y'], function (k) {
            var axisType = props.axisType[k];
            // use given format if provided
            return _lodash2['default'].isObject(props.labelFormat) && _lodash2['default'].has(props.labelFormat, k) ? [k, props.labelFormat[k]] :
            // otherwise determine appropriate format for axis type
            axisType == 'number' ? [k, '0.[000000]a'] :
            // todo determine most appropriate date format for this domain
            axisType === 'time' ? [k, 'MM-DD'] : [k, undefined];
        }));
    },

    initScale: function initScale(props) {
        var _this = this;

        // create the X and Y scales shared by charts
        // calculate the inner width and height based on margins
        var width = props.width;
        var height = props.height;
        var axisType = props.axisType;
        var tickCount = props.tickCount;
        var nice = props.nice;
        var axisLabel = props.axisLabel;
        var axisLabelPadding = props.axisLabelPadding;
        var labelPadding = props.labelPadding;
        var tickLength = props.tickLength;
        var showTicks = props.showTicks;
        var domains = this.domains;
        var spacings = this.spacings;
        var labelFormat = this.labelFormat;

        var origMargin = props.margin;
        var origPadding = props.padding;

        // todo fix
        var shouldMeasureLabels = true;
        if (shouldMeasureLabels) {
            (function () {
                // several inferred variables depend on each other in a complicated/circular way:
                // the axis scales, margin, padding, ticks and labels.
                // eg. scale width depends on margin, which depends on the axis labels, which depend on the scale
                // so we set some sane initial values and iterate until it settles down (or we get tired of waiting)

                // start with a margin of 10 pixels for all unknown margins
                //let margin = _.transform(origMargin, (result, m, key) => result[key] = isNullOrUndefined(m) ? 10 : m);
                var margin = _lodash2['default'].defaults({}, origMargin, { top: 10, bottom: 10, left: 10, right: 10 });
                // and padding equal to the first chart's spacing for unknown paddings
                //let padding = _.transform(origPadding, (res, p, key) => res[key] = _.isNull(p) ? spacings[0][key] : p);
                var padding = _lodash2['default'].defaults({}, origPadding, { top: 0, bottom: 0, left: 0, right: 0 });
                // make scales using margin, measure labels, make new margins
                // repeat until we converge on a margin that works
                var scaleWidth = undefined,
                    scaleHeight = undefined,
                    labelBoxes = undefined;
                var scale = {};
                var ticks = {};

                var isDone = false,
                    i = 0,
                    limit = 5; // don't loop forever

                var _loop = function () {
                    i++;
                    // calculate scale width based on previous margin
                    scaleWidth = width - (margin.left + margin.right + padding.left + padding.right);
                    scaleHeight = height - (margin.top + margin.bottom + padding.top + padding.bottom);
                    var range = {
                        x: [padding.left, scaleWidth + padding.left],
                        y: [scaleHeight + padding.top, padding.top]
                    };

                    ['x', 'y'].forEach(function (k) {
                        scale[k] = makeScale(domains[k], range[k], axisType[k], nice[k], tickCount[k]);
                        ticks[k] = props.ticks[k] || axisType[k] === 'ordinal' ? scale[k].domain() : scale[k].ticks(tickCount[k]);
                    });

                    labelBoxes = measureAxisLabels(_this.getXAxisProps({ scaleWidth: scaleWidth, scaleHeight: scaleHeight, scale: scale.x, ticks: ticks.x }), _this.getYAxisProps({ scaleWidth: scaleWidth, scaleHeight: scaleHeight, scale: scale.y, ticks: ticks.y }), axisLabel.x ? _this.getXAxisLabelProps({ margin: margin }) : null, axisLabel.y ? _this.getYAxisLabelProps({ margin: margin }) : null);

                    // calculate padding based on spacings and domains
                    // spacing is the amount of outer space ('margin') required by the outermost elements of each chart,
                    // so that they still fit within the chart boundaries, defined by chartWidth and chartHeight.
                    // padding is the actual amount of extra space required, after taking into account the scales.
                    // if the outermost chart elements are on the scale extrema, padding = spacing,
                    // but the scale may extend beyond the last element anyway, so we may not need the extra padding.
                    // NOTE: temporarily set as padding = max spacing, todo: implement real padding
                    padding = _lodash2['default'].defaults(_lodash2['default'].reduce(spacings, function (newPadding, spacing) {
                        return _lodash2['default'].transform(spacing, function (result, space, dir) {
                            result[dir] = !_lodash2['default'].has(origPadding, dir) ? Math.max(newPadding[dir] || space) : origPadding[dir];
                        });
                    }, {}), { top: 0, bottom: 0, left: 0, right: 0 });

                    // todo: modify to handle all possible label alignments
                    // todo: handle case of labels not shown (ie if !this.props.showYLabels)
                    var hasXAxisLabel = axisLabel.x && labelBoxes.xAxis;
                    var hasYAxisLabel = axisLabel.y && labelBoxes.yAxis;
                    var hasXValLabels = !!labelBoxes.xVal.length;
                    var hasYValLabels = !!labelBoxes.yVal.length;

                    var xRange = scale.x.range();

                    // find # of pixels by which the top- and bottom-most y axis labels overhang the top/bottom chart edges
                    var yRange = scale.y.range();

                    var topYTick = _lodash2['default'].min(ticks.y, scale.y);

                    var bottomYTick = _lodash2['default'].max(ticks.y, scale.y);

                    var topYTickFromTop = Math.abs(scale.y(topYTick) - _lodash2['default'].min(yRange));
                    var bottomYTickFromBottom = Math.abs(scale.y(bottomYTick) - _lodash2['default'].max(yRange));

                    var _ref2 = hasYValLabels ? [_lodash2['default'].min(labelBoxes.yVal, (0, _utilJs.accessor)('top')), _lodash2['default'].max(labelBoxes.yVal, (0, _utilJs.accessor)('top'))] : [null, null];

                    var _ref22 = _slicedToArray(_ref2, 2);

                    var topYValBox = _ref22[0];
                    var bottomYValBox = _ref22[1];

                    var _ref3 = hasYValLabels ? [Math.ceil(Math.max(0.5 * topYValBox.height - (topYTickFromTop + padding.top), 0)), Math.ceil(Math.max(0.5 * bottomYValBox.height - (bottomYTickFromBottom + padding.bottom), 0))] : [0, 0];

                    // find # of pixels by which the left- and right-most x axis labels overhang the left/right chart edges

                    var _ref32 = _slicedToArray(_ref3, 2);

                    var topYValOverhang = _ref32[0];
                    var bottomYValOverhang = _ref32[1];

                    var leftXTick = _lodash2['default'].min(ticks.x, scale.x);

                    var rightXTick = _lodash2['default'].max(ticks.x, scale.x);

                    var leftXTickFromLeft = Math.abs(scale.x(leftXTick) - _lodash2['default'].min(xRange));
                    var rightXTickFromRight = Math.abs(scale.x(rightXTick) - _lodash2['default'].max(xRange));

                    var _ref4 = hasXValLabels ? [_lodash2['default'].min(labelBoxes.xVal, (0, _utilJs.accessor)('left')), _lodash2['default'].max(labelBoxes.xVal, (0, _utilJs.accessor)('right'))] : [null, null];

                    var _ref42 = _slicedToArray(_ref4, 2);

                    var leftXValBox = _ref42[0];
                    var rightXValBox = _ref42[1];

                    var _ref5 = hasXValLabels ? [Math.ceil(Math.max(0.5 * leftXValBox.width - (leftXTickFromLeft + padding.left), 0)), Math.ceil(Math.max(0.5 * rightXValBox.width - (rightXTickFromRight + padding.right), 0))] : [0, 0];

                    // todo: fix all of this... sigh...
                    //

                    var _ref52 = _slicedToArray(_ref5, 2);

                    var leftXValOverhang = _ref52[0];
                    var rightXValOverhang = _ref52[1];
                    var xAxisLabelOuterHeight = hasXAxisLabel ? Math.ceil(labelBoxes.xAxis.height + axisLabelPadding.x) : 0;
                    var yAxisLabelOuterHeight = hasYAxisLabel ? Math.ceil(labelBoxes.yAxis.height + axisLabelPadding.y) : 0;

                    var topMargin = _lodash2['default'].has(origMargin, 'top') ? origMargin.top : Math.max(topYValOverhang, xAxisLabelOuterHeight, yAxisLabelOuterHeight);

                    var yTickAndPadSpace = (hasYValLabels || hasYAxisLabel ? labelPadding.y : 0) + (showTicks.y ? tickLength.y : 0);

                    var maxYValWidth = (hasYValLabels ? Math.ceil(_d32['default'].max(labelBoxes.yVal, (0, _utilJs.accessor)('width'))) : 0) + yTickAndPadSpace;
                    var yAxisLabelOuterWidth = hasYAxisLabel ? Math.ceil(labelBoxes.yAxis.width) + yTickAndPadSpace : 0;
                    //console.log(maxYValWidth, yAxisLabelOuterWidth);

                    var leftMargin = _lodash2['default'].has(origMargin, 'left') ? origMargin.left : Math.max(leftXValOverhang, maxYValWidth, yAxisLabelOuterWidth);

                    var xTickAndPadSpace = (hasXValLabels || hasXAxisLabel ? labelPadding.x : 0) + (showTicks.x ? tickLength.x : 0);

                    var maxXValHeight = (hasXValLabels ? Math.ceil(_d32['default'].max(labelBoxes.xVal, (0, _utilJs.accessor)('height'))) : 0) + xTickAndPadSpace;

                    var requiredMargin = {
                        top: topMargin,
                        bottom: maxXValHeight,
                        left: leftMargin,
                        right: rightXValOverhang
                    };

                    var newMargin = (0, _lodash2['default'])(requiredMargin).map(function (v, k) {
                        return [k, _lodash2['default'].has(origMargin, k) ? origMargin[k] : v];
                    }).object().value();

                    isDone = _lodash2['default'].all(_lodash2['default'].keys(margin), function (k) {
                        return margin[k] === newMargin[k];
                    });
                    //console.log('calculated margin', newMargin);
                    margin = newMargin;
                    scaleWidth = width - (margin.left + margin.right + padding.left + padding.right);
                    scaleHeight = height - (margin.top + margin.bottom + padding.top + padding.bottom);
                };

                while (!isDone && i < limit) {
                    _loop();
                }
                //console.log('padding', padding);
                //console.log({scaleWidth, scaleHeight});
                _lodash2['default'].assign(_this, { scale: scale, ticks: ticks, margin: margin, padding: padding, scaleWidth: scaleWidth, scaleHeight: scaleHeight, labelBoxes: labelBoxes });
            })();
        } else {
            // margins are all pre-defined, just make the scales
            // todo still need to determine padding??
            //const scaleWidth = width - (props.margin.left + props.margin.right);
            //const scaleHeight = height - (props.margin.top + props.margin.bottom);
            //const xScale = makeScale(this.xDomains, [0, scaleWidth], xType);
            //const yScale = makeScale(this.yDomains, [scaleHeight, 0], yType);
            //_.assign(this, {margin: props.margin, scaleWidth, scaleHeight, xScale, yScale});
        }
    },

    onMouseMove: function onMouseMove(e) {
        var _props = this.props;
        var axisType = _props.axisType;
        var height = _props.height;
        var width = _props.width;
        var margin = this.margin;

        // todo faster method than getBoundingClientRect on every mouseover?
        var padding = this.padding;
        var scaleWidth = this.scaleWidth;
        var scaleHeight = this.scaleHeight;
        var chartBB = e.currentTarget.getBoundingClientRect();
        var chartX = Math.round(e.clientX - chartBB.left - this.margin.left);
        var chartY = Math.round(e.clientY - chartBB.top - this.margin.top);

        var chartXVal = !_lodash2['default'].inRange(chartX, 0, scaleWidth + padding.left + padding.right) ? null : axisType.x === 'ordinal' ? this.scale.x.domain()[indexOfClosestNumberInList(chartX, this.scale.x.range())] : this.scale.x.invert(chartX);
        var chartYVal = !_lodash2['default'].inRange(chartY, 0, scaleHeight + padding.top + padding.bottom) ? null : axisType.y === 'ordinal' ? this.scale.x.domain()[indexOfClosestNumberInList(chartY, this.scale.y.range())] : this.scale.x.invert(chartY);

        var chart = this.refs['chart-series-0'];
        var hovered = chart && _lodash2['default'].isFunction(chart.getHovered) ? chart.getHovered(chartXVal) : null;

        this.props.onMouseMove(hovered, e, { chartX: chartX, chartY: chartY, chartXVal: chartXVal, chartYVal: chartYVal });
    },
    onMouseEnter: function onMouseEnter(e) {
        this.props.onMouseMove(e);
    },
    onMouseLeave: function onMouseLeave(e) {
        this.props.onMouseLeave(e);
    },

    render: function render() {
        var _trueProps = this.trueProps;
        var children = _trueProps.children;
        var width = _trueProps.width;
        var height = _trueProps.height;
        var axisType = _trueProps.axisType;
        var axisLabel = _trueProps.axisLabel;
        var onMouseMove = _trueProps.onMouseMove;
        var onMouseEnter = _trueProps.onMouseEnter;
        var onMouseLeave = _trueProps.onMouseLeave;
        var scale = this.scale;
        var margin = this.margin;
        var padding = this.padding;
        var scaleWidth = this.scaleWidth;
        var scaleHeight = this.scaleHeight;

        var chartWidth = scaleWidth + padding.left + padding.right;
        var chartHeight = scaleHeight + padding.top + padding.bottom;

        var propsToPass = {
            axisType: axisType, scale: scale, scaleWidth: scaleWidth, scaleHeight: scaleHeight, plotWidth: width, plotHeight: height,
            chartMargin: margin, chartPadding: padding
        };

        var childrenUnderAxes = _react2['default'].Children.map(children, function (child, i) {
            if (!child || !child.props || !child.props.underAxes) return null;
            // todo fix chart series #
            var name = child.props.name || 'chart-series-' + i;
            return _react2['default'].cloneElement(child, _lodash2['default'].assign({ ref: name, name: name }, propsToPass));
        });
        var childrenAboveAxes = _react2['default'].Children.map(children, function (child, i) {
            if (!child || child.props && child.props.underAxes) return null;
            var name = child.props.name || 'chart-series-' + i;
            return _react2['default'].cloneElement(child, _lodash2['default'].assign({ ref: name, name: name }, propsToPass));
        });

        return _react2['default'].createElement(
            'svg',
            _extends({ className: 'xy-plot' }, { width: width, height: height }, {
                onMouseMove: _lodash2['default'].isFunction(onMouseMove) ? this.onMouseMove : null,
                onMouseEnter: _lodash2['default'].isFunction(onMouseEnter) ? this.onMouseEnter : null,
                onMouseLeave: _lodash2['default'].isFunction(onMouseLeave) ? this.onMouseLeave : null
            }),
            _react2['default'].createElement(
                'g',
                { className: 'chart-inner',
                    transform: 'translate(' + margin.left + ', ' + margin.top + ')'
                },
                _react2['default'].createElement('rect', { className: 'chart-background', width: chartWidth, height: chartHeight }),
                childrenUnderAxes,
                _react2['default'].createElement(ChartAxis, this.getXAxisProps()),
                _react2['default'].createElement(ChartAxis, this.getYAxisProps()),
                childrenAboveAxes
            ),
            axisLabel.x ? _react2['default'].createElement(XAxisLabel, this.getXAxisLabelProps()) : null,
            axisLabel.y ? _react2['default'].createElement(YAxisLabel, this.getYAxisLabelProps()) : null
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
        var props = this.trueProps;
        var k = options.letter;

        return _lodash2['default'].defaults({}, options, {
            scale: _lodash2['default'].get(this.scale, k),
            padding: this.padding,
            scaleHeight: this.scaleHeight,
            scaleWidth: this.scaleWidth,
            labelFormat: this.labelFormat[k],
            type: props.axisType[k],
            tickCount: props.tickCount[k],
            ticks: _lodash2['default'].get(this.ticks, k) || [],
            labels: props.labelValues[k],
            labelPadding: props.labelPadding[k],
            tickLength: props.tickLength[k],
            showLabels: props.showLabels[k],
            showTicks: props.showTicks[k],
            showGrid: props.showGrid[k],
            showZero: props.showZero[k]
        });
    },

    getXAxisLabelProps: function getXAxisLabelProps() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return this.getAxisLabelProps('x', options);
    },
    getYAxisLabelProps: function getYAxisLabelProps() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return this.getAxisLabelProps('y', options);
    },
    getAxisLabelProps: function getAxisLabelProps(k) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var props = this.trueProps;
        var labelBoxes = this.labelBoxes;
        var margin = this.margin;
        var scaleWidth = this.scaleWidth;
        var scaleHeight = this.scaleHeight;

        return _lodash2['default'].defaults({}, options, {
            margin: margin, scaleWidth: scaleWidth, scaleHeight: scaleHeight,
            label: _lodash2['default'].get(props.axisLabel, k),
            alignment: _lodash2['default'].get(props.axisLabelAlign, k),
            axisLabelPadding: _lodash2['default'].get(props.axisLabelPadding, k),
            valueLabelPadding: _lodash2['default'].get(props.labelPadding, k),
            tickLength: _lodash2['default'].get(props.tickLength, k),
            showTicks: _lodash2['default'].get(props.showTicks, k),
            labelBox: labelBoxes && labelBoxes[k + 'Axis'] ? labelBoxes[k + 'Axis'] : { width: 10, height: 10 }
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
        var _props2 = this.props;
        var label = _props2.label;
        var labelBox = _props2.labelBox;
        var margin = _props2.margin;
        var alignment = _props2.alignment;

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
        var _props3 = this.props;
        var label = _props3.label;
        var labelBox = _props3.labelBox;
        var margin = _props3.margin;
        var valueLabelPadding = _props3.valueLabelPadding;
        var showTicks = _props3.showTicks;
        var tickLength = _props3.tickLength;
        var alignment = _props3.alignment;

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
        scale: PropTypes.func,
        type: PropTypes.string,
        orientation: PropTypes.string,
        axisTransform: PropTypes.string,
        ticks: PropTypes.array,
        labels: PropTypes.array,
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
        showGrid: PropTypes.bool,
        showZero: PropTypes.bool
    },
    getDefaultProps: function getDefaultProps() {
        return { padding: DEFAULTS.spacing };
    },
    render: function render() {
        var _this2 = this;

        console.log('labels', this.props.labels);
        var _props4 = this.props;
        var scale = _props4.scale;
        var type = _props4.type;
        var orientation = _props4.orientation;
        var axisTransform = _props4.axisTransform;
        var tickCount = _props4.tickCount;
        var letter = _props4.letter;
        var labelFormat = _props4.labelFormat;
        var ticks = _props4.ticks;
        var scaleWidth = _props4.scaleWidth;
        var scaleHeight = _props4.scaleHeight;
        var padding = _props4.padding;
        var labelPadding = _props4.labelPadding;
        var tickLength = _props4.tickLength;
        var showLabels = _props4.showLabels;
        var showTicks = _props4.showTicks;
        var showGrid = _props4.showGrid;
        var showZero = _props4.showZero;

        if (!(showLabels || showTicks || showGrid || showZero)) return null;

        var labels = _lodash2['default'].isArray(this.props.labels) ? this.props.labels : ticks;
        var distance = showTicks ? tickLength + labelPadding : labelPadding;

        var _ref6 = orientation === 'vertical' ? [function (v) {
            return 'translate(0, ' + scale(v) + ')';
        }, { x: -distance }, scaleWidth + padding.left + padding.right] : [function (v) {
            return 'translate(' + scale(v) + ', 0)';
        }, { y: distance }, scaleHeight + padding.top + padding.bottom];

        var _ref62 = _slicedToArray(_ref6, 3);

        var tickTransform = _ref62[0];
        var labelOffset = _ref62[1];
        var gridLength = _ref62[2];

        var options = { letter: letter, type: type, orientation: orientation, labelOffset: labelOffset, gridLength: gridLength, tickLength: tickLength, labelFormat: labelFormat };
        return _react2['default'].createElement(
            'g',
            { ref: letter + 'Axis', className: 'chart-axis chart-axis-' + letter, transform: axisTransform },
            showTicks || showGrid || showLabels && labels === ticks ? _lodash2['default'].map(ticks, function (value) {
                var tickOptions = _lodash2['default'].assign({}, options, { value: value });
                return _react2['default'].createElement(
                    'g',
                    { transform: tickTransform(value) },
                    showGrid ? _this2.renderGrid(tickOptions) : null,
                    showTicks ? _this2.renderTick(tickOptions) : null,
                    showLabels && labels === ticks ? _this2.renderLabel(tickOptions) : null
                );
            }) : null,
            showLabels && labels !== ticks ? // render custom labels (passed in, not same as ticks)
            _lodash2['default'].map(labels, function (value) {
                return _react2['default'].createElement(
                    'g',
                    { transform: tickTransform(value) },
                    _this2.renderLabel(_lodash2['default'].assign({}, options, { value: value }))
                );
            }) : null,
            showZero ? _react2['default'].createElement(
                'g',
                { transform: tickTransform(0) },
                showZero ? this.renderZero(options) : null
            ) : null
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
    // todo unify into drawLine
    renderTick: function renderTick(options) {
        var letter = options.letter;
        var tickLength = options.tickLength;
        var orientation = options.orientation;

        var className = 'chart-tick chart-tick-' + letter;

        var _ref7 = orientation === 'vertical' ? [-tickLength, 0] : [0, tickLength];

        var _ref72 = _slicedToArray(_ref7, 2);

        var x2 = _ref72[0];
        var y2 = _ref72[1];

        return _react2['default'].createElement('line', { className: className, x2: x2, y2: y2 });
    },
    renderGrid: function renderGrid(options) {
        var letter = options.letter;
        var gridLength = options.gridLength;
        var orientation = options.orientation;

        var className = 'chart-grid chart-grid-' + letter;

        var _ref8 = orientation === 'vertical' ? [gridLength, 0] : [0, -gridLength];

        var _ref82 = _slicedToArray(_ref8, 2);

        var x2 = _ref82[0];
        var y2 = _ref82[1];

        return _react2['default'].createElement('line', { className: className, x2: x2, y2: y2 });
    },
    renderZero: function renderZero(options) {
        var letter = options.letter;
        var gridLength = options.gridLength;
        var orientation = options.orientation;

        var className = 'chart-zero-line chart-zero-line-' + letter;

        var _ref9 = orientation === 'vertical' ? [gridLength, 0] : [0, -gridLength];

        var _ref92 = _slicedToArray(_ref9, 2);

        var x2 = _ref92[0];
        var y2 = _ref92[1];

        return _react2['default'].createElement('line', { className: className, x2: x2, y2: y2 });
    }
});

function closestNumberInList(number, list) {
    return list.reduce(function (closest, current) {
        return Math.abs(current - number) < Math.abs(closest - number) ? current : closest;
    });
}
function indexOfClosestNumberInList(number, list) {
    return list.reduce(function (closestI, current, i) {
        return Math.abs(current - number) < Math.abs(list[closestI] - number) ? i : closestI;
    }, 0);
}

function childIsXYChart(child) {
    return !!(child && _lodash2['default'].has(child, 'type.implementsInterface') && child.type.implementsInterface('XYChart'));
}

function isNullOrUndefined(d) {
    return _lodash2['default'].isNull(d) || _lodash2['default'].isUndefined(d);
}

function makeScale(domains, range, axisType, isNice, tickCount) {
    var domain = defaultDomain(_lodash2['default'].flatten(domains), null, axisType);
    var scale = initScale(axisType).domain(domain);
    axisType === 'ordinal' ? scale.rangePoints(range) : scale.range(range);
    if (isNice && axisType !== 'ordinal') scale.nice(tickCount);
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
            return _d32['default'].scale.linear();
        case 'ordinal':
            return _d32['default'].scale.ordinal();
        case 'time':
            return _d32['default'].time.scale();
    }
}

function formatAxisLabel(value, type, format) {
    return _lodash2['default'].isFunction(format) ? format(value) : type === 'number' ? (0, _numeral2['default'])(value).format(format) : type === 'time' ? (0, _moment2['default'])(value).format(format) : value;
}

function measureAxisLabels(xProps, yProps, xAxisLabelProps, yAxisLabelProps) {
    xProps = _lodash2['default'].assign({}, xProps, { showTicks: false, showGrid: false });
    yProps = _lodash2['default'].assign({}, yProps, { showTicks: false, showGrid: false });
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