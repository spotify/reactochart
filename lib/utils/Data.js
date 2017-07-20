'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeAccessor = makeAccessor;
exports.datasetsFromPropsOrDescendants = datasetsFromPropsOrDescendants;
exports.inferDataType = inferDataType;
exports.inferDatasetsType = inferDatasetsType;
exports.isValidDomain = isValidDomain;
exports.combineDomains = combineDomains;
exports.combineBorderObjects = combineBorderObjects;
exports.domainFromData = domainFromData;
exports.getDataDomainByAxis = getDataDomainByAxis;
exports.domainFromDatasets = domainFromDatasets;
exports.domainFromRangeData = domainFromRangeData;
exports.combineDatasets = combineDatasets;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
    var datasets = [];
    // use Children.forEach instead of map, because Children.map flattens the arrays
    _react2.default.Children.forEach(props.children, function (child) {
      datasets = datasets.concat(datasetsFromPropsOrDescendants(child.props));
    });
    return datasets;
  }
  return [];
}

function inferDataType(data) {
  var accessor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _lodash2.default.identity;

  if (!_lodash2.default.isArray(data)) throw new Error('inferDataType expects a data array');else if (_lodash2.default.every(data, function (d, i) {
    return _lodash2.default.isUndefined(accessor(d, i));
  })) return 'categorical'; // should this be allowed?
  else if (_lodash2.default.every(data, function (d, i) {
      return _lodash2.default.isNumber(accessor(d, i)) || _lodash2.default.isUndefined(accessor(d, i));
    })) return 'number';else if (_lodash2.default.every(data, function (d, i) {
      return _lodash2.default.isDate(accessor(d, i)) || _lodash2.default.isUndefined(accessor(d, i));
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
  return dataType === 'categorical' ? _lodash2.default.uniq(_lodash2.default.flatten(_lodash2.default.compact(domains))) : (0, _d.extent)(_lodash2.default.flatten(domains));
}

function combineBorderObjects(borderObjects) {
  return _lodash2.default.fromPairs(['top', 'bottom', 'left', 'right'].map(function (k) {
    // combine border objects by taking the max value of each spacing direction
    return [k, _lodash2.default.get(_lodash2.default.maxBy(borderObjects, k), k)];
  }));
}

function domainFromData(data) {
  var accessor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _lodash2.default.identity;
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  if (!type) type = inferDataType(data, accessor);
  return type === 'number' || type === 'time' ? (0, _d.extent)(data.map(accessor)) : _lodash2.default.uniq(data.map(accessor));
}

function getDataDomainByAxis(props) {
  var horizontal = props.horizontal,
      data = props.data,
      getX = props.getX,
      getY = props.getY;

  var accessor = horizontal ? makeAccessor(getY) : makeAccessor(getX);
  // only have to specify range axis domain, other axis uses default domainFromData
  var rangeAxis = horizontal ? 'y' : 'x';
  return _defineProperty({}, rangeAxis, domainFromData(data, accessor));
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
      return (0, _d.extent)(_lodash2.default.flatten([(0, _d.extent)(data, function (d, i) {
        return +rangeStartAccessor(d, i);
      }), (0, _d.extent)(data, function (d, i) {
        return +rangeEndAccessor(d, i);
      })]));
    case 'categorical':
      return _lodash2.default.uniq(_lodash2.default.flatten([data.map(rangeStartAccessor), data.map(rangeEndAccessor)]));
  }
  return [];
}

function combineDatasets() {
  var datasetsInfo = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var combineKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'x';

  // combineDatasets combines multiple datasets into one, joined on a common key 'combineKey'
  // datasetsInfo is an array that looks like:
  // [
  //   {data: [{x: 0, y: 3}, ...], combineKey: 'x', dataKeys: {y: 'y0'}}
  //   {data: [{count: 0, value: 4}], combineKey: 'count', dataKeys: {value: 'y1'}}
  // ]
  // where `data` is an array of data points of any shape
  // `combineKey` is the key for the value which the datasets are joined on
  // `dataKeys` are getters for other values in each datapoint which should be merged into the combined dataset
  //   - key = getter in original datapoint, value = setter for combined dataset
  // example above (with default combinedKey) results in:
  // [{x: 0, y0: 3, y1: 4}, ...]

  // index each dataset by its combineKey values so we can quickly lookup if it has data for a given value
  var datasetLookups = datasetsInfo.map(function (datasetInfo) {
    var data = datasetInfo.data;

    return _lodash2.default.keyBy(data, datasetInfo.combineKey || combineKey);
  });

  // create a unique sorted array containing all of the data values for combineKey in all datasets
  var allCombineValues = (0, _lodash2.default)(datasetsInfo).map(function (datasetInfo) {
    return datasetInfo.data.map(makeAccessor(datasetInfo.combineKey || combineKey));
  }).flatten().uniqBy(_lodash2.default.toString) // uniq by string, otherwise dates etc. are not unique
  .sortBy().value();

  // for each of the unique combineKey data values, go through each dataset and look for a combineKey value that matches
  // if we find it, combine the values for that datum's dataKeys into the final combinedDatum object
  return allCombineValues.map(function (combineValue) {
    var combinedDatum = _defineProperty({}, combineKey, combineValue);

    datasetsInfo.forEach(function (datasetInfo, datasetIndex) {
      if (!datasetInfo.dataKeys || !Object.keys(datasetInfo.dataKeys).length) return;
      var datasetLookup = datasetLookups[datasetIndex];
      if (!_lodash2.default.has(datasetLookup, combineValue)) return;

      var datum = datasetLookup[combineValue];
      _lodash2.default.forEach(datasetInfo.dataKeys, function (newDataKey, originalDataKey) {
        combinedDatum[newDataKey] = datum[originalDataKey];
      });
    });

    return combinedDatum;
  });
}