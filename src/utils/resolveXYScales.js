import _ from 'lodash';
import React from 'react';
import invariant from 'invariant';

import {
  makeAccessor,
  domainFromDatasets,
  inferDatasetsType,
  datasetsFromPropsOrDescendants,
  combineDomains,
  isValidDomain
} from 'utils/Data';

import {
  scaleTypeFromDataType,
  dataTypeFromScaleType,
  initScale,
  isValidScale,
  innerRangeX,
  innerRangeY
} from 'utils/Scale';

/**
 * `resolveXYScales` is a higher-order-component.
 *
 * @param {Component} Component - The React Component (class) which should be wrapped by this HOC
 * @returns {Component} - A Component which auto-resolves XY scales from given props
*/

const errs = {
  getDomain: (C) =>
    `Components enhanced by resolveXYScales must have a static getDomain method, ${componentName(C)} does not have one`
};
function componentName(Component) {
  return Component.displayName || "Component wrapped by resolveXYScales";
}

function hasScaleFor(scalesObj, key) {
  return _.isObject(scalesObj) && isValidScale(scalesObj[key]);
}
function hasXYScales(scale) {
  return _.isObject(scale) && isValidScale(scale.x) && isValidScale(scale.y);
}
function hasXYDomains(domain) {
  return _.isObject(domain) && isValidDomain(domain.x) && isValidDomain(domain.y);
}
function hasXYScaleTypes(scaleType) {
  return _.isObject(scaleType) && _.isString(scaleType.x) && _.isString(scaleType.y);
}

function mapStaticOnChildren(children, methodName, args=[]) {
  // returns the result of looping over all children and calling a static method on each one
  // by convention, this passes the child's props as the first argument, followed by any arguments provided
  return _.compact(React.Children.map(children, child => {
    console.log(_.keys(child.type));
    return _.isFunction(child.type[methodName]) ?
      child.type[methodName].apply(this, [child.props].concat(args)) : null;
  }));
}


function omitNullUndefined(obj) {
  return _.omitBy(obj, v => _.isUndefined(v) || _.isNull(v));
}

