import _ from 'lodash';
import d3 from 'd3';
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

import Bar from '../../src/Bar';
import RangeBarChart from '../../src/RangeBarChart';
import RangeRect from '../../src/RangeRect';

import BarChart from '../../src/BarChart';
import AreaBarChart from '../../src/AreaBarChart';
import LineChart from '../../src/LineChart';
import AreaHeatmap from '../../src/AreaHeatmap';
import ScatterPlot from '../../src/ScatterPlot';
import PieChart from '../../src/PieChart';
import TreeMap from '../../src/TreeMap';
import Histogram from '../../src/Histogram';

import MarkerLineChart from '../../src/MarkerLineChart';
import KernelDensityEstimation from '../../src/KernelDensityEstimation';

import {randomWalk, randomWalkSeries} from './data/util';
import PropsTable from './PropsTable';

// sample ordinal data
const ordinalData = ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'];
const ordinalData2 = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const timeData = _.range(ordinalData.length).map((i) => new Date(+(new Date()) + (i * 24*60*60*1000)));
const timeData2 = _.range(ordinalData.length).map((i) => new Date(+(new Date()) - (i * 2 * 24*60*60*1000)));

const randomSequences = [
  randomWalkSeries(500, 100, 3),
  randomWalkSeries(500),
  randomWalkSeries(500, -100, 4)
];

const randomBars = [
  randomWalkSeries(21, 0, 5)
];

const randomScatter = [
  _.zip(randomWalk(20, 100), randomWalk(20, 100)),
  _.zip(randomWalk(3000, 10000), randomWalk(3000, 10000)),
  _.zip(randomWalk(50, 100), randomWalk(50, 100)),
  _.zip(randomWalk(100, 100), randomWalk(100, 100)),
  _.zip(randomWalk(200, 100), randomWalk(200, 100))
];

const randomBarData = {
  valueValue: randomWalkSeries(20, 0, 5)
};
const randomBarData2 = {
  numberNumber: _.zip(_.range(0,21), randomWalk(21, 1000, 10000)),
  numberOrdinal: _.zip(randomWalk(ordinalData.length, 5), ordinalData),
  numberTime: _.zip(randomWalk(timeData.length, 5), timeData),

  //ordinalOrdinal: ordinalData.map(d => [d, _.sample(ordinalData2)]),
  ordinalOrdinal: _.zip(ordinalData, ordinalData2),
  ordinalTime: _.zip(ordinalData, timeData),

  timeTime: _.zip(timeData, timeData2)
};
//console.log(randomBarData2);

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
//console.log('rangeValue', rangeValueData);

const normalDistribution = d3.random.normal(0);
//const randomNormal = _.times(1000, normalDistribution);
const randomNormal = _.times(1000, normalDistribution).concat(_.times(1000, d3.random.normal(3, 0.5)));

const emojis = ["😀", "😁", "😂", "😅", "😆", "😇", "😈", "👿", "😉", "😊", "😐", "😑", "😒", "😓", "😔", "😕", "😖", "😗", "😘", "😙", "😚", "😛", "😜", "😝", "👻", "👹", "👺", "💩", "💀", "👽", "👾", "🙇", "💁", "🙅", "🙆", "🙋", "🙎", "🙍", "💆", "💇"];
// end fake data



class PieChartExample extends React.Component {
  state = {sinVal: 0};

  _animateValue = () => {
    const sinVal = Math.min(Math.abs((Math.cos(new Date() * .001) * Math.sin(new Date() * .0011)) + 1), 2);
    this.setState({sinVal});
  };

  componentWillMount() {
    this._interval = setInterval(this._animateValue, 20);
  }
  componentWillUnmount() {
    clearInterval(this._interval);
  }

  render() {
    return <div>
      <PieChart data={[45, 35, 20]} />
      <PieChart
        data={[10, 20, 30]}
        radius={100}
        holeRadius={50}
        margin={20}
        markerLineValue={20}
      />
      <PieChart
        data={[42]}
        total={100}
        radius={80}
        holeRadius={50}
        centerLabel="42%"
      />
      <PieChart
        data={[this.state.sinVal]}
        total={2}
        radius={200}
        holeRadius={50}
        centerLabel={(this.state.sinVal * 50).toFixed(0)}
      />
      <PropsTable
        items={[
          {name: 'data', type: 'Array', description: ''},
          {name: 'total', type: 'Number', description: ''},
          {name: 'radius', type: 'Number', description: ''},
          {name: 'holeRadius', type: 'Number', description: ''},
          {name: 'centerLabel', type: 'Number', description: ''}
        ]}
      />
    </div>
  }
}

