import _ from 'lodash';
import React from 'react';
import invariant from 'invariant';

import {
  makeAccessor,
  domainFromDatasets,
  domainFromData,
  inferDatasetsType,
  datasetsFromPropsOrDescendants,
  combineDomains,
  isValidDomain
} from './Data';

import {
  scaleTypeFromDataType,
  dataTypeFromScaleType,
  inferDataTypeFromDomain,
  initScale,
  isValidScale
} from './Scale';

import {innerRangeX, innerRangeY} from './Margin';

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
function hasAllMargins(margin) {
  const marginKeys = ['top', 'bottom', 'left', 'right'];
  return _.isObject(margin) && _.every(marginKeys, k => _.has(margin, k));
}

function hasGoodXY(obj, isValid = (v => !_.isUndefined(v))) {
  return _.isObject(obj) && isValid(obj.x)
}

function mapStaticOnChildren(children, methodName, passProps = {}) {
  // returns the result of looping over all children and calling a static method on each one
  return _.compact(React.Children.map(children, child => {
    console.log(_.keys(child.type));
    return _.isFunction(child.type[methodName]) ?
      child.type[methodName]({...child.props, ...passProps}) : null;
  }));
}


function omitNullUndefined(obj) {
  return _.omitBy(obj, v => _.isUndefined(v) || _.isNull(v));
}

function resolveXYPropsOnComponentOrChildren(propKeys, props, reducers = {}, validators = {}, result = {}) {
  const isDone = (o) => (_.every(propKeys, k => _.isObject(o[k]) && _.every(['x', 'y'], xy => _.has(o[k][xy]))));
  result = _.pick({...props, ...result}, propKeys);

  let resolved = {};
  _.forEach(propKeys, propKey => {
    _.forEach(['x', 'y'], k => {
      const isValid = validators[propKey] || (() => true);
      if(_.isObject(props[propKey]) && _.has(props[propKey], k) && isValid(props[propKey][k])) {
        if(!_.has(result, propKey)) result[propKey] = {};
        result[propKey][k] = props[propKey][k];
      }
    });
  });

  if(isDone(result)) return result;

  if(React.Children.count(props.children)) {
    let childProps = [];
    React.Children.forEach(props.children, child => {
      if(!child) return;
      childProps.push(resolveXYPropsOnComponentOrChildren(propKeys, child.props, result));
    });

    // let childDomains = [];
    // React.Children.forEach(props.children, child => {
    //   childDomains = childDomains.concat(this._resolveDomain(child.props, child.type, scaleType));
    // });
    //
    // console.log('combining domains', childDomains);
    // const childDomain =  _.fromPairs(['x', 'y'].map(k => {
    //   console.log(_.compact(_.map(childDomains, k)), scaleType[k]);
    //   const kDomain = combineDomains(_.compact(_.map(childDomains, k)), dataTypeFromScaleType(scaleType[k]));
    //   console.log(kDomain);
    //   return [k, kDomain];
    // }));
    // console.log('combined domains', childDomain);
    //
    // domain = _.assign(childDomain, domain);
    // return domain;
  }

  propKeys.forEach(k => {
    result[propKeys] = props
  })
}



