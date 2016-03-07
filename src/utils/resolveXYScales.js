import _ from 'lodash';
import React from 'react';
import invariant from 'invariant';

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

function hasXYScales(props) {
  return _.every(['x', 'y'], k => hasScaleFor(props.scale, k))
}
function hasScaleFor(scalesObj, key) {
  return _.isObject(scalesObj) && isValidScale(scalesObj[key]);
}
function isValidScale(scale) {
  return _.isFunction(scale) && _.isFunction(scale.domain) && _.isFunction(scale.range);
}

function isValidDomain(domain) {
  return _.isArray(domain) && domain.length;
}
function combineDomains(domains) {
  return d3.extent(_.flatten(domains));
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

function resolveScale() {

}

const innerWidth = (width, margin={}) => width - ((margin.left || 0) + (margin.right || 0));
const innerHeight = (height, margin={}) => height - ((margin.top || 0) + (margin.bottom || 0));

function innerRangeX(outerWidth, margin={}) {
  const left = margin.left || 0;
  return [left, left + innerWidth(outerWidth, margin)];
}
function innerRangeY(outerHeight, margin={}) {
  const top = margin.top || 0;
  return [top + innerHeight(outerHeight, margin), top];
}


export default function resolveXYScales(ComposedComponent) {
  return class extends React.Component {

    _resolveDomain(props) {
      const propsDomain = props.domain || {};

      if(_.every(['x', 'y'], k => isValidDomain(propsDomain[k]))) {
        // short-circuit if domains provided
        return propsDomain;

      } else {
        // call static getDomain on Component to determine remaining domains
        const childDomain = ComposedComponent.getDomain(props);
        return _.fromPairs(['x', 'y'].map(k =>
          [k, isValidDomain(propsDomain[k]) ? propsDomain[k] : childDomain[k]]
        ));
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

    render() {
      const {props} = this;
      const scaleFromProps = this.props.scale || {};

      if(_.every(['x', 'y'], k => isValidScale(scaleFromProps[k])))
        // short-circuit if scales provided
        // todo warn/throw if bad scales are passed
        return <ComposedComponent {...this.props} />;

      // scales not provided, so we have to resolve them
      // first resolve the domains
      const domain = this._resolveDomain(props);
      console.log('domain ', domain);

      // create a temporary scale with size & domain, which may be used by the Component to calculate the margins
      // (eg. to create and measure labels for the scales)
      const tempRange = {
        x: [0, props.width],
        y: [props.height, 0]
      };
      const tempScale = _.fromPairs(['x', 'y'].map(k =>
        // todo all scale types
        // todo infer scale type from data
        [k, d3.scale.linear().domain(domain[k]).range(tempRange[k])]
      ));

      //// then resolve the margins
      const margin = this._resolveMargin(props, tempScale);
      console.log('margin', margin);

      // margins & size give range
      const range = {
        //x: [0, this.props.width],
        //y: [this.props.height, 0]
        x: innerRangeX(props.width, margin),
        y: innerRangeY(props.height, margin)
      };
      console.log('range', range);

      // create scales from domains and ranges
      const scale = _.fromPairs(['x', 'y'].map(k => {
        return hasScaleFor(scaleFromProps, k) ?
          scaleFromProps[k] :
          [k, d3.scale.linear().domain(domain[k]).range(range[k])];
      }));

      // and pass scales to wrapped component
      const passedProps = _.assign({scale, margin}, this.props);
      return <ComposedComponent {...passedProps} />;
    }
  }
}
