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
  isValidScale,
  innerWidth,
  innerHeight,
  innerRangeX,
  innerRangeY
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

  describe('innerWidth', () => {
    it('returns inner width value, given outer width and a margin object', () => {
      expect(innerWidth(500)).to.equal(500);
      expect(innerWidth(500, {})).to.equal(500);
      expect(innerWidth(500, {top: 100, bottom: 50})).to.equal(500);
      expect(innerWidth(500, {left: 100, right: 50})).to.equal(350);
      expect(innerWidth(10, {left: 100, right: 50})).to.equal(0);
    });
  });

  describe('innerWidth', () => {
    it('returns inner height value, given outer height and a margin object', () => {
      expect(innerHeight(500)).to.equal(500);
      expect(innerHeight(500, {})).to.equal(500);
      expect(innerHeight(500, {left: 100, right: 50})).to.equal(500);
      expect(innerHeight(500, {top: 100, bottom: 50})).to.equal(350);
      expect(innerHeight(10, {top: 100, bottom: 50})).to.equal(0);
    });
  });

  describe('innerRangeX', () => {
    it('returns inner X-range array, given outer width and a margin object', () => {
      expect(innerRangeX(500)).to.deep.equal([0, 500]);
      expect(innerRangeX(500, {})).to.deep.equal([0, 500]);
      expect(innerRangeX(500, {top: 100, bottom: 50})).to.deep.equal([0, 500]);
      expect(innerRangeX(500, {left: 100, right: 50})).to.deep.equal([100, 450]);
      expect(innerRangeX(10, {left: 100, right: 50})).to.deep.equal([10, 10]);
      expect(innerRangeX(120, {left: 100, right: 50})).to.deep.equal([100, 100]);
    });
  });

  describe('innerRangeY', () => {
    it('returns inner Y-range array, given outer width and a margin object', () => {
      expect(innerRangeY(500)).to.deep.equal([500, 0]);
      expect(innerRangeY(500, {})).to.deep.equal([500, 0]);
      expect(innerRangeY(500, {left: 100, right: 50})).to.deep.equal([500, 0]);
      expect(innerRangeY(500, {top: 100, bottom: 50})).to.deep.equal([450, 100]);
      expect(innerRangeY(10, {top: 100, bottom: 50})).to.deep.equal([10, 10]);
      expect(innerRangeY(120, {top: 100, bottom: 50})).to.deep.equal([100, 100]);
    });
  });
});
