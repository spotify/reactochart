import _ from 'lodash';
import React from 'react';

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
  return _.isFunction(key) ? key :
    _.isNull(key) || _.isUndefined(key) ? _.identity :
    _.property(key);
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
  if(_.isArray(props.datasets)) {
    return props.datasets;
  } else if(_.isArray(props.data)) {
    return [props.data];
  } else if(React.Children.count(props.children)) {
    let datasets = [];
    // use Children.forEach instead of map, because Children.map flattens the arrays
    React.Children.forEach(props.children, child => {
      datasets = datasets.concat(datasetsFromPropsOrDescendants(child.props));
    });
    return datasets;
  }
  return [];
}

export function inferDataType(data, accessor = _.identity) {
  if(!_.isArray(data))
    throw new Error('inferDataType expects a data array');
  else if(_.every(data, d => _.isUndefined(accessor(d))))
    return 'categorical'; // should this be allowed?
  else if(_.every(data, d => _.isNumber(accessor(d)) || _.isUndefined(accessor(d))))
    return 'number';
  else if(_.every(data, d => _.isDate(accessor(d)) || _.isUndefined(accessor(d))))
    return 'time';
  else
    return 'categorical';
}

export function inferDatasetsType(datasets, accessor = _.identity) {
  if(!_.isArray(datasets))
    throw new Error('inferDatasetsType expects a datasets array');

  const types = datasets.map(data => inferDataType(data, accessor));
  const uniqTypes = _.uniq(types);
  return (uniqTypes.length === 1) ? uniqTypes[0] : 'categorical';
}

export function domainFromDatasets(datasets, accessor, type) {
  // returns the default domain of a collection of datasets with an accessor function
  // for numeric and date-type datasets, returns the extent (min and max) of the numbers/dates
  // for categorical datasets, returns the set of distinct category values
  if(!type) type = inferDatasetsType(datasets, accessor);
  return (type === 'number' || type === 'time') ?
    d3.extent(datasets.map(data => domainFromData(data, accessor, type))) :
    _.uniq(datasets.map(data => domainFromData(data, accessor, type)));
}

export function domainFromData(data, accessor, type) {
  if(!type) type = inferDataType(data, accessor);
  return (type === 'number' || type === 'time') ?
    d3.extent(data.map(accessor)) :
    _.uniq(data.map(accessor));
}

export function combineDomains(domains, dataType) {
  if(!_.isArray(domains)) return undefined;
  return (dataType === 'categorical') ?
    _.uniq(_.flatten(_.compact(domains))) :
    d3.extent(_.flatten(domains));
}