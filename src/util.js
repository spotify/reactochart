import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';

export const AccessorPropType =
    PropTypes.oneOfType(PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.func);

export function accessor(key) {
    return _.isFunction(key) ? key :                       // pass an accessor function...
        _.isNull(key) || _.isUndefined(key) ? _.identity : // or null/undefined to just return the item itself...
        _.property(key);                                   // or an array index or object key
}


// InterfaceMixin takes a list of string "interfaces"
// and adds a static called implementsInterface to the component that simply checks if an interface is in the list
// This way, a parent component can pass particular props only to children which implement the relevant interface
// by checking child.type.implementsInterface('SomeInterface')
// usage:
// mixins: [InterfaceMixin('SomeInterface')] // or...
// mixins: [InterfaceMixin(['SomeInterface', 'AnotherInterface'])]

export function InterfaceMixin(interfaces) {
    interfaces = _.isString(interfaces) ? [interfaces] : interfaces;
    return {
        statics: {
            implementsInterface(name) { return interfaces.indexOf(name) > -1; }
        }
    }
}

// convenience function for event callbacks... we often want to say
// "if this.props.onThing is a function, call this.onThing(e) (which will do stuff, then call this.props.onThing)"
export function methodIfFuncProp(propName, props, context) {
    return _.isFunction(props[propName]) && _.isFunction(context[propName]) ?
        context[propName] : null;
}