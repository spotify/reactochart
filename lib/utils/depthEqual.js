'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = depthEqual;
// Based on https://github.com/acdlite/recompose/blob/master/src/packages/recompose/shallowEqual.js

var hasOwnProperty = Object.prototype.hasOwnProperty;

function depthEqual(objA, objB) {
  var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  if (objA === objB) {
    return true;
  }

  if (depth === 0 || (typeof objA === 'undefined' ? 'undefined' : _typeof(objA)) !== 'object' || objA === null || (typeof objB === 'undefined' ? 'undefined' : _typeof(objB)) !== 'object' || objB === null) {
    // console.log('different obj', objA, objB);
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  var bHasOwnProperty = hasOwnProperty.bind(objB);
  for (var i = 0; i < keysA.length; i++) {
    var aKey = keysA[i];
    if (!bHasOwnProperty(aKey) ||
    // recursively call depthEqual at the next level; depth 0 is === check
    !depthEqual(objA[aKey], objB[aKey], depth - 1)) {
      // console.log('different key', aKey, objA, objB);
      return false;
    }
  }

  return true;
}