const ScatterPlotExample = React.createClass({
  render() {
    const rectangleSymbol = <rect width={5} height={5} fill="rebeccapurple" />;
    const triangleSymbol = <svg><polygon points="0,0 8,0 4,8" style={{fill: 'darkgreen'}} /></svg>;
    const randomEmoji = (d, i) => _.sample(emojis);

    return <div>
      <XYPlot width={700} height={500}>
        <XAxis title="Phase" />
        <YAxis title="Intensity" />

        <ScatterPlot
          data={randomScatter[3]}
          getX={0} getY={1}
          pointSymbol={rectangleSymbol}
        />
        <ScatterPlot
          data={randomScatter[4]}
          getX={0} getY={1}
          pointSymbol={randomEmoji}
          pointOffset={[0, 2]}
        />

        <ScatterPlot
          data={randomScatter[0]}
          getX={0} getY={1}
          pointSymbol={(d, i) => i}
        />
        <ScatterPlot
          data={randomScatter[2]}
          getX={0} getY={1}
          pointSymbol={triangleSymbol}
          pointOffset={[-4, -3]}
        />
        {/*
        <ScatterPlot
          data={randomScatter[1]}
          getX={0} getY={1}
          pointSymbol={randomEmoji}
          pointOffset={[0, 2]}
        />
        */}
      </XYPlot>

      <PropsTable
        items={[
          {name: 'data', type: 'Array', description: ''},
          {name: 'getX', type: 'Number', description: ''},
          {name: 'getY', type: 'Number', description: ''},
          {name: 'pointSymbol', type: 'Number', description: ''},
          {name: 'pointOffset', type: 'Array', description: ''}
        ]}
      />
    </div>
  }
});

const LineChartExample = React.createClass({
  render() {
    return <div>
      <XYPlot width={700}>
        <XAxis />
        <LineChart
          data={_.range(-10,10,0.01)}
          getX={null}
          getY={(n) => Math.sin(n)}
        />
        <LineChart
          data={_.range(-10,10,0.01)}
          getX={null}
          getY={(n) => Math.sin(Math.pow(Math.abs(n), Math.abs(n*.18))) * Math.cos(n)}
        />
        <LineChart
          data={_.range(-10,10,0.01)}
          getX={null}
          getY={(n) => Math.sin(n*0.5) * Math.cos(n)}
        />
      </XYPlot>

      <PropsTable
        items={[
          {name: 'data', type: 'Array', description: ''},
          {name: 'getX', type: 'Number', description: ''},
          {name: 'getY', type: 'Number', description: ''},
          {name: 'scale', type: 'Object', description: ''}
        ]}
      />
    </div>
  }
});


const InteractiveLineExample = React.createClass({
  getInitialState() {
    return {
      hoveredXYPlotData: null,
      activeXValue: null
    }
  },
  onMouseMoveXYPlot({xValue, yValue}) {
    this.setState({activeXValue: xValue, activeYValue: yValue});
  },
  onClick({yValue}) {
    this.setState({clickedY: yValue})
  },
  render() {
    const {activeXValue, activeYValue} = this.state;
    const getters = {getX: 0, getY: 1};

    return <div>
      {activeXValue && activeYValue ?
        <div>
          {activeXValue.toFixed(2) + ', ' + activeYValue.toFixed(2)}
        </div> :
        <div>Hover over the chart to show values</div>
      }
      <XYPlot width={700} height={400} onMouseMove={this.onMouseMoveXYPlot} onClick={this.onClick}>
        <XAxis title="Days" />
        <YAxis title="Price" />
        <LineChart data={randomSequences[0]} {...getters} />
        <LineChart data={randomSequences[1]} {...getters} />
        <LineChart data={randomSequences[2]} {...getters} />
        {activeXValue ?
          <XLine value={activeXValue} style={{stroke: 'red'}} /> :
          null
        }
        {activeYValue ?
          <YLine value={activeYValue} style={{stroke: 'red'}} /> :
          null
        }
        {this.state.clickedY ?
          <YLine value={this.state.clickedY} style={{stroke: 'orange'}} /> :
          null
        }
      </XYPlot>

      <PropsTable
        items={[
          {name: 'data', type: 'Array', description: ''},
          {name: 'width', type:'Number', description: ''},
          {name: 'height', type: 'Number', description: ''},
          {name: 'onMouseMove', type: 'function', description: ''},
          {name: 'onClick', type: 'function', description: ''},
          {name: 'centerLabel', type: 'Number', description: ''}
        ]}
      />
    </div>
  }
});

