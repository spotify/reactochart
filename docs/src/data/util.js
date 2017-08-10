import _ from 'lodash';

export function randomWalk(length=100, start=0, variance=10) {
  return _.reduce(_.range(length-1), (sequence, i) => {
    return sequence.concat(_.last(sequence) + _.random(-variance, variance));
  }, [start]);
}

export function randomWalkSeries(length=100, start=0, variance=10) {
  return randomWalk(length, start, variance).map((n,i) => [i,n]);
}

export function randomWalkTimeSeries(length=100, start=0, variance=10, startDate=new Date(2015, 0, 1)) {
  let date = startDate;
  return randomWalk(length, start, variance).map((n, i) => {
    date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
    return [date, n];
  });
}

export function removeRandomData(data, removeCount = 5) {
  const gapData = data.slice();
  _.times(removeCount, () => {
    if(!gapData.length) return;
    const gapIndex = _.random(gapData.length - 1);
    gapData.splice(gapIndex, 1);
  });
  return gapData;
}
