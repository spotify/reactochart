import _ from 'lodash';
import React from 'react';
import d3 from 'd3';
import TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';

import {
  scaleTypeFromDataType,
  dataTypeFromScaleType,
  inferScaleType,
  initScale,
  isValidScale
} from '../../src/utils/Scale'

describe('Scale utils', () => {
  describe('scaleTypeFromDataType', () => {
    it('returns scale types given data types', () => {
      expect(scaleTypeFromDataType('number')).to.equal('linear');
      expect(scaleTypeFromDataType('time')).to.equal('time');
      expect(scaleTypeFromDataType('categorical')).to.equal('ordinal');
    });

    it('returns `ordinal` for unknown data types', () => {
      expect(scaleTypeFromDataType('chewbacca')).to.equal('ordinal');
    });
  });

  describe('dataTypeFromScaleType', () => {
    it('returns data types given scale types', () => {
      expect(dataTypeFromScaleType('linear')).to.equal('number');
      expect(dataTypeFromScaleType('log')).to.equal('number');
      expect(dataTypeFromScaleType('pow')).to.equal('number');
      expect(dataTypeFromScaleType('time')).to.equal('time');
      expect(dataTypeFromScaleType('ordinal')).to.equal('categorical');
    });

    it('returns `categorical` for unknown scale types', () => {
      expect(dataTypeFromScaleType('chewbacca')).to.equal('categorical');
    });
  });

  describe('inferScaleType', () => {
    it('infers the correct scale type, given a scale', () => {
      expect(inferScaleType(d3.scale.linear())).to.equal('linear');
      expect(inferScaleType(d3.time.scale())).to.equal('time');
      expect(inferScaleType(d3.scale.ordinal())).to.equal('ordinal');
      expect(inferScaleType(d3.scale.log())).to.equal('log');
      expect(inferScaleType(d3.scale.pow())).to.equal('pow');
    });
  });

  describe('initScale', () => {
    it('creates a scale of the correct type, given a scale type', () => {
      const linearScale = initScale('linear').domain([0, 1]).range([100, 200]);
      expect(inferScaleType(linearScale)).to.equal('linear');
      expect(linearScale(0.5)).to.equal(150);

      expect(inferScaleType(initScale('time'))).to.equal('time');
      expect(inferScaleType(initScale('ordinal'))).to.equal('ordinal');
      expect(inferScaleType(initScale('log'))).to.equal('log');
      expect(inferScaleType(initScale('pow'))).to.equal('pow');
    });
  });

  describe('isValidScale', () => {
    it('returns true for all known scale types', () => {
      expect(isValidScale(d3.scale.linear())).to.equal(true);
      expect(isValidScale(d3.time.scale())).to.equal(true);
      expect(isValidScale(d3.scale.ordinal())).to.equal(true);
      expect(isValidScale(d3.scale.log())).to.equal(true);
      expect(isValidScale(d3.scale.pow())).to.equal(true);
    });
    it('returns false for non-scale things', () => {
      expect(isValidScale(9)).to.equal(false);
      expect(isValidScale(true)).to.equal(false);
      expect(isValidScale([4,5])).to.equal(false);
      expect(isValidScale({range: [0,100], domain: [500, 1000]})).to.equal(false);
    });
  });
});
