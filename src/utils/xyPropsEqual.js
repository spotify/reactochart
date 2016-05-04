import _ from 'lodash';
import shallowEqual from './shallowEqual';
import {scaleEqual} from './Scale';

export default function xyPropsEqual(propsA, propsB) {
  // const start = performance.now();
  const deepishProps = ['margin', 'scaleType'];
  const deeperProps = ['domain'];
  const deepProps = deepishProps.concat(deeperProps).concat('scale');

  const isEqual =
    shallowEqual(_.omit(propsA, deepProps), _.omit(propsB, deepProps)) &&
    _.every(deepishProps, (key) => shallowEqual(propsA[key], propsB[key])) &&
    _.every(deeperProps, (key) => _.isEqual(propsA[key], propsB[key])) &&
    _.every(['x', 'y'], (key) => scaleEqual(propsA.scale[key], propsB.scale[key]));

  // console.log('xyProps isEqual', isEqual);
  // console.log('took', performance.now() - start);
  return isEqual;
}
