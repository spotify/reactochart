import React from 'react';
import {
  scaleLinear,
  scaleTime,
  scaleOrdinal,
  scaleLog,
  scalePoint,
  scalePow,
} from 'd3-scale';

import {
  scaleTypeFromDataType,
  dataTypeFromScaleType,
  inferScaleType,
  initScale,
  isValidScale,
  invertPointScale,
  indexOfClosestNumberInList,
} from '../../../src/utils/Scale';

describe('Scale utils', () => {
  describe('scaleTypeFromDataType', () => {
    it('returns scale types given data types', () => {
      expect(scaleTypeFromDataType('number')).toEqual('linear');
      expect(scaleTypeFromDataType('time')).toEqual('time');
      expect(scaleTypeFromDataType('categorical')).toEqual('ordinal');
    });

    it('returns `ordinal` for unknown data types', () => {
      expect(scaleTypeFromDataType('chewbacca')).toEqual('ordinal');
    });
  });

  describe('dataTypeFromScaleType', () => {
    it('returns data types given scale types', () => {
      expect(dataTypeFromScaleType('linear')).toEqual('number');
      expect(dataTypeFromScaleType('log')).toEqual('number');
      expect(dataTypeFromScaleType('pow')).toEqual('number');
      expect(dataTypeFromScaleType('time')).toEqual('time');
      expect(dataTypeFromScaleType('ordinal')).toEqual('categorical');
    });

    it('returns `categorical` for unknown scale types', () => {
      expect(dataTypeFromScaleType('chewbacca')).toEqual('categorical');
    });
  });

  describe('inferScaleType', () => {
    it('infers the correct scale type, given a scale', () => {
      expect(inferScaleType(scaleLinear())).toEqual('linear');
      expect(inferScaleType(scaleTime())).toEqual('time');
      expect(inferScaleType(scaleOrdinal())).toEqual('ordinal');
      expect(inferScaleType(scaleLog())).toEqual('log');
      expect(inferScaleType(scalePow())).toEqual('pow');
    });
  });

  describe('initScale', () => {
    it('creates a scale of the correct type, given a scale type', () => {
      const linearScale = initScale('linear')
        .domain([0, 1])
        .range([100, 200]);
      expect(inferScaleType(linearScale)).toEqual('linear');
      expect(linearScale(0.5)).toEqual(150);

      expect(inferScaleType(initScale('time'))).toEqual('time');
      expect(inferScaleType(initScale('ordinal'))).toEqual('ordinal');
      expect(inferScaleType(initScale('log'))).toEqual('log');
      expect(inferScaleType(initScale('pow'))).toEqual('pow');
    });
  });

  describe('isValidScale', () => {
    it('returns true for all known scale types', () => {
      expect(isValidScale(scaleLinear())).toEqual(true);
      expect(isValidScale(scaleTime())).toEqual(true);
      expect(isValidScale(scaleOrdinal())).toEqual(true);
      expect(isValidScale(scaleLog())).toEqual(true);
      expect(isValidScale(scalePow())).toEqual(true);
    });
    it('returns false for non-scale things', () => {
      expect(isValidScale(9)).toEqual(false);
      expect(isValidScale(true)).toEqual(false);
      expect(isValidScale([4, 5])).toEqual(false);
      expect(isValidScale({ range: [0, 100], domain: [500, 1000] })).toEqual(
        false,
      );
    });
  });

  describe('indexOfClosestNumberInList', () => {
    it('returns index of closest to the number in the array', () => {
      expect(indexOfClosestNumberInList(1.5, [5, 4, 3, 2, 1])).toEqual(3);
      expect(indexOfClosestNumberInList(1.5, [1, 2, 3, 4, 5])).toEqual(0);
    });
  });

  describe('invertPointScale', () => {
    it('returns a valid value for given rangeValue', () => {
      const scale = scalePoint()
        .domain(['a', 'b', 'c', 'd', 'e'])
        .range([0, 100]);

      expect(invertPointScale(scale, 0)).toEqual('a');
      expect(invertPointScale(scale, 26)).toEqual('b');
      expect(invertPointScale(scale, 51)).toEqual('c');
      expect(invertPointScale(scale, 76)).toEqual('d');
      expect(invertPointScale(scale, 101)).toEqual('e');
    });
  });
});
