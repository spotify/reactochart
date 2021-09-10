import { mount } from 'enzyme';
import _ from 'lodash';
import React from 'react';
import {
  combineDomains,
  datasetsFromPropsOrDescendants,
  domainFromData,
  domainFromDatasets,
  inferDatasetsType,
  inferDataType,
  isValidDomain,
  makeAccessor,
} from '../../../src/utils/Data';

const notImplemented = () => {
  console.log('* * * TEST NOT YET IMPLEMENTED * * *');
  throw new Error('not implemented');
};

describe('Data utils', () => {
  describe('makeAccessor', () => {
    it('passes existing accessor functions through', () => {
      const getter = d => d + 1;
      expect(makeAccessor(getter)).toEqual(getter);
    });

    it('returns identity function given null or undefined', () => {
      const d = { x: 6 };
      expect(makeAccessor(undefined)(d)).toEqual(d);
      expect(makeAccessor(null)(d)).toEqual(d);
    });

    it('deeply retrieves object values given array indices and/or key strings', () => {
      const d = [{ x: [{ y: 'z' }] }];
      expect(makeAccessor(0)(d)).toEqual(d[0]);
      expect(makeAccessor('0.x')(d)).toEqual(d[0].x);
      expect(makeAccessor('0.x.0.y')(d)).toEqual('z');
      expect(makeAccessor('x.0.y')(d[0])).toEqual('z');
    });
  });

  describe('datasetsFromPropsOrDescendants', () => {
    it('returns props.datasets', () => {
      const props = { datasets: [[1]] };
      const datasets = datasetsFromPropsOrDescendants(props);
      expect(datasets).toEqual(props.datasets);
      expect(datasets).toEqual(props.datasets);
    });

    it('returns props.data wrapped in an array', () => {
      const props = { data: [2] };
      const datasets = datasetsFromPropsOrDescendants(props);
      expect(Array.isArray(datasets)).toBe(true);
      expect(datasets[0]).toEqual(props.data);
      expect(datasets[0]).toEqual(props.data);
    });

    it('traverses children and combines their props.data & props.datasets', () => {
      class TestComponent extends React.Component {
        render() {
          return <div>{this.props.children}</div>;
        }
      }

      const tree = (
        <TestComponent first>
          <div>
            <TestComponent data={[0, 1]} />
            <TestComponent datasets={[[2, 3], [4, 5]]} />
            <div>
              <TestComponent data={[6, 7]} />
            </div>
          </div>
        </TestComponent>
      );

      const rendered = mount(tree);
      const datasets = datasetsFromPropsOrDescendants(rendered.props());
      expect(Array.isArray(datasets)).toBe(true);
      expect(datasets).toEqual([[0, 1], [2, 3], [4, 5], [6, 7]]);
    });
  });

  describe('inferDataType', () => {
    it('returns `number` for dataset with all numbers', () => {
      expect(inferDataType([-1, 0, 1.2, 4.5])).toEqual('number');
    });

    it('returns `time` for dataset with all Dates', () => {
      expect(inferDataType([new Date(), new Date(2003, 2, 4)])).toEqual(
        'time',
      );
    });

    it('returns `categorical` for dataset with all strings', () => {
      expect(inferDataType(['a', 'b', 'c'])).toEqual('categorical');
    });

    it('returns `categorical` for mixed types', () => {
      expect(inferDataType([42, new Date()])).toEqual('categorical');
    });

    it('takes an accessor function for getting the data points', () => {
      const getD = d => d.a;
      expect(inferDataType([{ a: 1 }, { a: 1.3 }], getD)).toEqual('number');
      expect(
        inferDataType([{ a: new Date() }, { a: new Date() }], getD),
      ).toEqual('time');
      expect(inferDataType([{ a: 'b' }, { a: 'c' }], getD)).toEqual(
        'categorical',
      );
    });
  });

  describe('inferDatasetsType', () => {
    it('returns same as inferDataType if all datasets are same type', () => {
      expect(inferDatasetsType([[-1, 0], [1.2, 4.5]])).toEqual('number');
      expect(
        inferDatasetsType([[new Date()], [new Date(2003, 2, 4)]]),
      ).toEqual('time');
      expect(inferDatasetsType([['a'], ['b', 'c']])).toEqual('categorical');
      expect(inferDatasetsType([[42, new Date()]])).toEqual('categorical');

      const getD = d => d.a;
      expect(inferDatasetsType([[{ a: 1 }, { a: 1.3 }]], getD)).toEqual(
        'number',
      );
      expect(
        inferDatasetsType([[{ a: new Date() }, { a: new Date() }]], getD),
      ).toEqual('time');
      expect(inferDatasetsType([[{ a: 'b' }, { a: 'c' }]], getD)).toEqual(
        'categorical',
      );
    });

    it('returns `categorical` if datasets are mixed types', () => {
      expect(inferDatasetsType([[7], [new Date()]])).toEqual('categorical');
    });
  });

  describe('domainFromData', () => {
    const numberData = [2, 4, 6, -2, 0];
    const timeData = [
      new Date(2006, 1, 1),
      new Date(2013, 1, 1),
      new Date(2008, 1, 1),
    ];
    const categoricalData = ['a', 'b', 'c'];

    it('determines domain from data when type is provided', () => {
      const numberDomain = domainFromData(numberData, _.identity, 'number');
      expect(numberDomain).toEqual([-2, 6]);
      const timeDomain = domainFromData(timeData, _.identity, 'time');
      expect(timeDomain).toEqual([
        new Date(2006, 1, 1),
        new Date(2013, 1, 1),
      ]);
      const categoricalDomain = domainFromData(
        numberData,
        _.identity,
        'categorical',
      );
      expect(categoricalDomain).toEqual(numberData);
    });

    it('infers accessor & type when not provided', () => {
      const numberDomain = domainFromData(numberData);
      expect(numberDomain).toEqual([-2, 6]);
      const timeDomain = domainFromData(timeData);
      expect(timeDomain).toEqual([
        new Date(2006, 1, 1),
        new Date(2013, 1, 1),
      ]);
      const categoricalDomain = domainFromData(categoricalData);
      expect(categoricalDomain).toEqual(categoricalData);
    });
  });

  describe('domainFromDatasets', () => {
    const numberDatasets = [[8, 7], [4, 5], [3, 1]];
    const timeDatasets = [
      [new Date('2007-03-12'), new Date('2002-03-12')],
      [new Date('2009-01-09'), new Date('2004-04-25')],
    ];
    const categoricalDatasets = [['x', 'z'], ['y', 'z']];

    it('determines domain from datasets when accessor & type are provided', () => {
      const numberDomain = domainFromDatasets(
        numberDatasets,
        _.identity,
        'number',
      );
      const timeDomain = domainFromDatasets(timeDatasets, _.identity, 'time');
      const categoricalDomain = domainFromDatasets(
        categoricalDatasets,
        _.identity,
        'categorical',
      );

      expect(numberDomain).toEqual([1, 8]);
      expect(timeDomain).toEqual([
        new Date('2002-03-12'),
        new Date('2009-01-09'),
      ]);
      expect(categoricalDomain).toEqual(['x', 'z', 'y']);
    });

    it('infers accessor & type when not provided', () => {
      const numberDomain = domainFromDatasets(numberDatasets);
      const timeDomain = domainFromDatasets(timeDatasets);
      const categoricalDomain = domainFromDatasets(categoricalDatasets);

      expect(numberDomain).toEqual([1, 8]);
      expect(timeDomain).toEqual([
        new Date('2002-03-12'),
        new Date('2009-01-09'),
      ]);
      expect(categoricalDomain).toEqual(['x', 'z', 'y']);
    });
  });

  describe('combineDomains', () => {
    it('returns extent of domains for number-type data', () => {
      const domains = [[0, 3], [2, 9], [-2, 4]];
      expect(combineDomains(domains, 'number')).toEqual([-2, 9]);
    });

    it('returns extent of domains for time-type data', () => {
      const domains = [
        [new Date(2004, 1, 1), new Date(2008, 1, 1)],
        [new Date(2006, 1, 1), new Date(2010, 1, 1)],
      ];
      expect(combineDomains(domains, 'time')).toEqual([
        new Date(2004, 1, 1),
        new Date(2010, 1, 1),
      ]);
    });

    it('returns all unique domain values for categorical-type data', () => {
      const domains = [['a', 'b', 'c'], ['b', 'd', 'c', 'e']];
      expect(combineDomains(domains, 'categorical')).toEqual([
        'a',
        'b',
        'c',
        'd',
        'e',
      ]);
    });
  });

  describe('isValidDomain', () => {
    it('returns false for non-arrays and empty arrays', () => {
      expect(isValidDomain(4)).toEqual(false);
      expect(isValidDomain('abc')).toEqual(false);
      expect(isValidDomain([])).toEqual(false);
    });

    it('returns true for any array with items if type is categorical', () => {
      expect(isValidDomain([4])).toEqual(true);
      expect(isValidDomain([4], 'categorical')).toEqual(true);
      expect(isValidDomain(['abc', 'def', 'ghi'])).toEqual(true);
      expect(isValidDomain(['abc', 'def', 'ghi'], 'categorical')).toEqual(
        true,
      );
      expect(isValidDomain([new Date(), new Date()])).toEqual(true);
      expect(isValidDomain([new Date(), new Date()], 'categorical')).toEqual(
        true,
      );
    });

    it('returns true for 2-item number arrays if type is number', () => {
      expect(isValidDomain([4, 5], 'number')).toEqual(true);
      expect(isValidDomain([4], 'number')).toEqual(false);
      expect(isValidDomain([4, 5, 6], 'number')).toEqual(false);
      expect(isValidDomain([new Date(), new Date()], 'number')).toEqual(false);
      expect(isValidDomain(['abc', 'def'], 'number')).toEqual(false);
    });

    it('returns true for 2-item date arrays if type is time', () => {
      expect(isValidDomain([new Date(), new Date()], 'time')).toEqual(true);
      expect(isValidDomain([new Date()], 'time')).toEqual(false);
      expect(
        isValidDomain([new Date(), new Date(), new Date()], 'time'),
      ).toEqual(false);
      expect(isValidDomain([4, 5], 'time')).toEqual(false);
      expect(isValidDomain(['abc', 'def'], 'time')).toEqual(false);
    });
  });
});
