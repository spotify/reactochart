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

var PropTypes = _react2['default'].PropTypes;

var MultiChart = _react2['default'].createClass({
    displayName: 'MultiChart',

    propTypes: {
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
            xScale: null,
            yScale: null,
            innerWidth: null,
            innerHeight: null
        };
    },

    componentWillMount: function componentWillMount() {
        this.initScale(this.props);
        //this.initDataLookup(this.props);
    },
    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.initScale(newProps);
        //this.initDataLookup(newProps);
    },

    initScale: function initScale(props) {
        var innerWidth = props.width - (props.marginLeft + props.marginRight);
        var innerHeight = props.height - (props.marginTop + props.marginBottom);
        var data = props.data;

        // todo handle missing values/date gaps
        var dateKey = props.dateKey;
        var plotKeys = props.plotKeys;
        var shouldIncludeZero = props.shouldIncludeZero;
        var xScale = _d32['default'].time.scale().range([0, innerWidth]).domain([0, 20]);

        var yScale = _d32['default'].scale.linear().range([innerHeight, 0])
        // get the max/min for each dataset we're plotting, then the overall max/min of all of them
        .domain([0, 100])
        // extend domain to start/end at nice round values
        .nice();

        this.setState({ xScale: xScale, yScale: yScale, innerWidth: innerWidth, innerHeight: innerHeight });
    },
    initDataLookup: function initDataLookup(props) {
        this.setState({ bisectDate: _d32['default'].bisector(function (d) {
                return d[props.dateKey];
            }).left });
    },

    render: function render() {
        var _props = this.props;
        var width = _props.width;
        var height = _props.height;
        var _state = this.state;
        var xScale = _state.xScale;
        var yScale = _state.yScale;
        var innerWidth = _state.innerWidth;
        var innerHeight = _state.innerHeight;

        return _react2['default'].createElement(
            'svg',
            _extends({ className: 'multi-chart' }, { width: width, height: height }),
            _react2['default'].Children.map(this.props.children, function (child) {
                return _react2['default'].cloneElement(child, { xScale: xScale, yScale: yScale, innerWidth: innerWidth, innerHeight: innerHeight });
                //return child;
            })
        );
    }
});

exports['default'] = MultiChart;
module.exports = exports['default'];