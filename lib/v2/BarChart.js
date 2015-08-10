'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d3 = require('d3');

var _d32 = _interopRequireDefault(_d3);

var _utilJs = require('./util.js');

var PropTypes = _react2['default'].PropTypes;

var BarChart = _react2['default'].createClass({
    displayName: 'BarChart',

    propTypes: {
        // the array of data objects
        data: PropTypes.array.isRequired,
        // accessor for X & Y coordinates
        getX: _utilJs.AccessorPropType,
        getY: _utilJs.AccessorPropType,

        xScale: PropTypes.func,
        yScale: PropTypes.func
    },

    statics: {
        getExtent: function getExtent(data, getX, getY) {
            return {
                x: _d32['default'].extent(data, (0, _utilJs.accessor)(getX)),
                y: _d32['default'].extent(_d32['default'].extent(data, (0, _utilJs.accessor)(getY)).concat(0))
            };
        }
    },
    getHovered: function getHovered() {},

    render: function render() {
        console.log('barchart', this.props);
        return _react2['default'].createElement(
            'g',
            null,
            this.renderBars()
        );
    },
    renderBars: function renderBars() {
        var _this = this;

        var _props = this.props;
        var xScale = _props.xScale;
        var yScale = _props.yScale;
        var getX = _props.getX;
        var getY = _props.getY;

        var isHorizontal = this.props.orientation === 'bar';
        //const barThickness = this.state.barScale.rangeBand();
        var barThickness = 5;

        var xAccessor = (0, _utilJs.accessor)(getX);
        var yAccessor = (0, _utilJs.accessor)(getY);

        return _react2['default'].createElement(
            'g',
            null,
            this.props.data.map(function (d, i) {
                var yVal = yAccessor(d);
                var barLength = Math.abs(yScale(0) - yScale(yVal));
                var barY = yVal >= 0 ? yScale(0) - barLength : yScale(0);

                return _react2['default'].createElement('rect', {
                    className: 'chart-bar chart-bar-vertical',
                    x: _this.props.xScale(xAccessor(d)) - barThickness / 2,
                    y: barY,
                    width: barThickness,
                    height: barLength
                });
            })
        );
    }
});

exports['default'] = BarChart;
module.exports = exports['default'];