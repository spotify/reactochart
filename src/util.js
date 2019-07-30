import isFunction from "lodash/isFunction";
import some from "lodash/some";
import isUndefined from "lodash/isUndefined";

/**
 * Convenience function for event callbacks... we often want to say
 * "if this.props.onThing is a function, call this.onThing(e), which will do stuff, then call this.props.onThing"
 * @param {String} propName - name of prop (func name)
 * @param {Object} props - props from component
 * @param {Function} context - component context
 * @param
 */
export function methodIfFuncProp(propName, props, context) {
  return isFunction(props[propName]) && isFunction(context[propName])
    ? context[propName]
    : null;
}

/**
 * Binds arguments to given fn after arguments provided to the fn
 * @param {Function} fn - function to be called
 * @param  {...any} args - arguments to be appended to the function
 */
export function bindTrailingArgs(fn, ...boundArgs) {
  return function(...args) {
    return fn(...args, ...boundArgs);
  };
}

export function hasOneOfTwo(a, b) {
  return some([a, b], isUndefined) && some([a, b], v => !isUndefined(v));
}
