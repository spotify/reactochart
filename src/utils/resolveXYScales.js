import _ from 'lodash';
import React from 'react';
import invariant from 'invariant';

/**
 * `resolveXYScales` is a higher-order-component.
 *
 * @param {Component} Component - The React Component (class) which should be wrapped by this HOC
 * @returns {Component} - A Component which auto-resolves XY scales from given props
*/

const errs = {};
function componentName(Component) {
  return Component.displayName || "Component wrapped by resolveXYScales";
}

function hasXYScales(props) {
  const scalesObj = props.scale;
  return _.isObject(scalesObj) && _.every(['x', 'y'], k => hasScaleFor(scalesObj, k))
}
function hasScaleFor(scalesObj, key) {
  const scale = scalesObj[key];
  return scale && isValidScale(scale);
}
function isValidScale(scale) {
  return _.isFunction(scale) && _.isFunction(scale.domain) && _.isFunction(scale.range);
}

function resolveScale() {

}

export default function resolveXYScales(ComposedComponent) {
  return class extends React.Component {
    render() {


      const shouldResolveScales = hasXYScales(this.props);
      if(shouldResolveScales) {
        const scalesFromProps = this.props.scale || {};
        // first resolve the domains
        const domainsFromChildren = React.Children.map(this.props.children, child => {
          return _.isFunction(child.type.getDomain) ?
            child.type.getDomain(child.props, this.props) : null;
        });
        // then resolve the margins
        // margins & size give you range
        // then create scales from domains and ranges
      } else {

      }


      const props = _.assign({}, this.props);
      return <ComposedComponent {...props} />;
    }
  }
}
