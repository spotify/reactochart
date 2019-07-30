import omit from "lodash/omit";
import every from "lodash/every";
import isEqual from "lodash/isEqual";
import get from "lodash/get";
import shallowEqual from "./shallowEqual";
import { scaleEqual } from "./Scale";

// xyPropsEqual is a function used by XYPlot-type charts,
// in their `shouldComponentUpdate` methods, for determining whether next props are the same as previous props.
// in a perfect world this would just be a simple shallow equality check,
// however some props are almost always passed as object/array literals (so they never ===)
// or require special equality checks (eg. d3 scales)

// default list of props to check for *deep equality* using _.isEqual
// can be overridden by components by passing `propKeysToDeepCheck` argument
// todo: decide whether data really belongs on this list? deep-checking data can be slow, but re-rendering is even slower
export const defaultPropKeysToDeepCheck = [
  "margin",
  "scaleType",
  "spacing",
  "domain",
  "style",
  "data" // not worth deepchecking data due to perf issues
];

export default function xyPropsEqual(
  propsA,
  propsB,
  customKeysToDeepCheck = [],
  includeDefaults = true
) {
  const propKeysToDeepCheck = includeDefaults
    ? defaultPropKeysToDeepCheck.concat(customKeysToDeepCheck)
    : customKeysToDeepCheck;

  const propKeysToSkipShallowCheck = propKeysToDeepCheck.concat("scale");

  const equalityCheck =
    // most keys just get shallow-equality checked
    shallowEqual(
      omit(propsA, propKeysToSkipShallowCheck),
      omit(propsB, propKeysToSkipShallowCheck)
    ) &&
    every(propKeysToDeepCheck, key => isEqual(propsA[key], propsB[key])) &&
    every(["x", "y"], key => {
      return scaleEqual(
        get(propsA, `scale[${key}]`),
        get(propsA, `scale[${key}]`)
      );
    });

  return equalityCheck;
}

export function xyPropsEqualDebug(
  propsA,
  propsB,
  customKeysToDeepCheck = [],
  includeDefaults = true
) {
  const propKeysToDeepCheck = includeDefaults
    ? defaultPropKeysToDeepCheck.concat(customKeysToDeepCheck)
    : customKeysToDeepCheck;
  // debug version of xyPropsEqual which console.logs, for figuring out which props are failing equality check
  // const start = performance.now();
  const propKeysToSkipShallowCheck = propKeysToDeepCheck.concat("scale");

  const isEqual =
    // most keys just get shallow-equality checked
    shallowEqual(
      omit(propsA, propKeysToSkipShallowCheck),
      omit(propsB, propKeysToSkipShallowCheck)
    ) &&
    every(propKeysToDeepCheck, key => {
      const isDeepEqual = isEqual(propsA[key], propsB[key]);
      if (!isDeepEqual) console.log(`xyProps: ${key} not equal`);
      return isDeepEqual;
    }) &&
    every(["x", "y"], key => {
      const isScaleEqual = scaleEqual(propsA.scale[key], propsB.scale[key]);
      if (!isScaleEqual) console.log(`xyProps: scale.${key} not equal`);
      return isScaleEqual;
    });

  // console.log('xyProps isEqual', isEqual);
  // console.log('took', performance.now() - start);
  return isEqual;
}