const HistogramKDEExample = React.createClass({
  render() {
    return <div>
      <div>
        <XYPlot margin={{left: 40, right: 8}} width={700} height={300}>
          <XAxis /><YAxis />
          <Histogram
            data={randomNormal} getX={null}
          />
          <KernelDensityEstimation
            data={randomNormal} getX={null} bandwidth={0.5}
          />
          <KernelDensityEstimation
            data={randomNormal} getX={null} bandwidth={0.1}
          />
          <KernelDensityEstimation
            data={randomNormal} getX={null} bandwidth={2}
          />
        </XYPlot>
      </div>
      <div>
        <XYPlot
          margin={{left: 40, right: 8}}
          width={700} height={40}
          showGrid={false}
          showLabels={false}
          showTicks={false}
        >
          <ScatterPlot
            data={randomNormal}
            getX={null}
            getY={() => Math.random()}
            pointRadius={1}
          />
        </XYPlot>
      </div>
      <PropsTable
        items={[
          {name: 'data', type: 'Array', description: ''},
          {name: 'margin', type:'Object', description: ''},
          {name: 'width', type: 'Number', description: ''},
          {name: 'height', type: 'Number', description: ''},
          {name: 'showGrid', type: 'Boolean', description: ''},
          {name: 'showLables', type: 'Boolean', description: ''},
          {name: 'showTicks', type: 'Boolean', description: ''},
          {name: 'getValue', type: 'Object', description: ''},
          {name: 'axisType', type: 'Object', description: ''},
          {name: 'scale', type: 'Object', description: ''},
        ]}
      />
    </div>
  }
});

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

class CustomSelectionRect extends React.Component {
  render() {
    const {scale, hoveredYVal} = this.props;
    return hoveredYVal ?
      <rect
        x="0"
        y={scale.y(hoveredYVal) - 20}
        width="200" height="40"
        style={{fill: 'red'}}
      />
      : null;
  }
}

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
        width={200} height={200}
        axisType={{y: 'ordinal'}}
        padding={{bottom: 20, top: 20}}
        showTicks={{x: false, y: false}}
        showGrid={{x: false, y: false}}
        showLabels={{x: false}}
        showXZero={{x: true}}
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
}


const MultipleXYExample = (props) => {
  return <div>
    <XYPlot>
      <BarChart data={randomBars[0]} getX={0} getY={1} />
      <LineChart data={randomBars[0]} getX={0} getY={1} />
      <ScatterPlot data={randomBars[0]} getX={0} getY={1} pointSymbol={(d, i) => _.sample(emojis)} />
    </XYPlot>
  </div>;
};


const BarMarkerLineExample = (props) => {
  return <div>
    <div>
      <XYPlot width={400} height={300}>
        <BarChart
          data={randomBarData2.numberNumber}
          getX={0} getY={1}
        />
        <MarkerLineChart
          data={barTickData.numberNumber}
          getX={0} getY={1}
          lineLength={15}
        />
      </XYPlot>
      <XYPlot width={400} height={300}>
        <BarChart
          horizontal
          data={randomBarData2.numberNumber}
          getX={1} getY={0}
        />
        <MarkerLineChart
          horizontal
          data={barTickData.numberNumber}
          getX={1} getY={0}
          lineLength={15}
        />
      </XYPlot>
    </div>
    <div>
      <XYPlot width={400} height={300}>
        <BarChart
          data={rangeValueData.numberNumber}
          getX={d => d[0][0]} getY={1}
          getEndValue={{x: d => d[0][1]}}
        />
        <MarkerLineChart
          data={barTickData.numberRangeNumber}
          getX={d => d[0][0]} getY={1}
          getEndValue={{x: d => d[0][1]}}
        />
      </XYPlot>
      <XYPlot width={400} height={300}>
        <BarChart
          data={rangeValueData.numberNumber}
          orientation="horizontal"
          getX={1} getY={d => d[0][0]}
          getEndValue={{y: d => d[0][1]}}
        />
        <MarkerLineChart
          data={barTickData.numberRangeNumber}
          orientation="horizontal"
          getX={1} getY={d => d[0][0]}
          getEndValue={{y: d => d[0][1]}}
        />
      </XYPlot>
    </div>
    <PropsTable
      items={[
        {name: 'data', type: 'Array', description: ''},
        {name: 'orientation', type: 'String', description: ''},
        {name: 'getX', type: 'Number', description: ''},
        {name: 'getY', type: 'Number', description: ''},
        {name: 'getEndValue', type: 'Number', description: ''}
      ]}
    />
  </div>
};

const dateDomain = [new Date(1992, 0, 1), new Date(2001, 0, 1)];
const numberDomain = [-20, 20];

