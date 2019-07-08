"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeAccessor = makeAccessor;
exports.makeAccessor2 = makeAccessor2;
exports.getValue = getValue;
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

var _lodash = _interopRequireDefault(require("lodash"));

var _d = require("d3");

var _react = _interopRequireDefault(require("react"));

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
  return _lodash.default.isFunction(key) ? key : _lodash.default.isNull(key) || _lodash.default.isUndefined(key) ? _lodash.default.identity : _lodash.default.property(key);
}
/**
 * `makeAccessor2` creates a constant accessor function if passed a value,
 * if passed a function, just returns it
 */


function makeAccessor2(valueOrAccessor) {
  if (_lodash.default.isFunction(valueOrAccessor)) return valueOrAccessor;
  return () => valueOrAccessor;
}
/**
 * `getValue` takes as its first argument a value or an accessor function.
 * If it's a value (ie not a function), it is returned.
 * If a function, returns the result of calling function with remaining arguments
 */


function getValue(accessor, ...args) {
  return _lodash.default.isFunction(accessor) ? accessor(...args) : accessor;
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
  if (_lodash.default.isArray(props.datasets)) {
    return props.datasets;
  } else if (_lodash.default.isArray(props.data)) {
    return [props.data];
  } else if (_react.default.Children.count(props.children)) {
    let datasets = []; // use Children.forEach instead of map, because Children.map flattens the arrays

    _react.default.Children.forEach(props.children, child => {
      datasets = datasets.concat(datasetsFromPropsOrDescendants(child.props));
    });

    return datasets;
  }

  return [];
}

function inferDataType(data, accessor = _lodash.default.identity) {
  if (!_lodash.default.isArray(data)) throw new Error("inferDataType expects a data array");else if (_lodash.default.every(data, (d, i) => _lodash.default.isUndefined(accessor(d, i)))) return "categorical"; // should this be allowed?
  else if (_lodash.default.every(data, (d, i) => _lodash.default.isNumber(accessor(d, i)) || _lodash.default.isUndefined(accessor(d, i)))) return "number";else if (_lodash.default.every(data, (d, i) => _lodash.default.isDate(accessor(d, i)) || _lodash.default.isUndefined(accessor(d, i)))) return "time";else return "categorical";
}

function inferDatasetsType(datasets, accessor = _lodash.default.identity) {
  if (!_lodash.default.isArray(datasets)) throw new Error("inferDatasetsType expects a datasets array");
  const types = datasets.map(data => inferDataType(data, accessor));

  const uniqTypes = _lodash.default.uniq(types);

  return uniqTypes.length === 1 ? uniqTypes[0] : "categorical";
}

function isValidDomain(domain, type = "categorical") {
  return _lodash.default.isArray(domain) && !!domain.length && ( // categorical domain can be any array of anything
  type === "categorical" || // number/time domains should look like [min, max]
  type === "number" && domain.length === 2 && _lodash.default.every(domain, _lodash.default.isNumber) || type === "time" && domain.length === 2 && _lodash.default.every(domain, _lodash.default.isDate));
}

function combineDomains(domains, dataType) {
  if (!_lodash.default.isArray(domains)) return undefined;
  return dataType === "categorical" ? _lodash.default.uniq(_lodash.default.flatten(_lodash.default.compact(domains))) : (0, _d.extent)(_lodash.default.flatten(domains));
}

function combineBorderObjects(borderObjects) {
  return _lodash.default.fromPairs(["top", "bottom", "left", "right"].map(k => {
    // combine border objects by taking the max value of each spacing direction
    return [k, _lodash.default.get(_lodash.default.maxBy(borderObjects, k), k)];
  }));
}

function domainFromData(data, accessor = _lodash.default.identity, type = undefined) {
  if (!type) type = inferDataType(data, accessor);
  return type === "number" || type === "time" ? (0, _d.extent)(data.map(accessor)) : _lodash.default.uniq(data.map(accessor));
}

function getDataDomainByAxis(props) {
  const {
    horizontal,
    data,
    getX,
    getY
  } = props;
  const accessor = horizontal ? makeAccessor(getY) : makeAccessor(getX);
  const rangeAxis = horizontal ? "y" : "x";
  return {
    [rangeAxis]: domainFromData(data, accessor)
  };
}

function domainFromDatasets(datasets, accessor = _lodash.default.identity, type = undefined) {
  // returns the default domain of a collection of datasets with an accessor function
  // for numeric and date-type datasets, returns the extent (min and max) of the numbers/dates
  // for categorical datasets, returns the set of distinct category values
  if (!type) type = inferDatasetsType(datasets, accessor);
  const domains = datasets.map(data => domainFromData(data, accessor, type));
  return combineDomains(domains, type);
}

function domainFromRangeData(data, rangeStartAccessor, rangeEndAccessor, dataType) {
  // returns the domain of dataset for which each datum represents a range of values
  // ie. has a start and end value rather than a single value
  // for example, time ranges
  if (!dataType) dataType = inferDataType(data, rangeStartAccessor);

  switch (dataType) {
    case "number":
    case "time":
      return (0, _d.extent)(_lodash.default.flatten([(0, _d.extent)(data, (d, i) => +rangeStartAccessor(d, i)), (0, _d.extent)(data, (d, i) => +rangeEndAccessor(d, i))]));

    case "categorical":
      return _lodash.default.uniq(_lodash.default.flatten([data.map(rangeStartAccessor), data.map(rangeEndAccessor)]));
  }

  return [];
}

function combineDatasets(datasetsInfo = [], combineKey = "x") {
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
  const datasetLookups = datasetsInfo.map(datasetInfo => {
    const {
      data
    } = datasetInfo;
    return _lodash.default.keyBy(data, datasetInfo.combineKey || combineKey);
  }); // create a unique sorted array containing all of the data values for combineKey in all datasets

  const allCombineValues = (0, _lodash.default)(datasetsInfo).map(datasetInfo => datasetInfo.data.map(makeAccessor(datasetInfo.combineKey || combineKey))).flatten().uniqBy(_lodash.default.toString) // uniq by string, otherwise dates etc. are not unique
  .sortBy().value(); // for each of the unique combineKey data values, go through each dataset and look for a combineKey value that matches
  // if we find it, combine the values for that datum's dataKeys into the final combinedDatum object

  return allCombineValues.map(combineValue => {
    let combinedDatum = {
      [combineKey]: combineValue
    };
    datasetsInfo.forEach((datasetInfo, datasetIndex) => {
      if (!datasetInfo.dataKeys || !Object.keys(datasetInfo.dataKeys).length) return;
      const datasetLookup = datasetLookups[datasetIndex];
      if (!_lodash.default.has(datasetLookup, combineValue)) return;
      const datum = datasetLookup[combineValue];

      _lodash.default.forEach(datasetInfo.dataKeys, (newDataKey, originalDataKey) => {
        combinedDatum[newDataKey] = datum[originalDataKey];
      });
    });
    return combinedDatum;
  });
}
//# sourceMappingURL=Data.js.map