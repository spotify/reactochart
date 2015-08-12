'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.accessor = accessor;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var PropTypes = _react2['default'].PropTypes;
var AccessorPropType = PropTypes.oneOfType(PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.func);

exports.AccessorPropType = AccessorPropType;

function accessor(key) {
    return _lodash2['default'].isFunction(key) ? key : // pass an accessor function...
    _lodash2['default'].isNull(key) ? _lodash2['default'].identity : // or null to just return the item itself...
    _lodash2['default'].property(key); // or an array index or object key
}