const XYAxisExample = (props) => {
  const domain = {x: dateDomain, y: numberDomain};

  const smallSize = {width: 230, height: 180};
  const bigSize = {width: 550, height: 300};

  return <div>
    <div>
      <XYPlot domain={domain} {...bigSize}>
        <YAxis title="Hip Hop"/>
        <XAxis title="Hooray"/>
      </XYPlot>
    </div>
    <div>
      <XYPlot domain={domain} {...smallSize}>
        <YAxis title="Hip Hop"/>
      </XYPlot>

      <XYPlot domain={domain} {...smallSize}>
        <YTicks />
        <YTicks placement="after" tickLength={10} tickCount={4} />
        <YTicks position="right" tickCount={30} tickLength={15} tickStyle={{stroke: 'red'}} />
        <YTicks position="right" placement="before" tickCount={5} tickLength={18} />
      </XYPlot>

      <XYPlot domain={domain} {...smallSize}>
        <YGrid tickCount={50} />
        <YGrid tickCount={5} lineStyle={{stroke: 'blue', strokewidth: 2}} />
      </XYPlot>

      <XYPlot domain={domain} {...smallSize}>
        <YAxisLabels tickCount={10}/>
        <YAxisLabels position="right" tickCount={10} />
        <YGrid />
      </XYPlot>

      <XYPlot domain={domain} {...smallSize}>
        <YAxisTitle title="Hip Hip" position="right" style={{fontSize: '12px'}} />
        <YAxisTitle title="Hooray" />
      </XYPlot>
    </div>

    <div>
      <XYPlot domain={domain} {...smallSize}>
        <XAxis title="Hooray"/>
      </XYPlot>

      <XYPlot domain={domain} {...smallSize}>
        <XTicks />
        <XTicks position="top" tickCount={120} tickLength={15} tickStyle={{stroke: 'red'}} />
        <XTicks position="top" placement="below" tickCount={50} tickLength={10} />
        <XTicks position="top" placement="below" tickCount={5} tickLength={18} />
      </XYPlot>

      <XYPlot domain={domain} {...smallSize}>
        <XGrid tickCount={50} />
        <XGrid tickCount={5} lineStyle={{stroke: 'blue', strokewidth: 2}} />
      </XYPlot>

      <XYPlot domain={domain} {...smallSize}>
        <XAxisLabels tickCount={5}/>
        <XAxisLabels position="top" distance={2} labelStyle={{fontSize: '10px'}} />
      </XYPlot>

      <XYPlot domain={domain} {...smallSize}>
        <XAxisTitle title="Hip Hip" position="top" style={{fontSize: '12px'}} />
        <XAxisTitle title="Hooray" />
      </XYPlot>
    </div>
  </div>
};

const RangeBarChartExample = (props) => {
  const count = 30;
  const dateDomain = [new Date(1992, 0, 1), new Date(2001, 0, 1)];
  const numberDomain = [-2, 2];
  const ordinalDomain = _.range(count).map(n => String.fromCharCode(97 + n));

  const dates = _.range(30).map(n => new Date(+(dateDomain[0]) + (n * 1000 * 60 * 60 * 24 * 100)));

  const addDays = (date, n) => new Date(+(date) + (1000 * 60 * 60 * 24 * n));

  const numberRanges =
    _.range(30).map(n => [Math.sin(n/5), Math.sin(n/8) + Math.cos(n/5)].sort((a, b) => (a - b)));
  const dateRanges =
    _.range(30).map(n => [dates[n], addDays(dates[n], (Math.sin(n/8) * 100))].sort((a, b) => (a - b)));

  const numberNumberRangeData = _.zip(_.range(30), numberRanges);
  const dateNumberRangeData = _.zip(dates, numberRanges);
  const ordinalNumberRangeData = _.zip(ordinalDomain, numberRanges);

  const numberDateRangeData = _.zip(_.range(30), dateRanges);
  const dateDateRangeData = _.zip(dates, dateRanges);
  const ordinalDateRangeData = _.zip(ordinalDomain, dateRanges);

  return <div>

    {[true, false].map(horizontal => {
      const title = horizontal ? "Horizontal" : "Vertical";
      const getters = horizontal ?
        {getY: 0, getX: '1.0', getXEnd: '1.1'} :
        {getX: 0, getY: '1.0', getYEnd: '1.1'};

      const dep = horizontal ? 'x' : 'y';
      const indep = horizontal ? 'y' : 'x';

      return <div>
        <h2>{title}</h2>

        <div>
          <XYPlot domain={{[dep]: numberDomain, [indep]: [0, count]}} scaleType="linear" {...{width: 300, height: 350}}>
            <XAxis/><YAxis/>
            <RangeBarChart
              horizontal={horizontal}
              data={numberNumberRangeData}
              {...getters}
            />
          </XYPlot>

          <XYPlot domain={{[dep]: numberDomain, [indep]: dateDomain}} {...{width: 300, height: 350}}>
            <XAxis/><YAxis/>
            <RangeBarChart
              horizontal={horizontal}
              data={dateNumberRangeData}
              {...getters}
            />
          </XYPlot>

          <XYPlot domain={{[dep]: numberDomain, [indep]: ordinalDomain}} {...{width: 300, height: 350}}>
            <XAxis/><YAxis/>
            <RangeBarChart
              horizontal={horizontal}
              data={ordinalNumberRangeData}
              {...getters}
            />
          </XYPlot>
        </div>

        <div>
          <XYPlot domain={{[dep]: dateDomain, [indep]: [0, count]}} {...{width: 300, height: 350}}>
            <XAxis/><YAxis/>
            <RangeBarChart
              horizontal={horizontal}
              data={numberDateRangeData}
              {...getters}
            />
          </XYPlot>

          <XYPlot domain={{[dep]: dateDomain, [indep]: dateDomain}} {...{width: 300, height: 350}}>
            <XAxis/><YAxis/>
            <RangeBarChart
              horizontal={horizontal}
              data={dateDateRangeData}
              {...getters}
            />
          </XYPlot>

          <XYPlot domain={{[dep]: dateDomain, [indep]: ordinalDomain}} {...{width: 300, height: 350}}>
            <XAxis/><YAxis/>
            <RangeBarChart
              horizontal={horizontal}
              data={ordinalDateRangeData}
              {...getters}
            />
          </XYPlot>
        </div>
      </div>
    })}




    <XYPlot domain={{y: [-1, 1], x: [-1, 1]}} scaleType="linear" {...{width: 300, height: 350}}>
      <XAxis/><YAxis/>
      <RangeBarChart
        data={_.range(-1, 1, .1)}
        getX={null}
        getY={d => Math.sin(d*2)}
        getYEnd={d => Math.sin(d*2) * Math.cos(d*2)}
        barThickness={6}
      />
    </XYPlot>
  </div>
};

