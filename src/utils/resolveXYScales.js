import _ from 'lodash';
import {scalePoint} from 'd3';
import React from 'react';
import invariant from 'invariant';

import {
  makeAccessor,
  domainFromDatasets,
  domainFromData,
  inferDatasetsType,
  datasetsFromPropsOrDescendants,
  combineDomains,
  combineBorderObjects,
  isValidDomain
} from './Data';

import {
  scaleTypeFromDataType,
  dataTypeFromScaleType,
  inferDataTypeFromDomain,
  initScale,
  isValidScale
} from './Scale';

import {innerRangeX, innerRangeY, innerWidth, innerHeight} from './Margin';

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
function hasPaddingFor(paddingObj, key) {
  return _.isObject(paddingObj) && _.isNumber(paddingObj[key]);
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
function hasAllMargins(margin) {
  const marginKeys = ['top', 'bottom', 'left', 'right'];
  return _.isObject(margin) && _.every(marginKeys, k => _.has(margin, k));
}
function hasAllSpacing(spacing) {
  const spacingKeys = ['top', 'bottom', 'left', 'right'];
  return _.isObject(spacing) && _.every(spacingKeys, k => _.has(spacing, k));
}

function mapOverChildren(children, iteratee, ...iterateeArgs) {
  // loop over all children (react elements) and call iteratee (a function) on each one
  // iteratee is called with parameters (child.props, child.type, ...iterateeArgs)
  if(!_.isFunction(iteratee)) throw new Error('mapOverChildren iteratee must be a function');

  return _.compact(React.Children.map(children, child => {
    if(!child || !React.isValidElement(child)) return null;
    return iteratee(child.props, child.type, ...iterateeArgs);
  }));
}
function omitNullUndefined(obj) {
  return _.omitBy(obj, v => _.isUndefined(v) || _.isNull(v));
}

// not currently being used but potentially has some learnings
// function resolveXYPropsOnComponentOrChildren(propKeys, props, reducers = {}, validators = {}, result = {}) {
//   const isDone = (o) => (_.every(propKeys, k => _.isObject(o[k]) && _.every(['x', 'y'], xy => _.has(o[k][xy]))));
//   result = _.pick({...props, ...result}, propKeys);

//   let resolved = {};
//   _.forEach(propKeys, propKey => {
//     _.forEach(['x', 'y'], k => {
//       const isValid = validators[propKey] || (() => true);
//       if(_.isObject(props[propKey]) && _.has(props[propKey], k) && isValid(props[propKey][k])) {
//         if(!_.has(result, propKey)) result[propKey] = {};
//         result[propKey][k] = props[propKey][k];
//       }
//     });
//   });

//   if(isDone(result)) return result;

//   if(React.Children.count(props.children)) {
//     let childProps = mapOverChildren(props.children, resolveXYPropsOnComponentOrChildren, propKeys, 'props', result);
//     React.Children.forEach(props.children, child => {
//       if(!child) return;
//       childProps.push(resolveXYPropsOnComponentOrChildren(propKeys, child.props, result));
//     });
//       let childDomains = [];
//       React.Children.forEach(props.children, child => {
//         childDomains = childDomains.concat(this._resolveDomain(child.props, child.type, scaleType));
//       });

//       console.log('combining domains', childDomains);
//       const childDomain =  _.fromPairs(['x', 'y'].map(k => {
//         console.log(_.compact(_.map(childDomains, k)), scaleType[k]);
//         const kDomain = combineDomains(_.compact(_.map(childDomains, k)), dataTypeFromScaleType(scaleType[k]));
//         console.log(kDomain);
//         return [k, kDomain];
//       }));
//       console.log('combined domains', childDomain);

//       domain = _.assign(childDomain, domain);
//       return domain;
//   }

//   propKeys.forEach(k => {
//     result[propKeys] = props
//   })
// }



export default function resolveXYScales(ComposedComponent) {
  return class extends React.Component {
    static defaultProps = _.defaults(ComposedComponent.defaultProps, {
      invertScale: {x: false, y: false},
    });

    // todo better way for HOC's to pass statics through?
    static getScaleType = ComposedComponent.getScaleType; 
    static getSpacing = ComposedComponent.getSpacing;
    static getDomain = ComposedComponent.getDomain;
    static getMargin = ComposedComponent.getMargin;

    _resolveScaleType(props, Component) {
      const propsScaleType = props.scaleType || {};

      // short-circuit if all scale types provided
      if(hasXYScaleTypes(propsScaleType)) return propsScaleType;

      // start with any scale types in props, try to resolve the rest
      let scaleType = omitNullUndefined(propsScaleType);

      // if Component provides a custom static getScaleType method
      // use it to determine remaining scale types
      if(_.isFunction(Component.getScaleType)) {
        const componentScaleType = omitNullUndefined(Component.getScaleType(props));
        scaleType = _.assign(componentScaleType, scaleType);
        if(hasXYScaleTypes(scaleType)) return scaleType;
      }

      // todo infer scaleType from domain?
      // if component has domain props,
      // infer the data type, & use that to get scale type
      if(_.isObject(props.domain) && (isValidDomain(props.domain.x) || isValidDomain(props.domain.y))) {
        // console.log('inferring scale type from domain');
        const domainScaleType = _.fromPairs(['x', 'y'].map(k => {
          const domain = props.domain[k];
          return isValidDomain(domain) ?
            [k, scaleTypeFromDataType(inferDataTypeFromDomain(domain))] :
            [k, undefined];
        }));
        scaleType = _.assign(domainScaleType, scaleType);
        if(hasXYScaleTypes(scaleType)) return scaleType;
      }

      // if Component has data or datasets props,
      // infer the data type, & use that to get scale type
      if(_.isArray(props.data) || _.isArray(props.datasets)) {
        const datasets = _.isArray(props.datasets) ? props.datasets : [props.data];
        const datasetScaleType = _.fromPairs(['x', 'y'].map(k => {
          // const kAccessor = makeAccessor(_.get(props, `getValue.${k}`));
          const kAccessor = makeAccessor(_.get(props, `get${k.toUpperCase()}`));
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
        // console.log('get scaletype from children')
        let childScaleTypes = mapOverChildren(props.children, this._resolveScaleType);

        const childScaleType =  _.fromPairs(['x', 'y'].map(k => {
          // todo warn on multiple scale types, probably not what you want
          const kScaleTypes = _.compact(_.uniq(_.map(childScaleTypes, k)));
          const kScaleType = (kScaleTypes.length === 1) ? kScaleTypes[0] : "ordinal";
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
        domain = _.assign(componentDomain, domain);
        if(hasXYDomains(domain)) return domain;
      }

      // if Component has data or datasets props,
      // use the default domainFromDatasets function to determine a domain from them
      if(_.isArray(props.data) || _.isArray(props.datasets)) {
        const datasets = _.isArray(props.datasets) ? props.datasets : [props.data];
        const datasetDomain = _.fromPairs(['x', 'y'].map(k => {
          // const kAccessor = makeAccessor(_.get(props, `getValue.${k}`));
          const kAccessor = makeAccessor(_.get(props, `get${k.toUpperCase()}`));
          const dataType = dataTypeFromScaleType(scaleType[k]);
          const kDomain = domainFromDatasets(datasets, kAccessor, dataType);
          return [k, kDomain];
        }));

        domain = _.assign(datasetDomain, domain);
        if(hasXYDomains(domain)) return domain;
      }

      // if Component has children,
      // recurse through descendants to resolve their domains the same way,
      // and combine them into a single domain, if there are multiple
      if(React.Children.count(props.children)) {
        let childDomains = mapOverChildren(props.children, this._resolveDomain, scaleType);

        const childDomain =  _.fromPairs(['x', 'y'].map(k => {
          const kDomain = combineDomains(_.compact(_.map(childDomains, k)), dataTypeFromScaleType(scaleType[k]));
          return [k, kDomain];
        }));

        domain = _.assign(childDomain, domain);
        return domain;
      }
    }

    _resolveTickDomain(props, Component, scaleType, domain, scale) {
      // todo resolve directly from ticks/tickCount props?
      if(_.isFunction(Component.getTickDomain)) {
        return omitNullUndefined(Component.getTickDomain({scaleType, domain, scale, ...props}));
      }

      if(React.Children.count(props.children)) {
        let childTickDomains = mapOverChildren(props.children, this._resolveTickDomain, scaleType, domain, scale);

        const tickDomain = _.fromPairs(['x', 'y'].map(k => {
          const kChildTickDomains = _.compact(childTickDomains.map(v => _.get(v, k)));
          const kTickDomain = kChildTickDomains.length ?
            combineDomains(kChildTickDomains, dataTypeFromScaleType(scaleType[k])) : undefined;
          return [k, kTickDomain];
        }));
        return omitNullUndefined(tickDomain);
      }
    }

    _resolveLabels(props) {

    }
    _resolveSpacing(props, Component, scaleType, domain, scale){
      const propsSpacing = props.spacing || {};

      // short-circuit if all spacings provided
      if(hasAllSpacing(propsSpacing)) return propsSpacing;     

      let spacing = omitNullUndefined(propsSpacing);

      if(_.isFunction(Component.getSpacing)) {
        const componentSpacing = omitNullUndefined(Component.getSpacing({scaleType, domain, scale, ...props}));
        spacing = _.assign(componentSpacing, spacing);
        if(hasAllSpacing(spacing)) return spacing;
      }

      // if Component has children,
      // recurse through descendants to resolve their spacings the same way,
      // and combine them into a single spacing, if there are multiple
      if(React.Children.count(props.children)) {
        let childSpacings = mapOverChildren(props.children, this._resolveSpacing, scaleType, domain, scale);

        const childSpacing = combineBorderObjects(childSpacings);

        spacing = _.assign(childSpacing, spacing);
      }
      return spacing;

    }
    _resolveMargin(props, Component, scaleType, domain, scale) {
      const propsMargin = props.margin || {};

      // short-circuit if all margins provided
      if(hasAllMargins(propsMargin)) return propsMargin;

      // start with any margins in props, and try to resolve the rest
      let margin = omitNullUndefined(propsMargin);

      // if Component provides a custom static getMargin method
      // use it to determine remaining domains
      if(_.isFunction(Component.getMargin)) {
        const componentMargin = omitNullUndefined(Component.getMargin({scaleType, domain, scale, ...props}));
        margin = _.assign(componentMargin, margin);
        if(hasAllMargins(margin)) return margin;
      }

      // if Component has children,
      // recurse through descendants to resolve their margins the same way,
      // and combine them into a single margin, if there are multiple
      if(React.Children.count(props.children)) {
        let childMargins = mapOverChildren(props.children, this._resolveMargin, scaleType, domain, scale);

        // console.log('combining child margins', childMargins);
        const childMargin = combineBorderObjects(childMargins);

        margin = _.assign(childMargin, margin);
      }
      return margin;
    }

    _makeScales = ({width, height, scaleType={}, domain={}, margin={}, scale={}, spacing={}}) => {
      const {invertScale, nice, tickCount, ticks} = this.props;
      
      const innerChartWidth = innerWidth(width, margin);
      const innerChartHeight = innerHeight(height, margin);

      const range = {
        x: innerRangeX(innerChartWidth, spacing).map(v => v - (spacing.left || 0)),
        y: innerRangeY(innerChartHeight, spacing).map(v => v - (spacing.top || 0))
      };
      //innerRange functions produce range (i.e. [5,20]) and map function normalizes to 0 (i.e. [0,15])

      return _.fromPairs(['x', 'y'].map(k => {
        // use existing scales if provided, otherwise create new
        if(hasScaleFor(scale, k)) return [k, scale[k]];

        // create scale from domain/range
        const kScale = initScale(scaleType[k]).domain(domain[k]).range(range[k]);

        // todo - ticks, nice and getDomain should be an axis prop instead, and axis should have getDomain

        // set `nice` option to round scale domains to nicer numbers
        // if(nice[k] && _.isFunction(kScale.nice)) kScale.nice(tickCount[k] || 10);

        // extend scale domain to include custom `ticks` if passed
        //
        // if(ticks[k]) {
        //   const dataType = dataTypeFromScaleType(scaleType[k]);
        //   const tickDomain = domainFromData(ticks[k], _.identity, dataType);
        //   kScale.domain(combineDomains([kScale.domain(), tickDomain]), dataType);
        // }

        // reverse scale domain if `invertScale` is passed
        if(invertScale[k]) kScale.domain(kScale.domain().reverse());

        return [k, kScale];
      }));
    };

    render() {
      const {props} = this;
      const {width, height, nice} = props;
      const scaleFromProps = this.props.scale || {};

      // short-circuit if scales provided
      // todo warn/throw if bad scales are passed
      if(hasXYScales(scaleFromProps))
        return <ComposedComponent {...this.props} />;

      // scales not provided, so we have to resolve them
      // first resolve scale types and domains
      const scaleType = this._resolveScaleType(props, ComposedComponent);
      const domain = this._resolveDomain(props, ComposedComponent, scaleType);
      let scaleOptions = {width, height, scaleType, domain, margin: props.margin, scale: props.scale, padding: props.padding, spacing: props.spacing};
      // create a temporary scale with size & domain, which may be used by the Component to calculate margin/tickDomain
      // (eg. to create and measure labels for the scales)
      let tempScale = this._makeScales(scaleOptions);

      // getTickDomain gives children the opportunity to modify the domain to include their scale ticks
      // (can't happen in getDomain, because it can't be done until the base domain/tempScale has been created)
      //nice-ing happens in the getTickDomain function inside of _resolveTickDomain
      const tickDomain = this._resolveTickDomain(props, ComposedComponent, scaleType, domain, tempScale);
      if(_.isObject(tickDomain)) {
        ['x', 'y'].forEach(k => {
          const dataType = dataTypeFromScaleType(scaleType[k]);
          if(isValidDomain(tickDomain[k], dataType))
            domain[k] = combineDomains([domain[k], tickDomain[k]], dataType);
        })
      }
      // update tempScale to use new domain before creating margins
      tempScale = this._makeScales(scaleOptions);

      // then resolve the margins
      const margin = _.defaults(
        this._resolveMargin(props, ComposedComponent, scaleType, domain, tempScale),
        {top: 0, bottom: 0, left: 0, right: 0}
      );

      const spacing = _.defaults(
        this._resolveSpacing(props, ComposedComponent, scaleType, domain, tempScale),
        {top: 0, bottom: 0, left: 0, right: 0}
      );

      // create real scales from resolved margins
      scaleOptions = {...scaleOptions, margin, spacing};
      const scale = this._makeScales(scaleOptions);
      
      const passedProps = _.assign({}, this.props, {scale, scaleType, margin, domain, spacing});
      return <ComposedComponent {...passedProps} />;

      // todo spacing/padding
      // todo includeZero
      // todo purerender/shouldcomponentupdate?
      // todo resolve margins if scales are present
      // todo use zero for any margins which can't be resolved
      // todo throw if cannot resolve scaleType
      // todo throw if cannot resolve domain
      // todo check to make sure margins didn't change after scales resolved?
    }
  }
}
