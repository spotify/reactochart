import _ from 'lodash';
import React from 'react';

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
  console.log(types)
  const uniqTypes = _.uniq(types);
  return (uniqTypes.length === 1) ? uniqTypes[0] : 'categorical';
}