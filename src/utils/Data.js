import isFunction from "lodash/isFunction";
import isNull from "lodash/isNull";
import isUndefined from "lodash/isUndefined";
import property from "lodash/property";
import isNumber from "lodash/isNumber";
import isDate from "lodash/isDate";
import uniq from "lodash/uniq";
import flatten from "lodash/flatten";
import compact from "lodash/compact";
import fromPairs from "lodash/fromPairs";
import get from "lodash/get";
import maxBy from "lodash/maxBy";
import keyBy from "lodash/keyBy";
import uniqBy from "lodash/uniqBy";
import has from "lodash/has";
import forEach from "lodash/forEach";
import identity from "lodash/identity";
import { extent } from "d3";
import React from "react";

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
export function makeAccessor(key) {
  return isFunction(key)
    ? key
    : isNull(key) || isUndefined(key)
      ? identity
      : property(key);
}

/**
 * `makeAccessor2` creates a constant accessor function if passed a value,
 * if passed a function, just returns it
 */
export function makeAccessor2(valueOrAccessor) {
  if (isFunction(valueOrAccessor)) return valueOrAccessor;
  return () => valueOrAccessor;
}

/**
 * `getValue` takes as its first argument a value or an accessor function.
 * If it's a value (ie not a function), it is returned.
 * If a function, returns the result of calling function with remaining arguments
 */
export function getValue(accessor, ...args) {
  return isFunction(accessor) ? accessor(...args) : accessor;
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
export function datasetsFromPropsOrDescendants(props) {
  if (Array.isArray(props.datasets)) {
    return props.datasets;
  } else if (Array.isArray(props.data)) {
    return [props.data];
  } else if (React.Children.count(props.children)) {
    let datasets = [];
    // use Children.forEach instead of map, because Children.map flattens the arrays
    React.Children.forEach(props.children, child => {
      datasets = datasets.concat(datasetsFromPropsOrDescendants(child.props));
    });
    return datasets;
  }
  return [];
}

export function inferDataType(data, accessor = identity) {
  if (!Array.isArray(data))
    throw new Error("inferDataType expects a data array");
  else if (data.every((d, i) => accessor(d, i) === undefined))
    return "categorical";
  // should this be allowed?
  else if (
    data.every(
      (d, i) => isNumber(accessor(d, i)) || accessor(d, i) === undefined
    )
  )
    return "number";
  else if (
    data.every((d, i) => isDate(accessor(d, i)) || accessor(d, i) === undefined)
  )
    return "time";
  else return "categorical";
}

export function inferDatasetsType(datasets, accessor = identity) {
  if (!Array.isArray(datasets))
    throw new Error("inferDatasetsType expects a datasets array");

  const types = datasets.map(data => inferDataType(data, accessor));
  const uniqTypes = uniq(types);
  return uniqTypes.length === 1 ? uniqTypes[0] : "categorical";
}

export function isValidDomain(domain, type = "categorical") {
  return (
    Array.isArray(domain) &&
    !!domain.length &&
    // categorical domain can be any array of anything
    (type === "categorical" ||
      // number/time domains should look like [min, max]
      (type === "number" && domain.length === 2 && domain.every(isNumber)) ||
      (type === "time" && domain.length === 2 && domain.every(isDate)))
  );
}

export function combineDomains(domains, dataType) {
  if (!Array.isArray(domains)) return undefined;
  return dataType === "categorical"
    ? uniq(flatten(compact(domains)))
    : extent(flatten(domains));
}

export function combineBorderObjects(borderObjects) {
  return fromPairs(
    ["top", "bottom", "left", "right"].map(k => {
      // combine border objects by taking the max value of each spacing direction
      return [k, get(maxBy(borderObjects, k), k)];
    })
  );
}

export function domainFromData(data, accessor = identity, type = undefined) {
  if (!type) type = inferDataType(data, accessor);
  return type === "number" || type === "time"
    ? extent(data.map(accessor))
    : uniq(data.map(accessor));
}

export function getDataDomainByAxis(props) {
  const { horizontal, data, getX, getY } = props;
  const accessor = horizontal ? makeAccessor(getY) : makeAccessor(getX);
  const rangeAxis = horizontal ? "y" : "x";
  return {
    [rangeAxis]: domainFromData(data, accessor)
  };
}

export function domainFromDatasets(
  datasets,
  accessor = identity,
  type = undefined
) {
  // returns the default domain of a collection of datasets with an accessor function
  // for numeric and date-type datasets, returns the extent (min and max) of the numbers/dates
  // for categorical datasets, returns the set of distinct category values
  if (!type) type = inferDatasetsType(datasets, accessor);
  const domains = datasets.map(data => domainFromData(data, accessor, type));
  return combineDomains(domains, type);
}

export function domainFromRangeData(
  data,
  rangeStartAccessor,
  rangeEndAccessor,
  dataType
) {
  // returns the domain of dataset for which each datum represents a range of values
  // ie. has a start and end value rather than a single value
  // for example, time ranges

  if (!dataType) dataType = inferDataType(data, rangeStartAccessor);
  switch (dataType) {
    case "number":
    case "time":
      return extent(
        flatten([
          extent(data, (d, i) => +rangeStartAccessor(d, i)),
          extent(data, (d, i) => +rangeEndAccessor(d, i))
        ])
      );
    case "categorical":
      return uniq(
        flatten([data.map(rangeStartAccessor), data.map(rangeEndAccessor)])
      );
  }
  return [];
}

export function combineDatasets(datasetsInfo = [], combineKey = "x") {
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
    const { data } = datasetInfo;
    return keyBy(data, datasetInfo.combineKey || combineKey);
  });

  // Grab combineKey from each dataset and flatten into one array
  const allCombineValues = [].concat(
    ...datasetsInfo.map(datasetInfo =>
      datasetInfo.data.map(makeAccessor(datasetInfo.combineKey || combineKey))
    )
  );

  // Get all unique values
  const uniqueValues = uniqBy(allCombineValues, value => {
    return value instanceof Date ? value.toString() : value;
  });

  // For each of the unique combineKey data values, go through each dataset and look for a combineKey value that matches
  // if we find it, combine the values for that datum's dataKeys into the final combinedDatum object
  return uniqueValues.map(combineValue => {
    let combinedDatum = { [combineKey]: combineValue };

    datasetsInfo.forEach((datasetInfo, datasetIndex) => {
      if (!datasetInfo.dataKeys || !Object.keys(datasetInfo.dataKeys).length)
        return;
      const datasetLookup = datasetLookups[datasetIndex];
      if (!has(datasetLookup, combineValue)) return;

      const datum = datasetLookup[combineValue];
      forEach(datasetInfo.dataKeys, (newDataKey, originalDataKey) => {
        combinedDatum[newDataKey] = datum[originalDataKey];
      });
    });

    return combinedDatum;
  });
}
