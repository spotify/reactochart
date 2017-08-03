import _ from 'lodash';
import React from 'react';
import * as d3 from 'd3';
import TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';

import {
  makeAccessor,
  datasetsFromPropsOrDescendants,
  inferDataType,
  inferDatasetsType,
  domainFromData,
  domainFromDatasets,
  combineDomains,
  isValidDomain
} from '../../src/utils/Data'

const notImplemented = () => {
  console.log('* * * TEST NOT YET IMPLEMENTED * * *');
  throw new Error("not implemented");
};

describe('Data utils', () => {
  describe('makeAccessor', () => {
    it('passes existing accessor functions through', () => {
      const getter = (d) => d + 1;
      expect(makeAccessor(getter)).to.equal(getter);
    });

    it('returns identity function given null or undefined', () => {
      const d = {x: 6};
      expect(makeAccessor(undefined)(d)).to.equal(d);
      expect(makeAccessor(null)(d)).to.equal(d);
    });

    it('deeply retrieves object values given array indices and/or key strings', () => {
      const d = [{x: [{y: 'z'}]}];
      expect(makeAccessor(0)(d)).to.equal(d[0]);
      expect(makeAccessor('0.x')(d)).to.equal(d[0].x);
      expect(makeAccessor('0.x.0.y')(d)).to.equal('z');
      expect(makeAccessor('x.0.y')(d[0])).to.equal('z');
    })
  });

  describe('datasetsFromPropsOrDescendants', () => {
    it('returns props.datasets', () => {
      const props = {datasets: [[1]]};
      const datasets = datasetsFromPropsOrDescendants(props);
      expect(datasets).to.equal(props.datasets);
      expect(datasets).to.deep.equal(props.datasets);
    });

    it('returns props.data wrapped in an array', () => {
      const props = {data: [2]};
      const datasets = datasetsFromPropsOrDescendants(props);
      expect(datasets).to.be.an('array');
      expect(datasets[0]).to.equal(props.data);
      expect(datasets[0]).to.deep.equal(props.data);
    });

    it('traverses children and combines their props.data & props.datasets', () => {
      class TestComponent extends React.Component {
        render() {
          return <div>{this.props.children}</div>;
        }
      }

      const tree =
        <TestComponent first><div>
          <TestComponent data={[0, 1]}/>
          <TestComponent datasets={[[2, 3], [4, 5]]}/>
          <div><TestComponent data={[6, 7]}/></div>
        </div></TestComponent>;

      const rendered = TestUtils.renderIntoDocument(tree);
      const datasets = datasetsFromPropsOrDescendants(rendered.props);
      expect(datasets).to.be.an('array');
      expect(datasets).to.deep.equal([[0, 1], [2, 3], [4, 5], [6, 7]]);
    });
  });

  describe('inferDataType', () => {
    it('returns `number` for dataset with all numbers', () => {
      expect(inferDataType([-1, 0, 1.2, 4.5])).to.equal('number');
    });

    it('returns `time` for dataset with all Dates', () => {
      expect(inferDataType([new Date(), new Date(2003, 2, 4)])).to.equal('time');
    });

    it('returns `categorical` for dataset with all strings', () => {
      expect(inferDataType(['a', 'b', 'c'])).to.equal('categorical');
    });

    it('returns `categorical` for mixed types', () => {
      expect(inferDataType([42, new Date()])).to.equal('categorical');
    });

    it('takes an accessor function for getting the data points', () => {
      const getD = (d) => d.a;
      expect(inferDataType([{a: 1}, {a: 1.3}], getD)).to.equal('number');
      expect(inferDataType([{a: new Date()}, {a: new Date()}], getD)).to.equal('time');
      expect(inferDataType([{a: 'b'}, {a: 'c'}], getD)).to.equal('categorical');
    })
  });

  describe('inferDatasetsType', () => {
    it('returns same as inferDataType if all datasets are same type', () => {
      expect(inferDatasetsType([[-1, 0], [1.2, 4.5]])).to.equal('number');
      expect(inferDatasetsType([[new Date()], [new Date(2003, 2, 4)]])).to.equal('time');
      expect(inferDatasetsType([['a'], ['b', 'c']])).to.equal('categorical');
      expect(inferDatasetsType([[42, new Date()]])).to.equal('categorical');

      const getD = (d) => d.a;
      expect(inferDatasetsType([[{a: 1}, {a: 1.3}]], getD)).to.equal('number');
      expect(inferDatasetsType([[{a: new Date()}, {a: new Date()}]], getD)).to.equal('time');
      expect(inferDatasetsType([[{a: 'b'}, {a: 'c'}]], getD)).to.equal('categorical');
    });

    it('returns `categorical` if datasets are mixed types', () => {
      expect(inferDatasetsType([[7], [new Date()]])).to.equal('categorical');
    });
  });

  describe('domainFromData', () => {
    const numberData = [2, 4, 6, -2, 0];
    const timeData = [new Date(2006, 1, 1), new Date(2013, 1, 1), new Date(2008, 1, 1)];
    const categoricalData = ['a', 'b', 'c'];

    it('determines domain from data when type is provided', () => {
      const numberDomain = domainFromData(numberData, _.identity, 'number');
      expect(numberDomain).to.deep.equal([-2, 6]);
      const timeDomain = domainFromData(timeData, _.identity, 'time');
      expect(timeDomain).to.deep.equal([new Date(2006, 1, 1), new Date(2013, 1, 1)]);
      const categoricalDomain = domainFromData(numberData, _.identity, 'categorical');
      expect(categoricalDomain).to.deep.equal(numberData);
    });

    it('infers accessor & type when not provided', () => {
      const numberDomain = domainFromData(numberData);
      expect(numberDomain).to.deep.equal([-2, 6]);
      const timeDomain = domainFromData(timeData);
      expect(timeDomain).to.deep.equal([new Date(2006, 1, 1), new Date(2013, 1, 1)]);
      const categoricalDomain = domainFromData(categoricalData);
      expect(categoricalDomain).to.deep.equal(categoricalData);
    });
  });

  describe('domainFromDatasets', () => {
    const numberDatasets = [[8, 7], [4, 5], [3, 1]];
    const timeDatasets = [
      [new Date('2007-03-12'), new Date('2002-03-12')],
      [new Date('2009-01-09'), new Date('2004-04-25')]
    ];
    const categoricalDatasets = [['x', 'z'], ['y', 'z']];

    it('determines domain from datasets when accessor & type are provided', () => {
      const numberDomain = domainFromDatasets(numberDatasets, _.identity, 'number');
      const timeDomain = domainFromDatasets(timeDatasets, _.identity, 'time');
      const categoricalDomain = domainFromDatasets(categoricalDatasets, _.identity, 'categorical');

      expect(numberDomain).to.deep.equal([1, 8]);
      expect(timeDomain).to.deep.equal([new Date('2002-03-12'), new Date('2009-01-09')]);
      expect(categoricalDomain).to.deep.equal(['x', 'z', 'y']);
    });

    it('infers accessor & type when not provided', () => {
      const numberDomain = domainFromDatasets(numberDatasets);
      const timeDomain = domainFromDatasets(timeDatasets);
      const categoricalDomain = domainFromDatasets(categoricalDatasets);

      expect(numberDomain).to.deep.equal([1, 8]);
      expect(timeDomain).to.deep.equal([new Date('2002-03-12'), new Date('2009-01-09')]);
      expect(categoricalDomain).to.deep.equal(['x', 'z', 'y']);
    });
  });

  describe('combineDomains', () => {
    it('returns extent of domains for number-type data', () => {
      const domains = [[0, 3], [2, 9], [-2, 4]];
      expect(combineDomains(domains, 'number')).to.deep.equal([-2, 9]);
    });

    it('returns extent of domains for time-type data', () => {
      const domains = [[new Date(2004, 1, 1), new Date(2008, 1, 1)], [new Date(2006, 1, 1), new Date(2010, 1, 1)]];
      expect(combineDomains(domains, 'time')).to.deep.equal([new Date(2004, 1, 1), new Date(2010, 1, 1)]);
    });

    it('returns all unique domain values for categorical-type data', () => {
      const domains = [['a', 'b', 'c'], ['b', 'd', 'c', 'e']];
      expect(combineDomains(domains, 'categorical')).to.deep.equal(['a', 'b', 'c', 'd', 'e']);
    });
  });

  describe('isValidDomain', () => {
    it('returns false for non-arrays and empty arrays', () => {
      expect(isValidDomain(4)).to.equal(false);
      expect(isValidDomain('abc')).to.equal(false);
      expect(isValidDomain([])).to.equal(false);
    });

    it('returns true for any array with items if type is categorical', () => {
      expect(isValidDomain([4])).to.equal(true);
      expect(isValidDomain([4], 'categorical')).to.equal(true);
      expect(isValidDomain(['abc', 'def', 'ghi'])).to.equal(true);
      expect(isValidDomain(['abc', 'def', 'ghi'], 'categorical')).to.equal(true);
      expect(isValidDomain([new Date(), new Date()])).to.equal(true);
      expect(isValidDomain([new Date(), new Date()], 'categorical')).to.equal(true);
    });

    it('returns true for 2-item number arrays if type is number', () => {
      expect(isValidDomain([4, 5], 'number')).to.equal(true);
      expect(isValidDomain([4], 'number')).to.equal(false);
      expect(isValidDomain([4, 5, 6], 'number')).to.equal(false);
      expect(isValidDomain([new Date(), new Date()], 'number')).to.equal(false);
      expect(isValidDomain(['abc', 'def'], 'number')).to.equal(false);
    });

    it('returns true for 2-item date arrays if type is time', () => {
      expect(isValidDomain([new Date(), new Date()], 'time')).to.equal(true);
      expect(isValidDomain([new Date()], 'time')).to.equal(false);
      expect(isValidDomain([new Date(), new Date(), new Date()], 'time')).to.equal(false);
      expect(isValidDomain([4, 5], 'time')).to.equal(false);
      expect(isValidDomain(['abc', 'def'], 'time')).to.equal(false);
    });
  })
});

