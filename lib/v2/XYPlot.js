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

var _utilJs = require('./util.js');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var PropTypes = _react2['default'].PropTypes;

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

        // todo: tickLength, labelPadding
        // todo: labelFormat
        // todo: niceX, niceY
        // todo: padding

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
            showXLabels: true,
            showYLabels: true,
            showXGrid: true,
            showYGrid: true,
            showXTicks: true,
            showYTicks: true,
            showXZero: true,
            showYZero: true,
            onMouseMove: _lodash2['default'].noop
        };
    },
    getInitialState: function getInitialState() {
        return { preRender: false };
    },

    componentWillMount: function componentWillMount() {
        //this.initMargin(this.props);
        this.initScale(this.props);
    },
    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.initScale(newProps);
    },

    initMargin: function initMargin(props) {
        if (props.showXLabels) {
            props.data.forEach(function (d) {
                console.log();
            });
        }
    },
    initScale: function initScale(props) {
        // create the X and Y scales shared by charts
        // first figure out the domains for each axis (ie. data extent)
        var chartDomains = [];
        // unless both domains are given, ask each child chart for it's desired domain, & flatten them into one domain.
        // this is so that charts can plot their own modified version of the data (ie. a histogram),
        // even if it has a different domain than the original data
        if (!(this.props.xDomain && this.props.yDomain)) {
            _react2['default'].Children.forEach(props.children, function (child) {
                // todo handle domain passed in as prop
                var domain = _lodash2['default'].isFunction(child.type.getDomain) ? child.type.getDomain(child.props, props.xType, props.yType) : { x: null, y: null };
                if (_lodash2['default'].isNull(domain.x)) domain.x = defaultDomain(child.props.data, child.props.getX, props.xType);
                if (_lodash2['default'].isNull(domain.y)) domain.y = defaultDomain(child.props.data, child.props.getY, props.yType);
                //console.log('chartDomain', domain);
                chartDomains.push(domain);
            });
        }

        // calculate the inner width and height based on margin
        // todo get padding too
        var innerWidth = props.width - (props.marginLeft + props.marginRight);
        var innerHeight = props.height - (props.marginTop + props.marginBottom);

        // make the scales, combining all domains to create one
        var xDomains = this.props.xDomain || _lodash2['default'].pluck(chartDomains, 'x');
        var yDomains = this.props.yDomain || _lodash2['default'].pluck(chartDomains, 'y');
        var xScale = makeScale(xDomains, [0, innerWidth], props.xType);
        var yScale = makeScale(yDomains, [innerHeight, 0], props.yType);

        _lodash2['default'].assign(this, { innerWidth: innerWidth, innerHeight: innerHeight, xScale: xScale, yScale: yScale });
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
        if (this.state.preRender) return this.preRender();

        var _props = this.props;
        var width = _props.width;
        var height = _props.height;
        var marginLeft = _props.marginLeft;
        var marginTop = _props.marginTop;
        var xType = _props.xType;
        var yType = _props.yType;
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
                    transform: 'translate(' + marginLeft + ', ' + marginTop + ')'
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
    preRender: function preRender() {
        var _this = this;

        window.requestAnimationFrame(function () {
            // stuff to do after the pre-render
            // ie. measure what you rendered & set state to trigger a real render
            //const labels = this.refs.labels.getDOMNode().children;
            //console.log(labels);
            //const labelBoxes = _.map(labels, label => label.getBoundingClientRect());
            //console.log(labelBoxes);
            //const maxLabelWidth = Math.max.apply(null, _.pluck(labelBoxes, 'width'));
            //console.log(maxLabelWidth);
            _this.setState({ maxLabelWidth: 0, preRender: false });
        });

        var _props2 = this.props;
        var width = _props2.width;
        var height = _props2.height;

        return _react2['default'].createElement(
            'svg',
            _extends({ className: 'xy-plot' }, { width: width, height: height }),
            _react2['default'].createElement(
                'g',
                { className: 'chart-inner', ref: 'labels', transform: 'translate(30,10)' },
                this.renderXAxis(),
                this.renderYAxis()
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
        var _this2 = this;

        var letter = options.letter;
        var orientation = options.orientation;
        var axisTransform = options.axisTransform;

        var upperLetter = letter.toUpperCase();
        var showLabels = this.props['show' + upperLetter + 'Labels'];
        var showTicks = this.props['show' + upperLetter + 'Ticks'];
        var showGrid = this.props['show' + upperLetter + 'Grid'];
        if (!(showLabels || showTicks || showGrid)) return null;

        var scale = this[letter + 'Scale'];
        var type = this.props[letter + 'Type'];
        var ticks = type === 'ordinal' ? scale.domain() : scale.ticks();
        var tickTransform = function tickTransform(value) {
            return orientation === 'vertical' ? 'translate(0, ' + scale(value) + ')' : 'translate(' + scale(value) + ', 0)';
        };
        var labelPadding = 6; // todo make prop
        var tickLength = 6; // todo make prop
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
                    showLabels ? _this2.renderLabel(tickOptions) : null,
                    showGrid ? _this2.renderGrid(tickOptions) : null,
                    showTicks ? _this2.renderTick(tickOptions) : null
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
        console.log('labelOffset', labelOffset);
        // todo generalize dy for all text sizes...?
        return _react2['default'].createElement(
            'text',
            _extends({ className: className }, { dy: '0.32em' }, labelOffset),
            type === 'time' ? (0, _moment2['default'])(value).format('MM-DD') : value
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
            return _d32['default'].scale.linear();
        case 'ordinal':
            return _d32['default'].scale.ordinal();
        case 'time':
            return _d32['default'].time.scale();
    }
}

exports['default'] = XYPlot;
module.exports = exports['default'];