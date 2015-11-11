'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PropTypes = _react2.default.PropTypes;

var TimeseriesLineChart = _react2.default.createClass({
    displayName: 'TimeseriesLineChart',

    propTypes: {
        // the array of data objects
        data: PropTypes.arrayOf(PropTypes.object).isRequired,
        // keys for props.data objects, whose values will be plotted (on y-axis)
        plotKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
        // key for props.data referring to the date (to be plotted on x-axis)
        dateKey: PropTypes.string,

        // whether or not the scale of the Y-axis should always include zero
        shouldIncludeZero: PropTypes.bool,
        // whether or not to draw a zero line
        showZero: PropTypes.bool,

        // whether or not to draw the tick lines on the X axis
        showXTicks: PropTypes.bool,
        // whether or not to draw X axis label text (dates)
        showXLabels: PropTypes.bool,

        // whether or not to draw the tick lines on the Y axis
        showYTicks: PropTypes.bool,
        // whether or not to draw Y axis label text (values)
        showYLabels: PropTypes.bool,

        // called when user mouses over the chart
        onMouseMove: PropTypes.func,

        // true if the user can click and drag to select a date range
        // (this doesn't change the date range on the chart, just calls callback with range and shows highlight)
        isRangeSelectable: PropTypes.bool,
        // callback called when selected range changes
        // (this is a controlled component, parent must maintain selected range state)
        onChangeSelectedRange: PropTypes.func,
        // min and max dates of the selected range
        selectedRangeMin: PropTypes.object,
        selectedRangeMax: PropTypes.object,

        // (outer) width and height of the chart
        width: PropTypes.number,
        height: PropTypes.number,
        // chart margins
        marginTop: PropTypes.number,
        marginBottom: PropTypes.number,
        marginLeft: PropTypes.number,
        marginRight: PropTypes.number
    },
    getDefaultProps: function getDefaultProps() {
        return {
            dateKey: 'date',
            shouldIncludeZero: true,
            showZero: true,
            showXTicks: true,
            showXLabels: true,
            showYTicks: true,
            showYLabels: true,
            isRangeSelectable: false,
            onChangeSelectedRange: _lodash2.default.noop,
            width: 400,
            height: 250,
            marginTop: 10,
            marginBottom: 40,
            marginLeft: 60,
            marginRight: 10
        };
    },
    getInitialState: function getInitialState() {
        return {
            isSelecting: false,
            xScale: null,
            yScale: null,
            innerWidth: null,
            innerHeight: null
        };
    },
    componentWillMount: function componentWillMount() {
        this.initScale(this.props);
        this.initDataLookup(this.props);
    },
    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.initScale(newProps);
        this.initDataLookup(newProps);
    },
    initScale: function initScale(props) {
        var innerWidth = props.width - (props.marginLeft + props.marginRight);
        var innerHeight = props.height - (props.marginTop + props.marginBottom);
        var data = props.data;
        var dateKey = props.dateKey;
        var plotKeys = props.plotKeys;
        var shouldIncludeZero = props.shouldIncludeZero;

        // todo handle missing values/date gaps

        var xScale = _d2.default.time.scale().range([0, innerWidth]).domain(_d2.default.extent(data, function (d) {
            return d[dateKey];
        }));

        var yScale = _d2.default.scale.linear().range([innerHeight, 0])
        // get the max/min for each dataset we're plotting, then the overall max/min of all of them
        .domain(_d2.default.extent(_lodash2.default.flatten(_lodash2.default.map(plotKeys, function (plotKey) {
            return _d2.default.extent(data, function (d) {
                return d[plotKey];
            });
        }).concat(shouldIncludeZero ? [0] : []))))
        // extend domain to start/end at nice round values
        .nice();

        this.setState({ xScale: xScale, yScale: yScale, innerWidth: innerWidth, innerHeight: innerHeight });
    },
    initDataLookup: function initDataLookup(props) {
        this.setState({ bisectDate: _d2.default.bisector(function (d) {
                return d[props.dateKey];
            }).left });
    },
    onMouseDown: function onMouseDown(e) {
        var chartBB = e.currentTarget.getBoundingClientRect();
        var chartX = e.clientX - chartBB.left - this.props.marginLeft;
        var chartDate = this.state.xScale.invert(chartX);

        this.setState({ isSelecting: true });
        this.props.onChangeSelectedRange(chartDate, chartDate, true);
    },
    onMouseUp: function onMouseUp(e) {
        var chartBB = e.currentTarget.getBoundingClientRect();
        var chartX = e.clientX - chartBB.left - this.props.marginLeft;
        var chartDate = this.state.xScale.invert(chartX);

        this.setState({ isSelecting: false });
        if (chartDate > this.props.selectedRangeMin) this.props.onChangeSelectedRange(this.props.selectedRangeMin, chartDate, false);else this.props.onChangeSelectedRange(chartDate, this.props.selectedRangeMin, false);
    },
    onMouseMove: function onMouseMove(e) {
        if (!this.props.onMouseMove && !this.state.isSelecting) return;

        var chartBB = e.currentTarget.getBoundingClientRect();
        var chartX = e.clientX - chartBB.left - this.props.marginLeft;
        var chartDate = this.state.xScale.invert(chartX);
        var closestDataIndex = this.state.bisectDate(this.props.data, chartDate);

        if (this.props.onMouseMove) this.props.onMouseMove(this.props.data[closestDataIndex], closestDataIndex, e);

        if (!this.state.isSelecting) return;

        if (chartDate > this.props.selectedRangeMin) this.props.onChangeSelectedRange(this.props.selectedRangeMin, chartDate, true);else this.props.onChangeSelectedRange(chartDate, this.props.selectedRangeMin, true);
    },
    render: function render() {
        console.log('rendered line chart');
        var _state = this.state;
        var xScale = _state.xScale;
        var yScale = _state.yScale;
        var _props = this.props;
        var data = _props.data;
        var dateKey = _props.dateKey;
        var plotKeys = _props.plotKeys;
        var isRangeSelectable = _props.isRangeSelectable;
        var width = _props.width;
        var height = _props.height;
        var marginLeft = _props.marginLeft;
        var marginTop = _props.marginTop;

        var points = _lodash2.default.map(data, function (d) {
            return [xScale(d[dateKey]), yScale(d[plotKeys[0]])];
        });
        var pathStr = pointsToPathStr(points);

        return _react2.default.createElement(
            'svg',
            _extends({ className: 'line-chart'
            }, { width: width, height: height }, {
                onMouseDown: this.onMouseDown,
                onMouseUp: this.onMouseUp,
                onMouseMove: this.onMouseMove,
                __source: {
                    fileName: '../../../src/v1/LineChart.js',
                    lineNumber: 166
                }
            }),
            _react2.default.createElement(
                'g',
                { className: 'chart-inner',
                    transform: 'translate(' + marginLeft + ', ' + marginTop + ')',
                    __source: {
                        fileName: '../../../src/v1/LineChart.js',
                        lineNumber: 172
                    }
                },
                isRangeSelectable ? this.renderSelectedRange() : null,
                this.renderXAxis(),
                this.renderYAxis(),
                _react2.default.createElement(
                    'g',
                    {
                        __source: {
                            fileName: '../../../src/v1/LineChart.js',
                            lineNumber: 181
                        }
                    },
                    _react2.default.createElement('path', { className: 'chart-line', d: pathStr, __source: {
                            fileName: '../../../src/v1/LineChart.js',
                            lineNumber: 182
                        }
                    })
                )
            )
        );
    },
    renderXAxis: function renderXAxis() {
        var _props2 = this.props;
        var showXTicks = _props2.showXTicks;
        var showXLabels = _props2.showXLabels;

        if (!(showXTicks || showXLabels)) return null;
        var _state2 = this.state;
        var xScale = _state2.xScale;
        var innerHeight = _state2.innerHeight;

        var xTicks = xScale.ticks();

        return _react2.default.createElement(
            'g',
            { className: 'chart-axis chart-axis-x', transform: 'translate(0, ' + innerHeight + ')', __source: {
                    fileName: '../../../src/v1/LineChart.js',
                    lineNumber: 195
                }
            },
            _lodash2.default.map(xTicks, function (date) {
                return _react2.default.createElement(
                    'g',
                    { transform: 'translate(' + xScale(date) + ', 0)', __source: {
                            fileName: '../../../src/v1/LineChart.js',
                            lineNumber: 197
                        }
                    },
                    showXTicks ? _react2.default.createElement('line', { className: 'chart-tick chart-tick-x', x2: 0, y2: 6, __source: {
                            fileName: '../../../src/v1/LineChart.js',
                            lineNumber: 199
                        }
                    }) : null,
                    showXLabels ? _react2.default.createElement(
                        'text',
                        { className: 'chart-axis-label chart-x-label', dy: '0.8em', y: '9', __source: {
                                fileName: '../../../src/v1/LineChart.js',
                                lineNumber: 203
                            }
                        },
                        (0, _moment2.default)(date).format("MMM 'YY")
                    ) : null
                );
            })
        );
    },
    renderYAxis: function renderYAxis() {
        var _props3 = this.props;
        var showYTicks = _props3.showYTicks;
        var showYLabels = _props3.showYLabels;

        if (!(showYTicks || showYLabels)) return null;
        var _state3 = this.state;
        var yScale = _state3.yScale;
        var innerWidth = _state3.innerWidth;

        var yTicks = yScale.ticks();

        return _react2.default.createElement(
            'g',
            { className: 'chart-axis chart-axis-y', __source: {
                    fileName: '../../../src/v1/LineChart.js',
                    lineNumber: 218
                }
            },
            _lodash2.default.map(yTicks, function (value) {
                return _react2.default.createElement(
                    'g',
                    { transform: 'translate(0, ' + yScale(value) + ')', __source: {
                            fileName: '../../../src/v1/LineChart.js',
                            lineNumber: 220
                        }
                    },
                    showYTicks ? _react2.default.createElement('line', { className: 'chart-tick chart-tick-y', x2: innerWidth, y2: 0, __source: {
                            fileName: '../../../src/v1/LineChart.js',
                            lineNumber: 222
                        }
                    }) : null,
                    showYLabels ? _react2.default.createElement(
                        'text',
                        { className: 'chart-axis-label chart-y-label', dy: '0.32em', x: -3, __source: {
                                fileName: '../../../src/v1/LineChart.js',
                                lineNumber: 226
                            }
                        },
                        value
                    ) : null
                );
            })
        );
    },
    renderSelectedRange: function renderSelectedRange() {
        var _state4 = this.state;
        var xScale = _state4.xScale;
        var yScale = _state4.yScale;
        var innerWidth = _state4.innerWidth;
        var innerHeight = _state4.innerHeight;
        var _props4 = this.props;
        var isRangeSelectable = _props4.isRangeSelectable;
        var selectedRangeMin = _props4.selectedRangeMin;
        var selectedRangeMax = _props4.selectedRangeMax;

        if (!(isRangeSelectable && selectedRangeMin && selectedRangeMax)) return null;

        var x = xScale(selectedRangeMin);
        var width = xScale(selectedRangeMax) - x;

        return _react2.default.createElement('rect', _extends({
            className: 'chart-selected-range'
        }, { x: x, width: width }, {
            y: yScale.range()[1], height: innerHeight,
            __source: {
                fileName: '../../../src/v1/LineChart.js',
                lineNumber: 243
            }
        }));
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

exports.default = TimeseriesLineChart;