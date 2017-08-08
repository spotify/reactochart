import _ from 'lodash';
import {randomNormal, scaleOrdinal, scaleLinear, schemeCategory10, interpolateHcl} from 'd3';
import React from 'react';
import update from 'react-addons-update';
import numeral from 'numeral';

import XYPlot from '../../src/XYPlot';

import XAxis from '../../src/XAxis';
import XTicks from '../../src/XTicks';
import XLine from '../../src/XLine';
import XGrid from '../../src/XGrid';
import XAxisLabels from '../../src/XAxisLabels';
import XAxisTitle from '../../src/XAxisTitle';

import YAxis from '../../src/YAxis';
import YTicks from '../../src/YTicks';
import YLine from '../../src/YLine';
import YGrid from '../../src/YGrid';
import YAxisLabels from '../../src/YAxisLabels';
import YAxisTitle from '../../src/YAxisTitle';


import BarChart from '../../src/BarChart';
import AreaBarChart from '../../src/AreaBarChart';
import LineChart from '../../src/LineChart';

import MarkerLineChart from '../../src/MarkerLineChart';

import AreaChart from '../../src/AreaChart';

import {randomWalk, randomWalkSeries, randomWalkTimeSeries, removeRandomData} from './data/util';

import {combineDatasets} from '../../src/utils/Data';

// sample ordinal data
const ordinalData = ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'];
const ordinalData2 = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const timeData = _.range(ordinalData.length).map((i) => new Date(+(new Date()) + (i * 24*60*60*1000)));
const timeData2 = _.range(ordinalData.length).map((i) => new Date(+(new Date()) - (i * 2 * 24*60*60*1000)));

const randomBarData2 = {
  numberNumber: _.zip(_.range(0,21), randomWalk(21, 1000, 10000)),
  numberOrdinal: _.zip(randomWalk(ordinalData.length, 5), ordinalData),
  numberTime: _.zip(randomWalk(timeData.length, 5), timeData),

  //ordinalOrdinal: ordinalData.map(d => [d, _.sample(ordinalData2)]),
  ordinalOrdinal: _.zip(ordinalData, ordinalData2),
  ordinalTime: _.zip(ordinalData, timeData),

  timeTime: _.zip(timeData, timeData2)
};

const variableBins = _.range(0,12).reduce((bins, i) => {
  const lastBinEnd = bins.length ? _.last(bins)[1] : 0;
  //return bins.concat([[lastBinEnd, lastBinEnd + _.random(5, 20)]])
  return bins.concat([[lastBinEnd, lastBinEnd + i]])
}, []);

const rangeValueData = {
  numberNumber: _.zip(variableBins, randomWalk(variableBins.length, 10000, 10000))
};

const barTickData = {
  numberNumber: randomBarData2.numberNumber.map(d => [d[0], d[1] + _.random(-5000, 5000)]),
  numberRangeNumber: rangeValueData.numberNumber.map(d => [d[0], d[1] + _.random(-5000, 5000)]),
};

const InteractiveAreaBarChartExample = React.createClass({
  getInitialState() {
    return {
      activeValue: null
    }
  },
  onEnterBar(e, d) {
    this.setState({activeValue: d});
  },
  onLeaveBar(e, d) {
    this.setState({activeValue: null})
  },
  render() {
    const {activeValue} = this.state;
    const getters = {getX: 0, getY: 1};

    return <div>
      {activeValue ?
        <div>
          {activeValue.toFixed(2)}
        </div> :
        <div>Hover over the chart to show values</div>
      }
      <XYPlot width={500} height={320}>
        <XAxis /><YAxis />
        <AreaBarChart
          data={_.range(15)}
          getX={d => Math.sin(d / 10) * 10}
          getXEnd={d => Math.sin((d + 1) / 10) * 10}
          getY={d => Math.cos(d / (Math.PI))}
          onMouseEnterBar={this.onEnterBar}
          onMouseLeaveBar={this.onLeaveBar}
        />
      </XYPlot>;
    </div>
  }
});


class CustomSelectionRect extends React.Component {
  render() {
    const {scale, hoveredYVal} = this.props;
    return hoveredYVal ?
      <rect
        x="0"
        y={scale.y(hoveredYVal) - 20}
        width="500" height="40"
        style={{fill: 'red'}}
      />
      : null;
  }
};

class CustomChildExample extends React.Component {
  state = {
    hoveredYVal: null
  };

  onMouseMoveChart = ({yValue}) => {
    this.setState({hoveredYVal: yValue});
  };