const AreaHeatmapExample = (props) => {
  const gridData = _.range(30).map(m => {
    return _.range(30).map(n => {
      return {
        x: n, xEnd: n + 1,
        y: m, yEnd: m + 1,
        area: Math.sin(m / 2) * Math.sin(n / 3)
      };
    });
  });

  return <div>
    <XYPlot scaleType="linear" {...{width: 500, height: 500}}>
      <XAxis title="Phase" />
      <YAxis title="Intensity" />

      <AreaHeatmap
        data={_.flatten(gridData)}
        getArea="area"
        getX="x"
        getXEnd="xEnd"
        getY="y"
        getYEnd="yEnd"
      />
    </XYPlot>
    <PropsTable
      items={[
        {name: 'data', type: 'Array', description: ''},
        {name: 'getArea', type: 'Function', description: ''},
        {name: 'getX', type: 'Number', description: ''},
        {name: 'getXEnd', type: 'Number', description: ''},
        {name: 'getY', type: 'Number', description: ''},
        {name: 'getYEnd', type: 'Number', description: ''},
        {name: 'scale', type: 'Number', description: ''},
        {name: 'scaleWidth', type: 'Number', description: ''},
        {name: 'scaleHeight', type: 'Number', description: ''},
        {name: 'unitsPerPixel', type: 'Number', description: ''},
      ]}
    />

  </div>;
};

const MarkerLineExample = (props) => {
  return <div>
    <div>
      <h4>Value/Value</h4>

      <XYPlot scaleType="linear" {...{width: 500, height: 500}}>
        <XAxis title="Phase" />
        <YAxis title="Intensity" />
        <MarkerLineChart
          data={_.range(30)}
          getY={d => Math.sin(d / (Math.PI))}
        />
      </XYPlot>

      <XYPlot scaleType="linear" {...{width: 500, height: 500}}>
        <XAxis title="Phase" />
        <YAxis title="Intensity" />
        <MarkerLineChart
          data={_.range(30)}
          getX={d => Math.sin(d / (Math.PI))}
          orientation="horizontal"
        />
      </XYPlot>
    </div>

    <div>
      <XYPlot scaleType="linear" {...{width: 500, height: 500}}>
        <XAxis title="Phase" />
        <YAxis title="Intensity" />
        <MarkerLineChart
          data={_.range(15)}
          getX={d => Math.sin(d / 10) * 10}
          getXEnd={d => Math.sin((d + 1) / 10) * 10}
          getY={d => Math.sin(d / (Math.PI))}
        />
      </XYPlot>

      <XYPlot scaleType="linear" {...{width: 500, height: 500}}>
        <XAxis title="Phase" />
        <YAxis title="Intensity" />
        <MarkerLineChart
          data={_.range(15)}
          getX={d => Math.sin(d / (Math.PI))}
          getY={d => Math.sin(d / 10) * 10}
          getYEnd={d => Math.sin((d + 1) / 10) * 10}
          orientation="horizontal"
        />
      </XYPlot>
    </div>
    <PropsTable
      items={[
        {name: 'data', type: 'Array', description: ''},
        {name: 'orientation', type: 'String', description: ''},
        {name: 'getX', type: 'Number', description: ''},
        {name: 'getXEnd', type: 'Number', description: ''},
        {name: 'getY', type: 'Number', description: ''},
        {name: 'getYEnd', type: 'Number', description: ''}
      ]}
    />
  </div>;
};