export default function resolveXYScales(ComposedComponent) {
  return class extends React.Component {
    static defaultProps = ComposedComponent.defaultProps;
    // todo better way for HOC's to pass statics through?
    static getScaleType = ComposedComponent.getScaleType;
    static getDomain = ComposedComponent.getDomain;


    _resolveScaleType(props, Component) {
      const propsScaleType = props.scaleType || {};

      // short-circuit if all scale types provided
      if(hasXYScaleTypes(propsScaleType)) return propsScaleType;

      // start with any scale types in props, try to resolve the rest
      let scaleType = omitNullUndefined(propsScaleType);

      // if Component provides a custom static getScaleType method
      // use it to determine remaining scale types
      if(_.isFunction(Component.getScaleType)) {
        console.log('getscaletype')
        const componentScaleType = omitNullUndefined(Component.getScaleType(props));
        scaleType = _.assign(componentScaleType, scaleType);
        if(hasXYScaleTypes(scaleType)) return scaleType;
      }

      // if Component has data or datasets props,
      // infer the data type, & use that to get scale type
      if(_.isArray(props.data) || _.isArray(props.datasets)) {
        const datasets = _.isArray(props.datasets) ? props.datasets : [props.data];
        const datasetScaleType = _.fromPairs(['x', 'y'].map(k => {
          const kAccessor = makeAccessor(_.get(props, `getValue.${k}`));
          const kDataType = inferDatasetsType(datasets, kAccessor);
          const kScaleType = scaleTypeFromDataType(kDataType);
          return [k, kScaleType];
        }));

        scaleType = _.assign(datasetScaleType, scaleType);
        return scaleType;
      }

      // if Component has children,
      // recurse through descendants to resolve their scale types the same way
      if(React.Children.count(props.children)) {
        console.log('get scaletype from children')
        let childScaleTypes = [];
        React.Children.forEach(props.children, child => {
          childScaleTypes = childScaleTypes.concat(this._resolveScaleType(child.props, child.type));
        });
        console.log('childScaleTypes', childScaleTypes);

        const childScaleType =  _.fromPairs(['x', 'y'].map(k => {
          // todo warn on multiple scale types, probably not what you want
          const kScaleType = (_.compact(_.uniq(_.map(childScaleTypes, k))).length === 1) ?
            childScaleTypes[0][k] : "ordinal";
          return [k, kScaleType];
        }));

        scaleType = _.assign(childScaleType, scaleType);
        return scaleType;
      }
    }

    _resolveDomain(props, Component, scaleType) {
      const propsDomain = props.domain || {};

      // short-circuit if all domains provided
      if(hasXYDomains(propsDomain)) return propsDomain;

      // start with any domains in props, and try to resolve the rest
      let domain = omitNullUndefined(propsDomain);

      // if Component provides a custom static getDomain method
      // use it to determine remaining domains
      if(_.isFunction(Component.getDomain)) {
        const componentDomain = omitNullUndefined(Component.getDomain({scaleType, ...props}));
        console.log('Component.getDomain', componentDomain);
        domain = _.assign(componentDomain, domain);
        if(hasXYDomains(domain)) return domain;
      }

      // if Component has data or datasets props,
      // use the default domainFromDatasets function to determine a domain from them
      if(_.isArray(props.data) || _.isArray(props.datasets)) {
        const datasets = _.isArray(props.datasets) ? props.datasets : [props.data];
        const datasetDomain = _.fromPairs(['x', 'y'].map(k => {
          const kAccessor = makeAccessor(_.get(props, `getValue.${k}`));
          const dataType = dataTypeFromScaleType(scaleType[k]);
          const kDomain = domainFromDatasets(datasets, kAccessor, dataType);
          return [k, kDomain];
        }));
        console.log('datasetDomain', datasetDomain);

        domain = _.assign(datasetDomain, domain);
        if(hasXYDomains(domain)) return domain;
      }

      // if Component has children,
      // recurse through descendants to resolve their domains the same way,
      // and combine them into a single domain, if there are multiple
      if(React.Children.count(props.children)) {
        console.log('get domain from children');
        let childDomains = [];
        React.Children.forEach(props.children, child => {
          childDomains = childDomains.concat(this._resolveDomain(child.props, child.type, scaleType));
        });

        console.log('combining domains', childDomains);
        const childDomain =  _.fromPairs(['x', 'y'].map(k => {
          const kDomain = combineDomains(_.compact(_.map(childDomains, k)), scaleType[k]);
          return [k, kDomain];
        }));
        console.log('combined domains', childDomain);

        domain = _.assign(childDomain, domain);
        if(hasXYDomains(domain)) return domain;
      }
    }

    _resolveMargin(props, Component, scaleType) {
      const propsDomain = props.domain || {};

      // short-circuit if all domains provided
      if(hasXYDomains(propsDomain)) return propsDomain;

      // start with any domains in props, and try to resolve the rest
      let domain = omitNullUndefined(propsDomain);

      // if Component provides a custom static getDomain method
      // use it to determine remaining domains
      if(_.isFunction(Component.getDomain)) {
        const componentDomain = omitNullUndefined(Component.getDomain({scaleType, ...props}));
        console.log('Component.getDomain', componentDomain);
        domain = _.assign(componentDomain, domain);
        if(hasXYDomains(domain)) return domain;
      }

      // if Component has data or datasets props,
      // use the default domainFromDatasets function to determine a domain from them
      if(_.isArray(props.data) || _.isArray(props.datasets)) {
        const datasets = _.isArray(props.datasets) ? props.datasets : [props.data];
        const datasetDomain = _.fromPairs(['x', 'y'].map(k => {
          const kAccessor = makeAccessor(_.get(props, `getValue.${k}`));
          const dataType = dataTypeFromScaleType(scaleType[k]);
          const kDomain = domainFromDatasets(datasets, kAccessor, dataType);
          return [k, kDomain];
        }));
        console.log('datasetDomain', datasetDomain);

        domain = _.assign(datasetDomain, domain);
        if(hasXYDomains(domain)) return domain;
      }

      // if Component has children,
      // recurse through descendants to resolve their domains the same way,
      // and combine them into a single domain, if there are multiple
      if(React.Children.count(props.children)) {
        console.log('get domain from children');
        let childDomains = [];
        React.Children.forEach(props.children, child => {
          childDomains = childDomains.concat(this._resolveDomain(child.props, child.type, scaleType));
        });

        console.log('combining domains', childDomains);
        const childDomain =  _.fromPairs(['x', 'y'].map(k => {
          const kDomain = combineDomains(_.compact(_.map(childDomains, k)), scaleType[k]);
          return [k, kDomain];
        }));
        console.log('combined domains', childDomain);

        domain = _.assign(childDomain, domain);
        if(hasXYDomains(domain)) return domain;
      }
    }

    _resolveMargin(props, scale) {
      const marginKeys = ['top', 'bottom', 'left', 'right'];
      const propsMargin = props.margin || {};

      if(_.every(marginKeys, k => _.has(propsMargin, k))) {
        // short-circuit if margins provided
        return propsMargin;

      } else {
        // get margin from component, passing the scale (used for generating/measuring labels)
        const childMargin = ComposedComponent.getMargin({scale, ...props});

        return _.some(marginKeys, k => _.has(propsMargin, k)) ?
          // some margins provided, merge them with those provided by child
          _.assign({}, childMargin, propsMargin) :
          // no margin provided at all, just return margin from Component
          childMargin;
      }
    }

    _makeScales({width, height, scaleType={}, domain={}, margin={}, scale={}}) {
      const range = {
        x: innerRangeX(width, margin),
        y: innerRangeY(height, margin)
      };
      // create scales from domains and ranges
      return _.fromPairs(['x', 'y'].map(k => [k,
        hasScaleFor(scale, k) ?
          scale[k] : // use existing scales if provided, otherwise create new
          initScale(scaleType[k]).domain(domain[k]).range(range[k])
      ]));
    }

    render() {
      console.log('xyScales Props', this.props);
      const {props} = this;
      const {width, height} = props;
      const scaleFromProps = this.props.scale || {};

      // short-circuit if scales provided
      // todo warn/throw if bad scales are passed
      if(hasXYScales(scaleFromProps))
        return <ComposedComponent {...this.props} />;

      // scales not provided, so we have to resolve them
      // first resolve scale types
      const scaleType = this._resolveScaleType(props, ComposedComponent);
      console.log('scaleType', scaleType);

      // then resolve the domains
      const domain = this._resolveDomain(props, ComposedComponent, scaleType);
      console.log('domain ', domain);

      // create a temporary scale with size & domain, which may be used by the Component to calculate the margins
      // (eg. to create and measure labels for the scales)
      const tempScale = this._makeScales({width, height, scaleType, domain, margin: props.margin, scale: props.scale});

      // then resolve the margins
      const margin = this._resolveMargin(props, tempScale);
      console.log('margin', margin);

      // create real scales from resolved margins
      const scale = _.isEqual(margin, props.margin) ?
        tempScale : // don't re-create scales if margin hasn't changed (ie. was passed in props)
        this._makeScales({width, height, scaleType, domain, margin, scale: props.scale});

      console.log('created scale domains', _.mapValues(scale, s => s.domain()));
      console.log('created scale ranges', _.mapValues(scale, s => s.range()));

      // and pass scales to wrapped component
      const passedProps = _.assign({scale, scaleType, margin, domain}, this.props);
      return <ComposedComponent {...passedProps} />;
    }
  }
}
