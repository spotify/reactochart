import _ from 'lodash';

export function randomWalk(length=100, start=0, variance=10) {
    return _.reduce(_.range(length-1), (sequence, i) => {
        return sequence.concat(_.last(sequence) + _.random(-variance, variance));
    }, [start]);
}

export function randomWalkSeries(length=100, start=0, variance=10) {
    return randomWalk(length, start, variance).map((n,i) => [i,n]);
}