const KDEExample = (props) => {
  const xyProps = {
    domain: {x: [-4, 6], y: [0, 220]},
    scaleType: "linear"
  };

  return <div>
    <div>
      <XYPlot width={700} height={300} {...xyProps}>
        <XAxis title="Value" />
        <YAxis title="Count" />

        <KernelDensityEstimation
          data={randomNormal} getValue={{x: null}} bandwidth={0.5}
        />
        <KernelDensityEstimation
          data={randomNormal} getValue={{x: null}} bandwidth={0.1}
        />
        <KernelDensityEstimation
          data={randomNormal} getValue={{x: null}} bandwidth={2}
        />
        <ScatterPlot
          data={randomNormal}
          getX={null}
          getY={d => Math.abs(d) * 10000 % 200}
          pointRadius={1}
        />
      </XYPlot>
    </div>
    <PropsTable
      items={[
        {name: 'data', type: 'Array', description: ''},
        {name: 'getValue', type: 'Number', description: ''},
        {name: 'bandwidth', type: 'Number', description: ''}
      ]}
    />
  </div>;
};

const TreeMapExample = (props) => {
  const data = {
    children: _.range(1, 5).map(n => ({
      children: _.times(n * n, m => ({
        size: n * (m + 1)
      }))
    }))
  };

  const colorScale = d3.scale.linear()
    .domain([0, 65])
    .range(['#6b6ecf', '#8ca252'])
    .interpolate(d3.interpolateHcl);

  return <div>
    <TreeMap
      data={data}
      getValue="size"
      getLabel="size"
      nodeStyle={(node) => ({
        backgroundColor: colorScale(parseInt(node.size)),
        border: '1px solid #333'
      })}
      width={800}
      height={500}
    />
    <PropsTable
      items={[
        {name: 'data', type: 'Array', description: ''},
        {name: 'getValue', type: 'String', description: ''},
        {name: 'getLabel', type: 'Number', description: ''},
        {name: 'nodeStyle', type: 'Function', description: ''},
        {name: 'width', type: 'Number', description: ''},
        {name: 'height', type: 'Number', description: ''}
      ]}
    />
  </div>
};

const YAxisTitleTest = (props) => {
  const xyProps = {
    width: 500, height: 360,
    domain: {x: [0, 100], y: [0, 100]}
  };

  return <XYPlot {...xyProps}>
    <YAxisTitle title="Top I" alignment="top"  />
    <YAxisTitle title="Mid + Mid" alignment="middle" />
    <YAxisTitle title="I Bottom" alignment="bottom" />

    <YAxisTitle title="Top I" alignment="top" rotate={false} />
    <YAxisTitle title="Mid +" alignment="middle" rotate={false} />
    <YAxisTitle title="Bottom I" alignment="bottom" rotate={false} />


    <YAxisTitle title="Top I" alignment="top" placement="after" />
    <YAxisTitle title="Mid + Mid" alignment="middle" placement="after" />
    <YAxisTitle title="I Bottom" alignment="bottom" placement="after" />

    <YAxisTitle title="I Top" alignment="top" placement="after" rotate={false} />
    <YAxisTitle title="+ Mid" alignment="middle" placement="after" rotate={false} />
    <YAxisTitle title="I Bottom" alignment="bottom" placement="after" rotate={false} />


    <YAxisTitle title="Top I" alignment="top" position="right" />
    <YAxisTitle title="Mid + Mid" alignment="middle" position="right" />
    <YAxisTitle title="I Bottom" alignment="bottom" position="right" />

    <YAxisTitle title="I Top" alignment="top" position="right" rotate={false} />
    <YAxisTitle title="+ Mid" alignment="middle" position="right" rotate={false} />
    <YAxisTitle title="I Bottom" alignment="bottom" position="right" rotate={false} />


    <YAxisTitle title="Top I" alignment="top" placement="before" position="right" />
    <YAxisTitle title="Mid + Mid" alignment="middle" placement="before" position="right" />
    <YAxisTitle title="I Bottom" alignment="bottom" placement="before" position="right" />

    <YAxisTitle title="Top I" alignment="top" position="right" placement="before" rotate={false} />
    <YAxisTitle title="Mid +" alignment="middle" position="right" placement="before" rotate={false} />
    <YAxisTitle title="Bottom I" alignment="bottom" position="right" placement="before" rotate={false} />
  </XYPlot>;
};

