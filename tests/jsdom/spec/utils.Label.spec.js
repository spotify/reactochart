import { scaleLinear } from 'd3-scale';
import {
  checkLabelsDistinct,
  checkRangesOverlap,
  countRangeOverlaps,
  getLabelsXOverhang,
  getLabelsYOverhang,
  getLabelXOverhang,
  getLabelXRange,
  getLabelYOverhang,
  getLabelYRange,
  makeLabelFormatters,
} from '../../../src/utils/Label';

describe('Label utils', () => {
  it('checkLabelsDistinct', () => {
    const labels = [
      { value: -20, text: '-20', height: 14, width: 20.234375 },
      { value: -15, text: '-15', height: 14, width: 20.234375 },
      { value: -10, text: '-10', height: 14, width: 20.234375 },
      { value: -5, text: '-5', height: 14, width: 12.4482421875 },
      { value: 0, text: '0', height: 14, width: 7.7861328125 },
      { value: 5, text: '5', height: 14, width: 7.7861328125 },
    ];

    expect(checkLabelsDistinct(labels)).toEqual(true);

    labels.push(labels[0]);

    expect(checkLabelsDistinct(labels)).toEqual(false);
  });

  it('checkRangesOverlap', () => {
    const arr1 = [5, 10];
    const arr2 = [11, 15];
    const arr3 = [8, 12];

    expect(checkRangesOverlap(arr1, arr2)).toEqual(false);
    expect(checkRangesOverlap(arr1, arr3)).toEqual(true);
    expect(checkRangesOverlap(arr2, arr3)).toEqual(true);
  });

  it('makeLabelFormatters', () => {
    const formatStrs = [
      '0.[00]a',
      '0,0',
      '0.[0]',
      '0.[00]',
      '0.[0000]',
      '0.[000000]',
    ];
    const scaleType = 'linear';

    const results = makeLabelFormatters(formatStrs, scaleType);
    expect(results).toHaveLength(6);
    results.forEach(r => {
      expect(r).toBeInstanceOf(Function);
    });
  });

  it('countRangeOverlaps', () => {
    const ranges = [
      [-10.1171875, 10.1171875],
      [27.3828125, 47.6171875],
      [64.8828125, 85.1171875],
      [106.27587890625, 118.72412109375],
      [146.10693359375, 153.89306640625],
      [183.60693359375, 191.39306640625],
    ];

    expect(countRangeOverlaps(ranges)).toEqual(0);

    ranges.push([183.60693359375, 191.39306640625]);

    expect(countRangeOverlaps(ranges)).toEqual(1);
  });

  it('getLabelXRange', () => {
    const scale = scaleLinear().domain([-30, 30]);
    const label = { value: -20, text: '-20', height: 14, width: 20.234375 };

    expect(getLabelXRange(scale, label)).toEqual([
      -9.950520833333334,
      10.283854166666666,
    ]);
  });

  it('getLabelYRange', () => {
    const scale = scaleLinear().domain([-30, 30]);
    const label = { value: -20, text: '-20', height: 14, width: 20.234375 };

    expect(getLabelYRange(scale, label)).toEqual([
      -6.833333333333333,
      7.166666666666667,
    ]);
  });

  it('getLabelXOverhang', () => {
    const scale = scaleLinear().domain([-30, 30]);
    const label = { value: -20, text: '-20', height: 14, width: 20.234375 };

    expect(getLabelXOverhang(scale, label)).toEqual([10, 10]);
  });

  it('getLabelYOverhang', () => {
    const scale = scaleLinear().domain([-30, 30]);
    const label = { value: -20, text: '-20', height: 14, width: 20.234375 };

    expect(getLabelYOverhang(scale, label)).toEqual([7, 7]);
  });

  it('getLabelsXOverhang', () => {
    const scale = scaleLinear().domain([-30, 30]);
    const labels = [
      { value: -20, text: '-20', height: 14, width: 20.234375 },
      { value: -15, text: '-15', height: 14, width: 20.234375 },
      { value: -10, text: '-10', height: 14, width: 20.234375 },
      { value: -5, text: '-5', height: 14, width: 12.4482421875 },
      { value: 0, text: '0', height: 14, width: 7.7861328125 },
      { value: 5, text: '5', height: 14, width: 7.7861328125 },
    ];

    expect(getLabelsXOverhang(scale, labels)).toEqual([10, 10]);
  });

  it('getLabelsYOverhang', () => {
    const scale = scaleLinear().domain([-30, 30]);
    const labels = [
      { value: -20, text: '-20', height: 14, width: 20.234375 },
      { value: -15, text: '-15', height: 14, width: 20.234375 },
      { value: -10, text: '-10', height: 14, width: 20.234375 },
      { value: -5, text: '-5', height: 14, width: 12.4482421875 },
      { value: 0, text: '0', height: 14, width: 7.7861328125 },
      { value: 5, text: '5', height: 14, width: 7.7861328125 },
    ];

    expect(getLabelsYOverhang(scale, labels)).toEqual([7, 7]);
  });
});
