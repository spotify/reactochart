import isFunction from "lodash/isFunction";

import some from "lodash/some";
import isUndefined from "lodash/isUndefined";

// convenience function for event callbacks... we often want to say
// "if this.props.onThing is a function, call this.onThing(e) (which will do stuff, then call this.props.onThing)"
export function methodIfFuncProp(propName, props, context) {
  return isFunction(props[propName]) && isFunction(context[propName])
    ? context[propName]
    : null;
}

export function hasOneOfTwo(a, b) {
  return some([a, b], _.isUndefined) && some([a, b], v => !isUndefined(v));
}
