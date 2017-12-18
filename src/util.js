import _ from 'lodash';

// convenience function for event callbacks... we often want to say
// "if this.props.onThing is a function, call this.onThing(e) (which will do stuff, then call this.props.onThing)"
export function methodIfFuncProp(propName, props, context) {
    return _.isFunction(props[propName]) && _.isFunction(context[propName]) ?
        context[propName] : null;
}

export function hasOneOfTwo(a, b) {
    return _.some([a, b], _.isUndefined) && _.some([a, b], v => !_.isUndefined(v));
}

function componentName(Component) {
  return Component.displayName || "Component";
}

function hasSome(obj, keys) {
  return _.isObject(obj) && _.some(keys, k => _.has(obj, k));
}
function hasAll(obj, keys) {
  return _.isObject(obj) && _.every(keys, k => _.has(obj, k));
}
