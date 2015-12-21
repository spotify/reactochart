'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d2 = require('d3');

var _d3 = _interopRequireDefault(_d2);

var _util = require('../util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AreaHeatmap = _react2.default.createClass({
    displayName: 'AreaHeatmap',

    mixins: [(0, _util.InterfaceMixin)('XYChart')],
    propTypes: {
        unitsPerPixel: _react2.default.PropTypes.number
    },
    statics: {
        getOptions: function getOptions(props) {
            var data = props.data;
            var getValue = props.getValue;
            var getEndValue = props.getEndValue;

            return { domain: {
                    x: _d3.default.extent(_lodash2.default.flatten([data.map((0, _util.accessor)(getValue.x)), data.map((0, _util.accessor)(getEndValue.x))])),
                    y: _d3.default.extent(_lodash2.default.flatten([data.map((0, _util.accessor)(getValue.y)), data.map((0, _util.accessor)(getEndValue.y))]))
                } };
        }
    },

    onMouseEnter: function onMouseEnter(e) {
        this.props.onMouseEnter(e);
    },
    onMouseLeave: function onMouseLeave(e) {
        this.props.onMouseLeave(e);
    },
    onMouseMove: function onMouseMove(e) {
        var _props = this.props;
        var scale = _props.scale;
        var data = _props.data;
        var getValue = _props.getValue;
        var getEndValue = _props.getEndValue;
        var onMouseMove = _props.onMouseMove;

        if (!_lodash2.default.isFunction(onMouseMove)) return;

        var _map = [getValue.x, getEndValue.x, getValue.y, getEndValue.y].map(_util.accessor);

        var _map2 = _slicedToArray(_map, 4);

        var xAccessor = _map2[0];
        var xEndAccessor = _map2[1];
        var yAccessor = _map2[2];
        var yEndAccessor = _map2[3];

        var boundBox = this.refs.background.getBoundingClientRect();
        if (!boundBox) return;
        var x = e.clientX - (boundBox.left || 0);
        var y = e.clientY - (boundBox.top || 0);
        var xVal = scale.x.invert(x);
        var yVal = scale.y.invert(y);

        var xD = _lodash2.default.find(data, function (d) {
            return xVal >= xAccessor(d) && xVal < xEndAccessor(d);
        });
        var yD = _lodash2.default.find(data, function (d) {
            return yVal >= yAccessor(d) && yVal < yEndAccessor(d);
        });
        var d = _lodash2.default.find(data, function (d) {
            return xVal >= xAccessor(d) && xVal < xEndAccessor(d) && yVal >= yAccessor(d) && yVal < yEndAccessor(d);
        });
        var xBin = [xAccessor(xD), xEndAccessor(xD)];
        var yBin = [yAccessor(yD), yEndAccessor(yD)];

        onMouseMove(e, { xVal: xVal, yVal: yVal, d: d, xD: xD, yD: yD, xBin: xBin, yBin: yBin });
    },
    render: function render() {
        var _props2 = this.props;
        var data = _props2.data;
        var getValue = _props2.getValue;
        var getEndValue = _props2.getEndValue;
        var getArea = _props2.getArea;
        var scale = _props2.scale;
        var scaleWidth = _props2.scaleWidth;
        var scaleHeight = _props2.scaleHeight;

        var _map3 = [getArea, getValue.x, getEndValue.x, getValue.y, getEndValue.y].map(_util.accessor);

        var _map4 = _slicedToArray(_map3, 5);

        var areaAccessor = _map4[0];
        var xAccessor = _map4[1];
        var xEndAccessor = _map4[2];
        var yAccessor = _map4[3];
        var yEndAccessor = _map4[4];

        // to determine how many data units are represented by 1 square pixel of area,
        // find the bin that would require the highest unit-per-pixel scale if its rectangle filled the whole container

        var unitsPerPixel = this.props.unitsPerPixel || Math.max.apply(this, data.map(function (d) {
            return areaAccessor(d) / Math.abs(
            // area of entire containing rectangle
            (scale.x(xEndAccessor(d)) - scale.x(xAccessor(d))) * (scale.y(yEndAccessor(d)) - scale.y(yAccessor(d))));
        }));

        return _react2.default.createElement(
            'g',
            { className: 'area-heatmap-chart', onMouseMove: this.onMouseMove, onMouseLeave: this.onMouseLeave, __source: {
                    fileName: '../../../src/charts/AreaHeatmap.js',
                    lineNumber: 61
                }
            },
            _react2.default.createElement('rect', { x: '0', y: '0', width: scaleWidth, height: scaleHeight, ref: 'background', fill: 'transparent', __source: {
                    fileName: '../../../src/charts/AreaHeatmap.js',
                    lineNumber: 62
                }
            }),
            data.map(function (d, i) {
                // full width and height of the containing rectangle
                var fullWidth = Math.abs(scale.x(xEndAccessor(d)) - scale.x(xAccessor(d)));
                var fullHeight = Math.abs(scale.y(yEndAccessor(d)) - scale.y(yAccessor(d)));
                // x / y position of top left of the containing rectangle
                var x0 = Math.min(scale.x(xEndAccessor(d)), scale.x(xAccessor(d)));
                var y0 = Math.min(scale.y(yEndAccessor(d)), scale.y(yAccessor(d)));

                // we know two facts:
                // 1. the (pixel) area of the rect will be the data value divided by the # of data units per pixel
                //    ie. area = height * width = areaAccessor(d) / unitsPerPixel
                // 2. as the rectangle shrinks, the removed area is taken equally out of all sides, so that the ratio
                //    of the rect's width to the full width is equal to the ratio of its height to the full height.
                //    ie. (height / fullHeight) = (width / fullWidth)
                // solve for height and width to get...
                var width = Math.sqrt(areaAccessor(d) / unitsPerPixel * (fullWidth / fullHeight));
                var height = Math.sqrt(areaAccessor(d) / unitsPerPixel * (fullHeight / fullWidth));

                // center the data rect in the containing rectangle
                var x = x0 + (fullWidth - width) / 2;
                var y = y0 + (fullHeight - height) / 2;

                if (!_lodash2.default.all([x, y, width, height], _lodash2.default.isFinite)) return null;

                return _react2.default.createElement('rect', _extends({ x: x, y: y, width: width, height: height, className: 'area-heatmap-rect', key: 'rect-' + i }, {
                    __source: {
                        fileName: '../../../src/charts/AreaHeatmap.js',
                        lineNumber: 87
                    }
                }));
            })
        );
    }
});

exports.default = AreaHeatmap;