const XAxisTitleTest = (props) => {
  const xyProps = {
    width: 500, height: 360,
    domain: {x: [0, 100], y: [0, 100]}
  };

  return <XYPlot {...xyProps}>
    <XAxisTitle title="I Left" alignment="left" />
    <XAxisTitle title="Center + Center" alignment="center" />
    <XAxisTitle title="Right I" alignment="right" />

    <XAxisTitle title="I Left" alignment="left" placement="above" />
    <XAxisTitle title="Center + Center" alignment="center" placement="above" />
    <XAxisTitle title="Right I" alignment="right" placement="above" />


    <XAxisTitle title="Left I" alignment="left" rotate={true} />
    <XAxisTitle title="Center +" alignment="center" rotate={true} />
    <XAxisTitle title="Right I" alignment="right" rotate={true} />

    <XAxisTitle title="I Left" alignment="left" placement="above" rotate={true} />
    <XAxisTitle title="+ Center" alignment="center" placement="above" rotate={true} />
    <XAxisTitle title="I Right" alignment="right" placement="above" rotate={true} />


    <XAxisTitle title="I Left " position="top" alignment="left" />
    <XAxisTitle title="Center + Center" position="top" alignment="center" />
    <XAxisTitle title="Right I" position="top" alignment="right" />

    <XAxisTitle title="I Left " position="top" alignment="left" placement="below" />
    <XAxisTitle title="Center + Center" position="top" alignment="center" placement="below" />
    <XAxisTitle title="Right I" position="top" alignment="right" placement="below" />


    <XAxisTitle title="I Left" position="top" alignment="left" rotate={true} />
    <XAxisTitle title="+ Center" position="top" alignment="center" rotate={true} />
    <XAxisTitle title="I Right" position="top" alignment="right" rotate={true} />

    <XAxisTitle title="Left I" position="top" alignment="left" placement="below" rotate={true} />
    <XAxisTitle title="Center +" position="top" alignment="center" placement="below" rotate={true} />
    <XAxisTitle title="Right I" position="top" alignment="right" placement="below" rotate={true} />
  </XYPlot>;
};

const BarChartExample = (props) => {
  const count = 30;
  const startDate = new Date(1992, 0, 1);

  const numbers = _.range(count);
  const letters = _.times(count, n => String.fromCharCode(97 + n));
  const dates = _.times(count, n => new Date(+(startDate) + (n * 1000 * 60 * 60 * 24 * 100)));

  const getNumberValue = (d) => 2 + Math.cos(d / 10);
  const getDateValue = (d) => getNumberValue(d.getFullYear() + (d.getMonth() / 12));
  const getLetterValue = (d) => getNumberValue(d.charCodeAt(0));

  const chartDefs = _.zip([numbers, letters, dates], [getNumberValue, getLetterValue, getDateValue]);

  return <div>
    {([true, false]).map(horizontal => {
      return <div>
        <h4>{horizontal ? "Horizontal" : "Vertical"}</h4>

        {chartDefs.map(([data, getValue]) => {
          return <XYPlot width={320} height={320}>
            <XAxis /><YAxis />
            <BarChart
              data={data}
              horizontal={horizontal}
              getX={horizontal ? getValue : null}
              getY={horizontal ? null : getValue}
            />
          </XYPlot>;
        })}
      </div>;
    })}
    <PropsTable
      items={[
        {name: 'scale', type: 'Function', description: ''},
        {name: 'data', type: 'Array', description: ''},
        {name: 'horizontal', type: 'Boolean', description: ''},
        {name: 'getX', type: 'Function', description: ''},
        {name: 'getY', type: 'Function', description: ''},
        {name: 'barThickness', type: 'Number', description: ''},
        {name: 'barClassName', type: 'Number', description: ''},
        {name: 'barStyle', type: 'Object', description: ''},
      ]}
    />
  </div>
};

const AreaBarChartExample = (props) => {
  return <div>
    <XYPlot width={500} height={320}>
      <XAxis /><YAxis />
      <AreaBarChart
        data={_.range(15)}
        getX={d => Math.sin(d / 10) * 10}
        getXEnd={d => Math.sin((d + 1) / 10) * 10}
        getY={d => Math.cos(d / (Math.PI))}
      />
    </XYPlot>;
    <XYPlot width={320} height={500}>
      <XAxis /><YAxis />
      <AreaBarChart
        horizontal
        data={_.range(15)}
        getX={d => Math.cos(d / (Math.PI))}
        getY={d => Math.sin(d / 10) * 10}
        getYEnd={d => Math.sin((d + 1) / 10) * 10}
      />
    </XYPlot>;
    <PropsTable
      items={[
        {name: 'scale', type: 'Function', description: ''},
        {name: 'data', type: 'Array', description: ''},
        {name: 'horizontal', type: 'Boolean', description: ''},
        {name: 'getX', type: 'Function', description: ''},
        {name: 'getXEnd', type: 'Function', description: ''},
        {name: 'getY', type: 'Function', description: ''},
        {name: 'getYEnd', type: 'Function', description: ''},
        {name: 'barClassName', type: 'String', description: ''},
        {name: 'barStyle', type: 'Object', description: ''},
      ]}
    />
  </div>
};