export default function resolveXYScales(ComposedComponent) {
  return class extends React.Component {
    static defaultProps = _.defaults(ComposedComponent.defaultProps, {
      invertScale: {x: false, y: false},
      // nice: {x: true, y: true},
      // tickCount: {x: 10, y: 10},
      // ticks: {x: null, y: null}
    });

    // todo better way for HOC's to pass statics through?
    static getScaleType = ComposedComponent.getScaleType;
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
        let childScaleTypes = [];
        React.Children.forEach(props.children, child => {
          if(!child) return;
          childScaleTypes.push(this._resolveScaleType(child.props, child.type));
        });
        // console.log('childScaleTypes', childScaleTypes);


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

    // _resolveTicks(props, Component) {
    //   const propsTicks = props.ticks || {};
    //   const hasTicksOrTickCount = (v, k) =>
    //     (_.isArray(_.get(v, `ticks.${k}`)) || _.isFinite(_.get(v, `tickCount.${k}`)));
    //   if(_.every(['x', 'y'], k => hasTicksOrTickCount(props)))
    //     return _.pick(props, ['tick', 'tickCount'])
    //
    // }


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
        // console.log('Component.getDomain', componentDomain);
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
        // console.log('datasetDomain', datasetDomain);

        domain = _.assign(datasetDomain, domain);
        if(hasXYDomains(domain)) return domain;
      }

      // if Component has children,
      // recurse through descendants to resolve their domains the same way,
      // and combine them into a single domain, if there are multiple
      if(React.Children.count(props.children)) {
        let childDomains = [];
        React.Children.forEach(props.children, child => {
          if(!child) return;
          childDomains = childDomains.concat(this._resolveDomain(child.props, child.type, scaleType));
        });

        // console.log('combining domains', childDomains);
        const childDomain =  _.fromPairs(['x', 'y'].map(k => {
          const kDomain = combineDomains(_.compact(_.map(childDomains, k)), dataTypeFromScaleType(scaleType[k]));
          return [k, kDomain];
        }));
        // console.log('combined domains', childDomain);

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
        let childTickDomains = [];
        React.Children.forEach(props.children, child => {
          if(!child) return;
          childTickDomains.push(this._resolveTickDomain(child.props, child.type, scaleType, domain, scale));
        });

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
        // console.log('Component.getMargin', componentMargin);
        margin = _.assign(componentMargin, margin);
        if(hasAllMargins(margin)) return margin;
      }

      // if Component has children,
      // recurse through descendants to resolve their margins the same way,
      // and combine them into a single margin, if there are multiple
      if(React.Children.count(props.children)) {
        let childMargins = [];
        React.Children.forEach(props.children, child => {
          if(!child) return;
          childMargins = childMargins.concat(this._resolveMargin(child.props, child.type, scaleType, domain, scale));
        });

        // console.log('combining child margins', childMargins);
        const childMargin = _.fromPairs(['top', 'bottom', 'left', 'right'].map(k => {
          // combine margins by taking the max value of each margin direction
          return [k, _.get(_.maxBy(childMargins, k), k)];
        }));
        // console.log('combined margins', childMargin);

        margin = _.assign(childMargin, margin);
      }
      return margin;
    }

    _makeScales = ({width, height, scaleType={}, domain={}, margin={}, scale={}}) => {
      const {invertScale, nice, tickCount, ticks} = this.props;
      const range = {
        x: innerRangeX(width, margin).map(v => v - (margin.left || 0)),
        y: innerRangeY(height, margin).map(v => v - (margin.top || 0))
      };
      // console.log(height, margin, innerRangeY(height, margin));


      // console.log('range', range);
      return _.fromPairs(['x', 'y'].map(k => {
        // use existing scales if provided, otherwise create new
        if(hasScaleFor(scale, k)) return [k, scale[k]];

        // create scale from domain/range
        const rangeMethod = (scaleType[k] === 'ordinal') ? 'rangePoints' : 'range';
        const kScale = initScale(scaleType[k])
          .domain(domain[k])[rangeMethod](range[k]);




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
      // console.log('xyScales Props', this.props);
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
      // console.log('scaleType', scaleType);
      // console.log('domain ', domain);

      // create a temporary scale with size & domain, which may be used by the Component to calculate margin/tickDomain
      // (eg. to create and measure labels for the scales)
      let tempScale = this._makeScales({width, height, scaleType, domain, margin: props.margin, scale: props.scale});

      // getTickDomain gives children the opportunity to modify the domain to include their scale ticks
      // (can't happen in getDomain, because it can't be done until the base domain/tempScale has been created)
      const tickDomain = this._resolveTickDomain(props, ComposedComponent, scaleType, domain, tempScale);
      if(_.isObject(tickDomain)) {
        ['x', 'y'].forEach(k => {
          const dataType = dataTypeFromScaleType(scaleType[k]);
          if(isValidDomain(tickDomain[k], dataType))
            domain[k] = combineDomains([domain[k], tickDomain[k]], dataType);
        })
      }
      // update tempScale to use new domain before creating margins
      tempScale = this._makeScales({width, height, scaleType, domain, margin: props.margin, scale: props.scale});

      // then resolve the margins
      const margin = _.defaults(
        this._resolveMargin(props, ComposedComponent, scaleType, domain, tempScale),
        {top: 0, bottom: 0, left: 0, right: 0}
      );
      // console.log('margin', margin);

      // create real scales from resolved margins
      const scaleOptions = {scale: props.scale, width, height, scaleType, domain, margin, nice};
      // console.log('making scales', scaleOptions);
      const scale = _.isEqual(margin, props.margin) ?
        tempScale : // don't re-create scales if margin hasn't changed (ie. was passed in props)
        this._makeScales(scaleOptions);


      // and pass scales to wrapped component
      const passedProps = _.assign({}, this.props, {scale, scaleType, margin, domain});
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
