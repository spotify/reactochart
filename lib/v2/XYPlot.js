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

var PropTypes = _react2['default'].PropTypes;

window.accessor = _utilJs.accessor;

function makeScale(type) {
    switch (type) {
        case 'number':
            return _d32['default'].scale.linear();
        case 'ordinal':
            return _d32['default'].scale.ordinal();
        case 'time':
            return _d32['default'].time.scale();
    }
}

function domainFromChildren(children, xType, yType) {
    var childDomains = [];
    _react2['default'].Children.forEach(children, function (child) {
        var domain = _lodash2['default'].isFunction(child.type.getDomain) ? child.type.getDomain(child.props, xType, yType) : { x: null, y: null };

        if (_lodash2['default'].isNull(domain.x)) domain.x = defaultDomain(child.props.data, child.props.getX, xType);
        if (_lodash2['default'].isNull(domain.y)) domain.y = defaultDomain(child.props.data, child.props.getY, yType);
        childDomains.push(domain);
    });

    return {
        x: defaultDomain(_lodash2['default'].flatten(_lodash2['default'].pluck(childDomains, 'x')), null, xType),
        y: defaultDomain(_lodash2['default'].flatten(_lodash2['default'].pluck(childDomains, 'y')), null, yType)
    };
}

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
            chartDomains.push(domain);
        });

        var xDomain = defaultDomain(_lodash2['default'].flatten(_lodash2['default'].pluck(chartDomains, 'x')), null, props.xType);
        var yDomain = defaultDomain(_lodash2['default'].flatten(_lodash2['default'].pluck(chartDomains, 'y')), null, props.yType);

        var xScale = makeScale(props.xType)
        //.range([0, innerWidth])
        .domain(xDomain);
        props.xType === 'ordinal' ? xScale.rangePoints([0, innerWidth]) : xScale.range([0, innerWidth]);

        var yScale = makeScale(props.yType).range([innerHeight, 0]).domain(yDomain);

        _lodash2['default'].assign(this, { xScale: xScale, yScale: yScale, innerWidth: innerWidth, innerHeight: innerHeight });
    },

    _initScale: function _initScale(props) {
        var innerWidth = props.width - (props.marginLeft + props.marginRight);
        var innerHeight = props.height - (props.marginTop + props.marginBottom);

        console.log('domainFromChildren', domainFromChildren(props.children, props.xType, props.yType));

        //let xDomain = props.xDomain;
        //if(!xDomain) {
        //    let childDomains = [];
        //    React.Children.forEach(props.children, child => {
        //        childDomains.push(child.type.getDomain(child.props, props.xType));
        //    });
        //    xDomain = (props.xType === 'number' || props.xType === 'time') ?
        //            d3.extent(_.flatten(childDomains), (d) => +d) : // extent for numbers, coerce dates to numbers
        //            _.uniq(_.flatten(childDomains)); // unique for ordinal scale
        //}

        // children are required to implement the static method `getExtent`
        // which returns the extent of the data domain that will be plotted on that chart for given dataset
        var childExtents = [];
        _react2['default'].Children.forEach(props.children, function (child) {
            var _child$props = child.props;
            var data = _child$props.data;
            var getX = _child$props.getX;
            var getY = _child$props.getY;

            childExtents.push(child.type.getExtent(data, getX, getY, child.props));
        });

        // take the total combined extent of all children's domain extents to determine the overall domain extent
        var xExtent = _d32['default'].extent(_lodash2['default'].flatten(_lodash2['default'].pluck(childExtents, 'x')));
        var yExtent = _d32['default'].extent(_lodash2['default'].flatten(_lodash2['default'].pluck(childExtents, 'y')));

        var xScale = makeScale(props.xType).range([0, innerWidth]).domain(xExtent);

        var yScale = makeScale(props.yType).range([innerHeight, 0]).domain(yExtent).nice();

        //this.setState({xScale, yScale, innerWidth, innerHeight});
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
                        x + ""
                    ) : null
                );
            })
        );
    },
    renderYAxis: function renderYAxis() {
        var _props3 = this.props;
        var shouldDrawYTicks = _props3.shouldDrawYTicks;
        var shouldDrawYLabels = _props3.shouldDrawYLabels;

        if (!(shouldDrawYTicks || shouldDrawYLabels)) return null;
        var yScale = this.yScale;
        var innerWidth = this.innerWidth;

        var yTicks = yScale.ticks();

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
                        value
                    ) : null
                );
            })
        );
    }
});

exports['default'] = XYPlot;
module.exports = exports['default'];