  render() {
    return <div>
      <XYPlot
        width={500} height={400}
        padding={{bottom: 20, top: 20}}
        onMouseMove={this.onMouseMoveChart}
      >
        <XAxis /><YAxis />
        <CustomSelectionRect underAxes={true} hoveredYVal={this.state.hoveredYVal} />
        <BarChart
          horizontal
          data={randomBarData2.numberOrdinal}
          getX={0}
          getY={1}
          barThickness={20}
        />
      </XYPlot>
    </div>
  }
};

const CustomTicksExample = React.createClass({
  render() {
    return <div>
      <XYPlot
        width={300} height={300}
        ticks={{
          x: [0, 1, 2, 4, 8, 16],
          y: [-8000, -3000, 0, 10000, 5000, 40000]
        }}
      >
        <BarChart data={randomBarData2.numberNumber} getX={0} getY={1} />
      </XYPlot>
    </div>
  }
});

const CustomAxisLabelsExample = React.createClass({
  render() {
    return <div>
      <XYPlot
        width={500} height={300}
        ticks={{
          x: [0, 1, 2, 4, 8, 16],
          y: [-8000, -3000, 0, 10000, 5000, 20000]
        }}
        labelValues={{
          x: [0, 1, 3, 9, 12],
          y: [-5000, -2000, 0, 8000, 3000, 16000]
        }}
        showZero={{y: true}}
      >
        <BarChart
          data={randomBarData2.numberNumber}
          getX={0} getY={1}
          barThickness={20}
        />
      </XYPlot>
    </div>
  }
});

class SpacingExample extends React.Component {
  render() {
    const spacing = {left: 10, top: 53, right: 16, bottom: 9};
    const lineChart = (
      <LineChart
        spacing={spacing}
        data={_.range(100)}
        getY={d => Math.sin(d*.1)}
      />
    );

    return <div>
      <XYPlot scaleType="linear" {...{width: 400, height: 350, spacing}}>
        <XAxis title="Phase" />
        <YAxis title="Intensity" />
        {lineChart}
      </XYPlot>
      <XYPlot scaleType="linear" {...{width: 400, height: 350, spacing}}>
        <XAxis title="Phase" position="top" />
        <YAxis title="Intensity" position="right"/>
        {lineChart}
      </XYPlot>
      <XYPlot scaleType="linear" {...{width: 400, height: 350, spacing}}>
        <XTicks/><XGrid/><XAxisLabels/>
        <YTicks/><YGrid/><YAxisLabels/>
        {lineChart}
      </XYPlot>
      <XYPlot scaleType="linear" {...{width: 400, height: 350, spacing}}>
        <XTicks position="top"/><XGrid position="top"/><XAxisLabels position="top"/>
        <YTicks position="right"/><YGrid position="right"/><YAxisLabels position="right"/>
        {lineChart}
      </XYPlot>
      <XYPlot scaleType="linear" {...{width: 400, height: 350, spacing}}>
        <XTicks placement="above"/><XGrid placement="above"/><XAxisLabels placement="above"/>
        {lineChart}
      </XYPlot>
    </div>
  }
}


export const examples = [
  {id: 'barMarkerLine', title: 'Bar Charts with Marker Lines', Component: BarMarkerLineExample},
  {id: 'customChildren', title: 'Custom Chart Children', Component: CustomChildExample},
  {id: 'spacing', title: 'Spacing', Component: SpacingExample},

  // todo rewrite these?
  // {id: 'customTicks', title: 'Custom Axis Ticks', Component: CustomTicksExample},
  // {id: 'customAxisLabels', title: 'Custom Axis Labels', Component: CustomAxisLabelsExample},
];

export const App = React.createClass({
  getInitialState() {
    return {
      visibleExamples: {},
      hoveredYVal: null
    }
  },
  toggleExample(id) {
    const isVisible = this.state.visibleExamples[id];
    this.setState(update(this.state, {visibleExamples: {[id]: {$set: !isVisible}}}));
  },

  render() {
    return <div>
      <h1>Reactochart Examples</h1>
      {this.renderExamples()}
    </div>
  },
  renderExamples() {
    return <div className='example-sections'>
      {examples.map(this.renderExample)}
    </div>;
  },
  renderExample(example) {
    const isVisible = this.state.visibleExamples[example.id];
    const ExampleComponent = example.Component;
    const className = `example-section example-section-${example.id} ${isVisible ? 'example-section-visible' : ''}`;

    return <div className={className} key={`${example.id}`}>
      <div
        className={`example-section-button ${isVisible ? 'active' : ''}`}
        onClick={this.toggleExample.bind(null, example.id)}
      >
        {example.title}
        <span className="example-arrow">{isVisible ? " ▼" : " ►"}</span>
      </div>
      {isVisible ?
        <div className="example-section-content">
          <ExampleComponent />
        </div>
        : null
      }
    </div>
  }
});
