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

var StackedBarChart = _react2['default'].createClass({
    displayName: 'StackedBarChart',

    propTypes: {
        // the array of data objects
        data: PropTypes.arrayOf(PropTypes.object).isRequired,
        // keys for props.data objects, whose values will be plotted by the bars
        plotKeys: PropTypes.arrayOf(PropTypes.string).isRequired,

        // orientation of the chart... 'column' for vertical columns, 'bar' for horizontal bars
        orientation: PropTypes.oneOf(['bar', 'column']),

        // (outer) width and height of the chart
        width: PropTypes.number,
        height: PropTypes.number,
        // chart margins
        marginTop: PropTypes.number,
        marginBottom: PropTypes.number,
        marginLeft: PropTypes.number,
        marginRight: PropTypes.number,
        // padding between bars, expressed as a ratio of bar thickness
        // (ie. if barPadding is 0.5, padding will be same size as bar thickness. see d3.scale.ordinal.rangeBands)
        barPadding: PropTypes.number
    },
    getDefaultProps: function getDefaultProps() {
        return {
            orientation: 'bar',
            barPadding: 0.15,

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
            barScale: null,
            valueScale: null
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
        var barAxisLength = props.orientation === 'bar' ? innerHeight : innerWidth;
        var valueAxisLength = props.orientation === 'bar' ? innerWidth : innerHeight;

        var barScale = _d32['default'].scale.ordinal().rangeRoundBands([0, barAxisLength], props.barPadding).domain(_lodash2['default'].range(props.data.length));

        var valueScale = _d32['default'].scale.linear().range([0, valueAxisLength])
        // todo stacked extent
        .domain(_d32['default'].extent([0].concat(_d32['default'].extent(props.data, function (d) {
            return d[props.plotKeys[0]];
        }))));

        this.setState({ barScale: barScale, valueScale: valueScale, innerWidth: innerWidth, innerHeight: innerHeight });
    },

    render: function render() {
        var _props = this.props;
        var data = _props.data;
        var width = _props.width;
        var height = _props.height;
        var marginLeft = _props.marginLeft;
        var marginTop = _props.marginTop;

        return _react2['default'].createElement(
            'svg',
            _extends({ className: 'stacked-bar-chart'
            }, { width: width, height: height }, {
                style: { backgroundColor: '#e0e0e0' },
                fill: 'red'
            }),
            _react2['default'].createElement(
                'g',
                { className: 'chart-inner',
                    transform: 'translate(' + marginLeft + ', ' + marginTop + ')',
                    fill: 'darkblue'
                },
                this.renderBars()
            )
        );
    },
    renderBars: function renderBars() {
        var _this = this;

        var isHorizontal = this.props.orientation === 'bar';
        var barThickness = this.state.barScale.rangeBand();

        return _react2['default'].createElement(
            'g',
            null,
            this.props.data.map(function (d, i) {
                var barLength = _this.state.valueScale(d[_this.props.plotKeys[0]]);

                return isHorizontal ? _react2['default'].createElement('rect', {
                    x: 0,
                    y: _this.state.barScale(i),
                    width: barLength,
                    height: barThickness
                }) : _react2['default'].createElement('rect', {
                    x: _this.state.barScale(i),
                    y: _this.state.innerHeight - barLength,
                    width: barThickness,
                    height: barLength
                });
            })
        );
    }
});

exports['default'] = StackedBarChart;
module.exports = exports['default'];