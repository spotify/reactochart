import _ from "lodash";

// convenience function for event callbacks... we often want to say
// "if this.props.onThing is a function, call this.onThing(e) (which will do stuff, then call this.props.onThing)"
export function methodIfFuncProp(propName, props, context) {
  return _.isFunction(props[propName]) && _.isFunction(context[propName])
    ? context[propName]
    : null;
}

export function hasOneOfTwo(a, b) {
  return (
    _.some([a, b], _.isUndefined) && _.some([a, b], v => !_.isUndefined(v))
  );
}
