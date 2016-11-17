'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.makeAccessor = makeAccessor;
exports.datasetsFromPropsOrDescendants = datasetsFromPropsOrDescendants;
exports.inferDataType = inferDataType;
exports.inferDatasetsType = inferDatasetsType;
exports.isValidDomain = isValidDomain;
exports.combineDomains = combineDomains;
exports.domainFromData = domainFromData;
exports.domainFromDatasets = domainFromDatasets;
exports.domainFromRangeData = domainFromRangeData;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * `makeAccessor` creates an accessor or "getter" function given a variety of options
 * to be used for retrieving a data value from within an object or array
 *
 * If given a function, it is passed through.
 * If given null or undefined, the getter is the identity function - ie. returns whatever it's passed
 * If given an array index or deep object key string, the value will be retrieved using _.property
 *
 * @example
 * makeAccessor(null)(4); // 4
 * makeAccessor(d => d + 1)(4); // 5
 * makeAccessor(1)(['a', 'b', 'c']); // 'b'
 * makeAccessor('x.0.y')({x: [{y: 9}]}); // 9
 *
 * @param {any} key - Getter, which may be a function, integer, string, null, or undefined;
 * @returns {function} accessor - Accessor function
 */
function makeAccessor(key) {
  return _lodash2.default.isFunction(key) ? key : _lodash2.default.isNull(key) || _lodash2.default.isUndefined(key) ? _lodash2.default.identity : _lodash2.default.property(key);
}

/**
 * `datasetsFromPropsOrDescendants` expects a `props` object which may have `children`.
 * if `props` has `data` or `datasets`, returns it; otherwise recursively searches props.children
 * for components have `data` or `datasets` and combines them into one `datasets` array.
 * `props.data` is wrapped in array because this returns `datasets` (multiple arrays of `data`)
 *
 * @param {Object} props - A React props object, which may have `children` with their own props.
 * @returns {Array.<Array>} datasets - An array of arrays of data objects
 */
function datasetsFromPropsOrDescendants(props) {
  if (_lodash2.default.isArray(props.datasets)) {
    return props.datasets;
  } else if (_lodash2.default.isArray(props.data)) {
    return [props.data];
  } else if (_react2.default.Children.count(props.children)) {
    var _ret = function () {
      var datasets = [];
      // use Children.forEach instead of map, because Children.map flattens the arrays
      _react2.default.Children.forEach(props.children, function (child) {
        datasets = datasets.concat(datasetsFromPropsOrDescendants(child.props));
      });
      return {
        v: datasets
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }
  return [];
}

function inferDataType(data) {
  var accessor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _lodash2.default.identity;

  if (!_lodash2.default.isArray(data)) throw new Error('inferDataType expects a data array');else if (_lodash2.default.every(data, function (d) {
    return _lodash2.default.isUndefined(accessor(d));
  })) return 'categorical'; // should this be allowed?
  else if (_lodash2.default.every(data, function (d) {
      return _lodash2.default.isNumber(accessor(d)) || _lodash2.default.isUndefined(accessor(d));
    })) return 'number';else if (_lodash2.default.every(data, function (d) {
      return _lodash2.default.isDate(accessor(d)) || _lodash2.default.isUndefined(accessor(d));
    })) return 'time';else return 'categorical';
}

function inferDatasetsType(datasets) {
  var accessor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _lodash2.default.identity;

  if (!_lodash2.default.isArray(datasets)) throw new Error('inferDatasetsType expects a datasets array');

  var types = datasets.map(function (data) {
    return inferDataType(data, accessor);
  });
  var uniqTypes = _lodash2.default.uniq(types);
  return uniqTypes.length === 1 ? uniqTypes[0] : 'categorical';
}

function isValidDomain(domain) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'categorical';

  return _lodash2.default.isArray(domain) && !!domain.length && (
  // categorical domain can be any array of anything
  type === 'categorical' ||
  // number/time domains should look like [min, max]
  type === 'number' && domain.length === 2 && _lodash2.default.every(domain, _lodash2.default.isNumber) || type === 'time' && domain.length === 2 && _lodash2.default.every(domain, _lodash2.default.isDate));
}

function combineDomains(domains, dataType) {
  if (!_lodash2.default.isArray(domains)) return undefined;
  return dataType === 'categorical' ? _lodash2.default.uniq(_lodash2.default.flatten(_lodash2.default.compact(domains))) : _d2.default.extent(_lodash2.default.flatten(domains));
}

function domainFromData(data) {
  var accessor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _lodash2.default.identity;
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  if (!type) type = inferDataType(data, accessor);
  return type === 'number' || type === 'time' ? _d2.default.extent(data.map(accessor)) : _lodash2.default.uniq(data.map(accessor));
}

function domainFromDatasets(datasets) {
  var accessor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _lodash2.default.identity;
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  // returns the default domain of a collection of datasets with an accessor function
  // for numeric and date-type datasets, returns the extent (min and max) of the numbers/dates
  // for categorical datasets, returns the set of distinct category values
  if (!type) type = inferDatasetsType(datasets, accessor);
  var domains = datasets.map(function (data) {
    return domainFromData(data, accessor, type);
  });
  return combineDomains(domains, type);
}

function domainFromRangeData(data, rangeStartAccessor, rangeEndAccessor, dataType) {
  // returns the domain of dataset for which each datum represents a range of values
  // ie. has a start and end value rather than a single value
  // for example, time ranges

  if (!dataType) dataType = inferDataType(data, rangeStartAccessor);
  switch (dataType) {
    case 'number':
    case 'time':
      return _d2.default.extent(_lodash2.default.flatten([_d2.default.extent(data, function (d) {
        return +rangeStartAccessor(d);
      }), _d2.default.extent(data, function (d) {
        return +rangeEndAccessor(d);
      })]));
    case 'categorical':
      return _lodash2.default.uniq(_lodash2.default.flatten([data.map(rangeStartAccessor), data.map(rangeEndAccessor)]));
  }
  return [];
}