const RangeRectExample = (props) => {
  return <div>
    <XYPlot width={500} height={320} domain={{x: [0, 100], y: [0, 100]}}>
      <XAxis /><YAxis />
      <RangeRect
        datum={[10, 40, 50, 80]} getX={0}
        getXEnd={1} getY={2} getYEnd={3}
        style={{fill: 'rebeccapurple'}}
      />
      <RangeRect
        datum={[65, 85, 15, 95]}
        getX={0} getXEnd={1} getY={2} getYEnd={3}
        style={{fill: 'coral'}}
      />
    </XYPlot>
    <PropsTable
      items={[
        {name: 'datum', type:'Number', description: ''},
        {name: 'getX', type: 'Number', description: ''},
        {name: 'getXEnd', type: 'Number', description: ''},
        {name: 'getY', type: 'Number', description: ''},
        {name: 'getYEnd', type: 'Number', description: ''}
      ]}
    />
  </div>;
};

export const examples = [
  {id: 'line', title: 'Line Chart', Component: LineChartExample},
  {id: 'interactiveLine', title: 'Interactive Line Chart', Component: InteractiveLineExample},
  {id: 'barChart', title: 'Bar Chart', Component: BarChartExample},
  {id: 'scatter', title: 'Scatter Plot', Component: ScatterPlotExample},
  {id: 'rangeBar', title: 'Range Bar Chart', Component: RangeBarChartExample},
  {id: 'areaBar', title: 'Area Bar Chart', Component: AreaBarChartExample},
  {id: 'rangeRect', title: 'Range Rect', Component: RangeRectExample},
  {id: 'treeMap', title: 'TreeMap', Component: TreeMapExample},
  {id: 'xyAxis', title: 'X/Y Axis', Component: XYAxisExample},
  {id: 'xAxisTitles', title: 'X Axis Titles', Component: XAxisTitleTest},
  {id: 'yAxisTitles', title: 'Y Axis Titles', Component: YAxisTitleTest},
  {id: 'areaHeatmap', title: 'Area Heatmap Chart', Component: AreaHeatmapExample},
  {id: 'markerLine', title: 'Marker Line Chart', Component: MarkerLineExample},
  {id: 'kde', title: 'Kernel Density Estimation Chart', Component: KDEExample},
  {id: 'histogram', title: 'Histogram + KDE', Component: HistogramKDEExample},
  {id: 'barMarkerLine', title: 'Bar Charts with Marker Lines', Component: BarMarkerLineExample},
  {id: 'customChildren', title: 'Custom Chart Children', Component: CustomChildExample},
  {id: 'multipleXY', title: 'Multiple Chart Types in one XYPlot', Component: MultipleXYExample},
  {id: 'pie', title: 'Pie/Donut Chart', Component: PieChartExample}

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
    const innerSize = {width: 900, height: 400};
    const dateDomain = [new Date(2005, 0, 1), new Date(2015, 0, 1)];
    const numberDomain = [-20, 20];
    const testXScale = d3.time.scale().domain(dateDomain).range([0, innerSize.width]);
    const testYScale = d3.scale.linear().domain([-20, 20]).range([innerSize.height, 0]);
    const linearXScale = d3.scale.linear().domain([-.05, .05]).range([0, innerSize.width]);
    const customDateTicks = [new Date(2009, 0, 1), new Date(2014, 7, 1), new Date(2017, 0, 1)];
    const smallSize = {width: 300, height: 210};

    return <div>
      <h1>Reactochart Examples</h1>

      {this.renderExamples()}

      <div>
        <XYPlot domain={{y: [-1, 1], x: [-1, 1]}} scaleType="linear" {...{width: 900, height: 350}}>
          <XAxis title="Phase" />
          <YAxis title="Intensity" />

          <RangeBarChart
            data={_.range(-1, 1, .005)}
            getX={null}
            getY={d => Math.sin(d*6)}
            getYEnd={d => Math.sin(d*6) * Math.cos(d*6)}
            barThickness={2}
          />
        </XYPlot>
      </div>

      <div>
        <XYPlot scaleType="linear" {...{width: 600, height: 350}}>
          <XAxis title="Phase" gridLineStyle={{stroke: '#777'}} />
          <YAxis title="Intensity" titleRotate={false} gridLineStyle={{stroke: '#777'}} />
          <YAxis title="Intensity" position="right" labelStyle={{fontSize: '12px'}} />

          <LineChart data={_.range(100)} getY={d => Math.sin(d*.1)} />
          <LineChart data={_.range(100)} getY={d => Math.cos(d*.1)} />
        </XYPlot>
      </div>
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
