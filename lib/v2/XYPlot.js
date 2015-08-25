'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d3 = require('d3');

var _d32 = _interopRequireDefault(_d3);

var _utilJs = require('./util.js');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var PropTypes = _react2['default'].PropTypes;

function defaultDomain(data, getter, scaleType) {
    switch (scaleType) {
        // extent for number/time scales, coerce dates to numbers
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

function makeScale(domains, range, axisType) {
    var domain = defaultDomain(_lodash2['default'].flatten(domains), null, axisType);
    var scale = initScale(axisType).domain(domain);
    axisType === 'ordinal' ? scale.rangePoints(range) : scale.range(range);
    return scale;
}

var XYPlot = _react2['default'].createClass({
    displayName: 'XYPlot',

    propTypes: {
        // x & y scale types
        xType: PropTypes.oneOf(['number', 'time', 'ordinal']),
        yType: PropTypes.oneOf(['number', 'time', 'ordinal']),

        // scale domains may be provided, otherwise will be inferred from data
        xDomain: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),
        yDomain: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.instanceOf(Date)])),

        // (outer) width and height of the chart
        width: PropTypes.number,
        height: PropTypes.number,

        // chart margins
        marginTop: PropTypes.number,
        marginBottom: PropTypes.number,
        marginLeft: PropTypes.number,
        marginRight: PropTypes.number,

        // whether or not to draw the tick lines on the X axis
        shouldDrawXTicks: PropTypes.bool,
        // whether or not to draw X axis label text (dates)
        shouldDrawXLabels: PropTypes.bool,

        // whether or not to draw the tick lines on the Y axis
        shouldDrawYTicks: PropTypes.bool,
        // whether or not to draw Y axis label text (values)
        shouldDrawYLabels: PropTypes.bool,

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
            shouldDrawXTicks: true,
            shouldDrawXLabels: true,
            shouldDrawYTicks: true,
            shouldDrawYLabels: true,
            onMouseMove: _lodash2['default'].noop
        };
    },

    componentWillMount: function componentWillMount() {
        this.initScale(this.props);
    },
    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.initScale(newProps);
    },

    initScale: function initScale(props) {
        var innerWidth = props.width - (props.marginLeft + props.marginRight);
        var innerHeight = props.height - (props.marginTop + props.marginBottom);

        var chartDomains = [];
        _react2['default'].Children.forEach(props.children, function (child) {
            var domain = _lodash2['default'].isFunction(child.type.getDomain) ? child.type.getDomain(child.props, props.xType, props.yType) : { x: null, y: null };
            if (_lodash2['default'].isNull(domain.x)) domain.x = defaultDomain(child.props.data, child.props.getX, props.xType);
            if (_lodash2['default'].isNull(domain.y)) domain.y = defaultDomain(child.props.data, child.props.getY, props.yType);
            console.log('chartDomain', domain);
            chartDomains.push(domain);
        });

        var xScale = makeScale(_lodash2['default'].pluck(chartDomains, 'x'), [0, innerWidth], props.xType);
        var yScale = makeScale(_lodash2['default'].pluck(chartDomains, 'y'), [innerHeight, 0], props.yType);

        _lodash2['default'].assign(this, { xScale: xScale, yScale: yScale, innerWidth: innerWidth, innerHeight: innerHeight });
    },

    onMouseMove: function onMouseMove(e) {
        //if(!this.props.onMouseMove && !this.state.isSelecting) return;

        var chartBB = e.currentTarget.getBoundingClientRect();
        var chartX = e.clientX - chartBB.left - this.props.marginLeft;
        var chartXVal = this.xScale.invert(chartX);

        var hovered = this.refs['chart-series-0'].getHovered(chartXVal);

        this.props.onMouseMove(hovered, e);
    },

    render: function render() {
        var _props = this.props;
        var width = _props.width;
        var height = _props.height;
        var marginLeft = _props.marginLeft;
        var marginTop = _props.marginTop;
        var xScale = this.xScale;
        var yScale = this.yScale;
        var innerWidth = this.innerWidth;
        var innerHeight = this.innerHeight;

        return _react2['default'].createElement(
            'svg',
            _extends({ className: 'multi-chart' }, { width: width, height: height }, {
                onMouseMove: this.onMouseMove
            }),
            _react2['default'].createElement(
                'g',
                { className: 'chart-inner',
                    transform: 'translate(' + marginLeft + ', ' + marginTop + ')'
                },
                this.renderXAxis(),
                this.renderYAxis(),
                _react2['default'].Children.map(this.props.children, function (child, i) {
                    var name = child.props.name || 'chart-series-' + i;
                    return _react2['default'].cloneElement(child, { ref: name, name: name, xScale: xScale, yScale: yScale, innerWidth: innerWidth, innerHeight: innerHeight });
                })
            )
        );
    },
    renderXAxis: function renderXAxis() {
        var _props2 = this.props;
        var shouldDrawXTicks = _props2.shouldDrawXTicks;
        var shouldDrawXLabels = _props2.shouldDrawXLabels;
        var xType = _props2.xType;

        if (!(shouldDrawXTicks || shouldDrawXLabels)) return null;
        var xScale = this.xScale;
        var innerHeight = this.innerHeight;

        var xTicks = xType == 'ordinal' ? xScale.domain() : xScale.ticks();

        return _react2['default'].createElement(
            'g',
            { className: 'chart-axis chart-axis-x', transform: 'translate(0, ' + innerHeight + ')' },
            _lodash2['default'].map(xTicks, function (x) {
                return _react2['default'].createElement(
                    'g',
                    { transform: 'translate(' + xScale(x) + ', 0)' },
                    shouldDrawXTicks ? _react2['default'].createElement('line', { className: 'chart-tick chart-tick-x', x2: 0, y2: 6 }) : null,
                    shouldDrawXLabels ? _react2['default'].createElement(
                        'text',
                        { className: 'chart-axis-label chart-x-label', dy: '0.8em', y: '9' },
                        xType === 'time' ? (0, _moment2['default'])(x).format('M/DD') : x
                    ) : null
                );
            })
        );
    },
    renderYAxis: function renderYAxis() {
        var _props3 = this.props;
        var shouldDrawYTicks = _props3.shouldDrawYTicks;
        var shouldDrawYLabels = _props3.shouldDrawYLabels;
        var yType = _props3.yType;

        if (!(shouldDrawYTicks || shouldDrawYLabels)) return null;
        var yScale = this.yScale;

        //if(!yScale.ticks) return; // todo handle ordinals?
        //const yTicks = yScale.ticks();
        var innerWidth = this.innerWidth;
        var yTicks = yType == 'ordinal' ? yScale.domain() : yScale.ticks();

        return _react2['default'].createElement(
            'g',
            { className: 'chart-axis chart-axis-y' },
            _lodash2['default'].map(yTicks, function (value) {
                return _react2['default'].createElement(
                    'g',
                    { transform: 'translate(0, ' + yScale(value) + ')' },
                    shouldDrawYTicks ? _react2['default'].createElement('line', { className: 'chart-tick chart-tick-y', x2: innerWidth, y2: 0 }) : null,
                    shouldDrawYLabels ? _react2['default'].createElement(
                        'text',
                        { className: 'chart-axis-label chart-y-label', dy: '0.32em', x: -3 },
                        yType === 'time' ? (0, _moment2['default'])(value).format('MM-DD') : value
                    ) : null
                );
            })
        );
    }
});

exports['default'] = XYPlot;
module.exports = exports['default'];