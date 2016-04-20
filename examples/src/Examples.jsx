import _ from 'lodash';
import d3 from 'd3';
import React from 'react';
import update from 'react-addons-update';
import numeral from 'numeral';

import {
  XYPlot,
  BarChart,
  Histogram,
} from '../../src';

import XYPlot2 from '../../src/XYPlot2';

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

import BarChart2 from '../../src/BarChart';
import Bar from '../../src/Bar';
import RangeBarChart from '../../src/RangeBarChart';

import LineChart from '../../src/LineChart';
import AreaHeatmap from '../../src/AreaHeatmap';
import ScatterPlot from '../../src/ScatterPlot';
import PieChart from '../../src/PieChart';

import MarkerLineChart from '../../src/MarkerLineChart';
import KernelDensityEstimation from '../../src/KernelDensityEstimation';


import {randomWalk, randomWalkSeries} from './data/util';

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

const getXYArrayValue = {
  // accessors for getting (X, Y) data from simple arrays-of-arrays that look like [[x, y], [x, y]]
  x: d => d[0],
  y: d => d[1]
};

const PieChartExample = React.createClass({
  getInitialState() { return {sinVal: 0}; },
  componentWillMount() {
    this.interval = setInterval(() => this.setState({ // why? because fun!
      sinVal: Math.min(Math.abs((Math.cos(new Date() * .001) * Math.sin(new Date() * .0011)) + 1), 2)
    }), 20);
  },
  componentWillUnmount() { clearInterval(this.interval); },

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
    </div>
  }
});

const ScatterPlotExample = React.createClass({
  render() {
    const rectangleSymbol = <rect width={5} height={5} fill="rebeccapurple" />;
    const triangleSymbol = <svg><polygon points="0,0 8,0 4,8" style={{fill: 'darkgreen'}} /></svg>;
    const randomEmoji = (d, i) => _.sample(emojis);

    return <div>
      <XYPlot2 width={700} height={500}>
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
      </XYPlot2>
    </div>
  }
});

const LineChartExample = React.createClass({
  render() {
    return <div>
      <XYPlot2 width={700}>
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
      </XYPlot2>
    </div>
  }
});

const xyArrGetter = {x: 0, y: 1};
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
      <XYPlot2 width={700} height={400} onMouseMove={this.onMouseMoveXYPlot} onClick={this.onClick}>
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
      </XYPlot2>
    </div>
  }
});

const HistogramExample = React.createClass({
  render() {
    return <div>
      <div>
        <XYPlot margin={{left: 40, right: 8}} width={700} height={300}>
          <Histogram
            data={randomNormal} getValue={{x: null}}
          />
          <KernelDensityEstimation
            data={randomNormal} getValue={{x: null}} bandwidth={0.5}
          />
          <KernelDensityEstimation
            data={randomNormal} getValue={{x: null}} bandwidth={0.1}
          />
          <KernelDensityEstimation
            data={randomNormal} getValue={{x: null}} bandwidth={2}
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
            getValue={{
              x: null,
              y: () => Math.random()
            }}
            pointRadius={1}
          />
        </XYPlot>
      </div>
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
        <BarChart data={randomBarData2.numberNumber} getValue={{x: 0, y: 1}} />
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
          getValue={{x: 0, y: 1}}
          barThickness={20}
        />
      </XYPlot>
    </div>
  }
});

const CustomChildExample = React.createClass({
  getInitialState() {
    return {
      hoveredYVal: null
    }
  },
  onMouseMoveChart(hovered, e, options) {
    console.log(hovered, e, options);
    const {chartYVal} = options;
    this.setState({hoveredYVal: chartYVal});
  },
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
        <CustomSelectionRect underAxes={true} hoveredYVal={this.state.hoveredYVal} />
        <BarChart
          data={randomBarData2.numberOrdinal}
          getValue={{x: 0, y: 1}}
          orientation="horizontal"
          barThickness={20}
        />
      </XYPlot>
    </div>
  }
});

const CustomSelectionRect = React.createClass({
  render() {
    const {scale, hoveredYVal} = this.props;
    return hoveredYVal ?
      <rect
        x="0"
        y={scale.y(hoveredYVal) - 20}
        width="200" height="40"
        underAxes={true}
        style={{fill: 'red'}}
      /> : null;
  }
});

const MultipleXYExample = React.createClass({
  render() {
    return <div>
      <XYPlot>
        <BarChart data={randomBars[0]} getValue={{x: 0, y: 1}} />
        <LineChart data={randomBars[0]} getValue={{x: 0, y: 1}} />
        <ScatterPlot data={randomBars[0]} getValue={{x: 0, y: 1}} pointSymbol={(d, i) => _.sample(emojis)} />
      </XYPlot>
    </div>
  }
});

const ValueValueBarExample = React.createClass({
  render() {
    return <div>
      <h2>Vertical</h2>

      <div>
        <div>Number-Number, Ordinal-Number, Time-Number</div>
        <XYPlot width={300} height={300}>
          <BarChart data={randomBarData2.numberNumber} getValue={{x: 0, y: 1}} />
        </XYPlot>
        <XYPlot width={300} height={300} axisType={{x: 'ordinal'}}>
          <BarChart data={randomBarData2.numberOrdinal} getValue={{x: 1, y: 0}} />
        </XYPlot>
        <XYPlot width={300} height={300} axisType={{x: 'time'}}>
          <BarChart data={randomBarData2.numberTime} getValue={{x: 1, y: 0}} />
        </XYPlot>

        <div>Number-Ordinal, Ordinal-Ordinal, Time-Ordinal</div>
        <XYPlot width={300} height={300} axisType={{y: 'ordinal'}}>
          <BarChart data={randomBarData2.numberOrdinal} getValue={{x: 0, y: 1}} />
        </XYPlot>
        <XYPlot width={300} height={300} axisType={{x: 'ordinal', y: 'ordinal'}}>
          <BarChart data={randomBarData2.ordinalOrdinal} getValue={{x: 0, y: 1}} />
        </XYPlot>
        <XYPlot width={300} height={300} axisType={{x: 'time', y: 'ordinal'}}>
          <BarChart data={randomBarData2.ordinalTime} getValue={{x: 1, y: 0}} />
        </XYPlot>

        <div>Number-Time, Ordinal-Time, Time-Time</div>
        <XYPlot width={300} height={300} axisType={{y: 'time'}}>
          <BarChart data={randomBarData2.numberTime} getValue={{x: 0, y: 1}} />
        </XYPlot>
        <XYPlot width={300} height={300} axisType={{x: 'ordinal', y: 'time'}}>
          <BarChart data={randomBarData2.ordinalTime} getValue={{x: 0, y: 1}} />
        </XYPlot>
        <XYPlot width={300} height={300} axisType={{x: 'time', y: 'time'}}>
          <BarChart data={randomBarData2.timeTime} getValue={{x: 0, y: 1}} />
        </XYPlot>
      </div>

      <h2>Horizontal</h2>

      <div>
        <div>Number-Number, Ordinal-Number, Date-Number</div>
        <XYPlot width={300} height={300}>
          <BarChart data={randomBarData2.numberNumber} getValue={{x: 1, y: 0}} orientation="horizontal"/>
        </XYPlot>
        <XYPlot width={300} height={300} axisType={{y: 'ordinal'}}>
          <BarChart data={randomBarData2.numberOrdinal} getValue={{x: 0, y: 1}} orientation="horizontal" />
        </XYPlot>
        <XYPlot width={300} height={300} axisType={{y: 'time'}}>
          <BarChart data={randomBarData2.numberTime} getValue={{x: 0, y: 1}} orientation="horizontal" />
        </XYPlot>

        <div>Number-Ordinal, Ordinal-Ordinal, Date-Ordinal</div>
        <XYPlot width={300} height={300} axisType={{x: 'ordinal'}}>
          <BarChart data={randomBarData2.numberOrdinal} getValue={{x: 1, y: 0}} orientation="horizontal" />
        </XYPlot>
        <XYPlot width={300} height={300} axisType={{x: 'ordinal', y: 'ordinal'}}>
          <BarChart data={randomBarData2.ordinalOrdinal} getValue={{x: 1, y: 0}} orientation="horizontal" />
        </XYPlot>
        <XYPlot width={300} height={300} axisType={{x: 'ordinal', y: 'time'}}>
          <BarChart data={randomBarData2.ordinalTime} getValue={{x: 0, y: 1}} orientation="horizontal" />
        </XYPlot>

        <div>Number-Time, Ordinal-Time, Time-Time</div>
        <XYPlot width={300} height={300} axisType={{x: 'time'}}>
          <BarChart data={randomBarData2.numberTime} getValue={{x: 1, y: 0}} orientation="horizontal" />
        </XYPlot>
        <XYPlot width={300} height={300} axisType={{x: 'time', y: 'ordinal'}}>
          <BarChart data={randomBarData2.ordinalTime} getValue={{x: 1, y: 0}} orientation="horizontal" />
        </XYPlot>
        <XYPlot width={300} height={300} axisType={{x: 'time', y: 'time'}}>
          <BarChart data={randomBarData2.timeTime} getValue={{x: 1, y: 0}} orientation="horizontal" />
        </XYPlot>
      </div>
    </div>
  }
});

const RangeValueBarExample = React.createClass({
  render() {
    return <div>
      <h2>Vertical</h2>
      <div>
        <XYPlot width={400} height={300}>
          <BarChart
            data={rangeValueData.numberNumber}
            getValue={{x: d => d[0][0], y: 1}}
            getEndValue={{x: d => d[0][1]}}
          />
        </XYPlot>
      </div>

      <h2>Horizontal</h2>
      <div>
        <XYPlot width={400} height={300}>
          <BarChart
            data={rangeValueData.numberNumber}
            orientation="horizontal"
            getValue={{x: 1, y: d => d[0][0]}}
            getEndValue={{y: d => d[0][1]}}
          />
        </XYPlot>
      </div>

    </div>
  }
});

const BarMarkerLineExample = React.createClass({
  render() {
    return <div>
      <div>
        <XYPlot width={400} height={300}>
          <BarChart
            data={randomBarData2.numberNumber}
            getValue={{x: 0, y: 1}}
          />
          <MarkerLineChart
            data={barTickData.numberNumber}
            getValue={{x: 0, y: 1}}
            lineLength={15}
          />
        </XYPlot>
        <XYPlot width={400} height={300}>
          <BarChart
            data={randomBarData2.numberNumber}
            getValue={{x: 1, y: 0}}
            orientation="horizontal" />
          <MarkerLineChart
            data={barTickData.numberNumber}
            getValue={{x: 1, y: 0}}
            lineLength={15}
            orientation="horizontal" />
        </XYPlot>
      </div>
      <div>
        <XYPlot width={400} height={300}>
          <BarChart
            data={rangeValueData.numberNumber}
            getValue={{x: d => d[0][0], y: 1}}
            getEndValue={{x: d => d[0][1]}}
          />
          <MarkerLineChart
            data={barTickData.numberRangeNumber}
            getValue={{x: d => d[0][0], y: 1}}
            getEndValue={{x: d => d[0][1]}}
          />
        </XYPlot>
        <XYPlot width={400} height={300}>
          <BarChart
            data={rangeValueData.numberNumber}
            orientation="horizontal"
            getValue={{x: 1, y: d => d[0][0]}}
            getEndValue={{y: d => d[0][1]}}
          />
          <MarkerLineChart
            data={barTickData.numberRangeNumber}
            orientation="horizontal"
            getValue={{x: 1, y: d => d[0][0]}}
            getEndValue={{y: d => d[0][1]}}
          />
        </XYPlot>
      </div>
    </div>
  }
});

const AxisLabelExample = React.createClass({
  render() {
    const xyProps = {width: 400, height: 300, axisType: {y: 'ordinal'}};
    const barChartProps = {
      data: randomBarData2.numberOrdinal,
      getValue: {x: 0, y: 1},
      orientation: 'horizontal'
    };
    return <div>
      <XYPlot {...xyProps} axisLabel={{x: "Account Age"}}>
        <BarChart {...barChartProps} />
      </XYPlot>
      <XYPlot {...xyProps} axisLabel={{y: "Active Users"}}>
        <BarChart {...barChartProps} />
      </XYPlot>
      <XYPlot {...xyProps} axisLabel={{x: "Account Age", y: "Active Users"}}>
        <BarChart {...barChartProps} />
      </XYPlot>
    </div>
  }
});

const dateDomain = [new Date(1992, 0, 1), new Date(2001, 0, 1)];
const numberDomain = [-20, 20];

const XYAxisExample = (props) => {
  const domain = {x: dateDomain, y: numberDomain};

  const smallSize = {width: 230, height: 180};
  const bigSize = {width: 550, height: 300};

  return <div>
    <div>
      <XYPlot2 domain={domain} {...bigSize}>
        <YAxis title="Hip Hop"/>
        <XAxis title="Hooray"/>
      </XYPlot2>
    </div>
    <div>
      <XYPlot2 domain={domain} {...smallSize}>
        <YAxis title="Hip Hop"/>
      </XYPlot2>

      <XYPlot2 domain={domain} {...smallSize}>
        <YTicks />
        <YTicks placement="after" tickLength={10} tickCount={4} />
        <YTicks position="right" tickCount={30} tickLength={15} tickStyle={{stroke: 'red'}} />
        <YTicks position="right" placement="before" tickCount={5} tickLength={18} />
      </XYPlot2>

      <XYPlot2 domain={domain} {...smallSize}>
        <YGrid tickCount={50} />
        <YGrid tickCount={5} lineStyle={{stroke: 'blue', strokewidth: 2}} />
      </XYPlot2>

      <XYPlot2 domain={domain} {...smallSize}>
        <YAxisLabels tickCount={10}/>
        <YAxisLabels position="right" tickCount={10} />
        <YGrid />
      </XYPlot2>

      <XYPlot2 domain={domain} {...smallSize}>
        <YAxisTitle title="Hip Hip" position="right" style={{fontSize: '12px'}} />
        <YAxisTitle title="Hooray" />
      </XYPlot2>
    </div>

    <div>
      <XYPlot2 domain={domain} {...smallSize}>
        <XAxis title="Hooray"/>
      </XYPlot2>

      <XYPlot2 domain={domain} {...smallSize}>
        <XTicks />
        <XTicks position="top" tickCount={120} tickLength={15} tickStyle={{stroke: 'red'}} />
        <XTicks position="top" placement="below" tickCount={50} tickLength={10} />
        <XTicks position="top" placement="below" tickCount={5} tickLength={18} />
      </XYPlot2>

      <XYPlot2 domain={domain} {...smallSize}>
        <XGrid tickCount={50} />
        <XGrid tickCount={5} lineStyle={{stroke: 'blue', strokewidth: 2}} />
      </XYPlot2>

      <XYPlot2 domain={domain} {...smallSize}>
        <XAxisLabels tickCount={5}/>
        <XAxisLabels position="top" distance={2} labelStyle={{fontSize: '10px'}} />
      </XYPlot2>

      <XYPlot2  domain={domain} {...smallSize}>
        <XAxisTitle title="Hip Hip" position="top" style={{fontSize: '12px'}} />
        <XAxisTitle title="Hooray" />
      </XYPlot2>
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
          <XYPlot2 domain={{[dep]: numberDomain, [indep]: [0, count]}} scaleType="linear" {...{width: 300, height: 350}}>
            <XAxis/><YAxis/>
            <RangeBarChart
              horizontal={horizontal}
              data={numberNumberRangeData}
              {...getters}
            />
          </XYPlot2>

          <XYPlot2 domain={{[dep]: numberDomain, [indep]: dateDomain}} {...{width: 300, height: 350}}>
            <XAxis/><YAxis/>
            <RangeBarChart
              horizontal={horizontal}
              data={dateNumberRangeData}
              {...getters}
            />
          </XYPlot2>

          <XYPlot2 domain={{[dep]: numberDomain, [indep]: ordinalDomain}} {...{width: 300, height: 350}}>
            <XAxis/><YAxis/>
            <RangeBarChart
              horizontal={horizontal}
              data={ordinalNumberRangeData}
              {...getters}
            />
          </XYPlot2>
        </div>

        <div>
          <XYPlot2 domain={{[dep]: dateDomain, [indep]: [0, count]}} {...{width: 300, height: 350}}>
            <XAxis/><YAxis/>
            <RangeBarChart
              horizontal={horizontal}
              data={numberDateRangeData}
              {...getters}
            />
          </XYPlot2>

          <XYPlot2 domain={{[dep]: dateDomain, [indep]: dateDomain}} {...{width: 300, height: 350}}>
            <XAxis/><YAxis/>
            <RangeBarChart
              horizontal={horizontal}
              data={dateDateRangeData}
              {...getters}
            />
          </XYPlot2>

          <XYPlot2 domain={{[dep]: dateDomain, [indep]: ordinalDomain}} {...{width: 300, height: 350}}>
            <XAxis/><YAxis/>
            <RangeBarChart
              horizontal={horizontal}
              data={ordinalDateRangeData}
              {...getters}
            />
          </XYPlot2>
        </div>
      </div>
    })}




    <XYPlot2 domain={{y: [-1, 1], x: [-1, 1]}} scaleType="linear" {...{width: 300, height: 350}}>
      <XAxis/><YAxis/>
      <RangeBarChart
        data={_.range(-1, 1, .1)}
        getX={null}
        getY={d => Math.sin(d*2)}
        getYEnd={d => Math.sin(d*2) * Math.cos(d*2)}
        barThickness={6}
      />
    </XYPlot2>
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
    <XYPlot2 scaleType="linear" {...{width: 500, height: 500}}>
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
    </XYPlot2>
  </div>;
};

const MarkerLineExample = (props) => {
  return <div>
    <div>
      <h4>Value/Value</h4>

      <XYPlot2 scaleType="linear" {...{width: 500, height: 500}}>
        <XAxis title="Phase" />
        <YAxis title="Intensity" />
        <MarkerLineChart
          data={_.range(30)}
          getY={d => Math.sin(d / (Math.PI))}
        />
      </XYPlot2>

      <XYPlot2 scaleType="linear" {...{width: 500, height: 500}}>
        <XAxis title="Phase" />
        <YAxis title="Intensity" />
        <MarkerLineChart
          data={_.range(30)}
          getX={d => Math.sin(d / (Math.PI))}
          orientation="horizontal"
        />
      </XYPlot2>
    </div>

    <div>
      <XYPlot2 scaleType="linear" {...{width: 500, height: 500}}>
        <XAxis title="Phase" />
        <YAxis title="Intensity" />
        <MarkerLineChart
          data={_.range(15)}
          getX={d => Math.sin(d / 10) * 10}
          getXEnd={d => Math.sin((d + 1) / 10) * 10}
          getY={d => Math.sin(d / (Math.PI))}
        />
      </XYPlot2>

      <XYPlot2 scaleType="linear" {...{width: 500, height: 500}}>
        <XAxis title="Phase" />
        <YAxis title="Intensity" />
        <MarkerLineChart
          data={_.range(15)}
          getX={d => Math.sin(d / (Math.PI))}
          getY={d => Math.sin(d / 10) * 10}
          getYEnd={d => Math.sin((d + 1) / 10) * 10}
          orientation="horizontal"
        />
      </XYPlot2>
    </div>
  </div>;
};

const KDEExample = (props) => {
  const xyProps = {
    domain: {x: [-4, 6], y: [0, 220]},
    scaleType: "linear"
  };

  return <div>
    <div>
      <XYPlot2 width={700} height={300} {...xyProps}>
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
      </XYPlot2>
    </div>
  </div>;
};

export const examples = [
  {id: 'rangeBar', title: 'Range Bar Chart', Component: RangeBarChartExample},
  {id: 'xyAxis', title: 'X/Y Axis', Component: XYAxisExample},
  {id: 'line', title: 'Line Chart', Component: LineChartExample},
  {id: 'areaHeatmap', title: 'Area Heatmap Chart', Component: AreaHeatmapExample},
  {id: 'markerLine', title: 'Marker Line Chart', Component: MarkerLineExample},
  {id: 'kde', title: 'Kernel Density Estimation Chart', Component: KDEExample},
  {id: 'interactiveLine', title: 'Interactive Line Chart', Component: InteractiveLineExample},
  {id: 'axisLabels', title: 'Axis Labels', Component: AxisLabelExample},
  {id: 'valueValueBar', title: 'Value-Value Bar Charts', Component: ValueValueBarExample},
  {id: 'rangeValueBar', title: 'Range-Value Bar Charts', Component: RangeValueBarExample},
  {id: 'barMarkerLine', title: 'Bar Charts with Marker Lines', Component: BarMarkerLineExample},
  {id: 'scatter', title: 'Scatter Plot', Component: ScatterPlotExample},
  {id: 'histogram', title: 'Histogram', Component: HistogramExample},
  {id: 'customTicks', title: 'Custom Axis Ticks', Component: CustomTicksExample},
  {id: 'customAxisLabels', title: 'Custom Axis Labels', Component: CustomAxisLabelsExample},
  {id: 'customChildren', title: 'Custom Chart Children', Component: CustomChildExample},
  {id: 'multipleXY', title: 'Multiple Chart Types in one XYPlot', Component: MultipleXYExample},
  {id: 'pie', title: 'Pie/Donut Chart', Component: PieChartExample}
];


class YAxisTitleTest extends React.Component {
  render() {
    const {width, height} = this.props;
    const size = {width, height};
    return <g>
      <YAxisTitle title="Top I" alignment="top" {...size} />
      <YAxisTitle title="Mid + Mid" alignment="middle" {...size} />
      <YAxisTitle title="I Bottom" alignment="bottom" {...size} />

      <YAxisTitle title="Top I" alignment="top" rotate={false} {...size} />
      <YAxisTitle title="Mid +" alignment="middle" rotate={false} {...size} />
      <YAxisTitle title="Bottom I" alignment="bottom" rotate={false} {...size} />


      <YAxisTitle title="Top I" alignment="top" placement="after" {...size} />
      <YAxisTitle title="Mid + Mid" alignment="middle" placement="after" {...size} />
      <YAxisTitle title="I Bottom" alignment="bottom" placement="after" {...size} />

      <YAxisTitle title="I Top" alignment="top" placement="after" rotate={false} {...size} />
      <YAxisTitle title="+ Mid" alignment="middle" placement="after" rotate={false} {...size} />
      <YAxisTitle title="I Bottom" alignment="bottom" placement="after" rotate={false} {...size} />


      <YAxisTitle title="Top I" alignment="top" position="right" {...size} />
      <YAxisTitle title="Mid + Mid" alignment="middle" position="right" {...size} />
      <YAxisTitle title="I Bottom" alignment="bottom" position="right" {...size} />

      <YAxisTitle title="I Top" alignment="top" position="right" rotate={false} {...size} />
      <YAxisTitle title="+ Mid" alignment="middle" position="right" rotate={false} {...size} />
      <YAxisTitle title="I Bottom" alignment="bottom" position="right" rotate={false} {...size} />


      <YAxisTitle title="Top I" alignment="top" placement="before" position="right" {...size} />
      <YAxisTitle title="Mid + Mid" alignment="middle" placement="before" position="right" {...size} />
      <YAxisTitle title="I Bottom" alignment="bottom" placement="before" position="right" {...size} />

      <YAxisTitle title="Top I" alignment="top" position="right" placement="before" rotate={false} {...size} />
      <YAxisTitle title="Mid +" alignment="middle" position="right" placement="before" rotate={false} {...size} />
      <YAxisTitle title="Bottom I" alignment="bottom" position="right" placement="before" rotate={false} {...size} />
    </g>;
  }
}

class XAxisTitleTest extends React.Component {
  render() {
    const {width, height} = this.props;
    const size = {width, height};
    return <g>
      <XAxisTitle title="I Left" alignment="left" {...size} />
      <XAxisTitle title="Center + Center" alignment="center" {...size} />
      <XAxisTitle title="Right I" alignment="right" {...size} />

      <XAxisTitle title="I Left" alignment="left" placement="above" {...size} />
      <XAxisTitle title="Center + Center" alignment="center" placement="above" {...size} />
      <XAxisTitle title="Right I" alignment="right" placement="above" {...size} />


      <XAxisTitle title="Left I" alignment="left" rotate={true} {...size} />
      <XAxisTitle title="Center +" alignment="center" rotate={true} {...size} />
      <XAxisTitle title="Right I" alignment="right" rotate={true} {...size} />

      <XAxisTitle title="I Left" alignment="left" placement="above" rotate={true} {...size} />
      <XAxisTitle title="+ Center" alignment="center" placement="above" rotate={true} {...size} />
      <XAxisTitle title="I Right" alignment="right" placement="above" rotate={true} {...size} />


      <XAxisTitle title="I Left " position="top" alignment="left" {...size} />
      <XAxisTitle title="Center + Center" position="top" alignment="center" {...size} />
      <XAxisTitle title="Right I" position="top" alignment="right" {...size} />

      <XAxisTitle title="I Left " position="top" alignment="left" placement="below" {...size} />
      <XAxisTitle title="Center + Center" position="top" alignment="center" placement="below" {...size} />
      <XAxisTitle title="Right I" position="top" alignment="right" placement="below" {...size} />


      <XAxisTitle title="I Left" position="top" alignment="left" rotate={true} {...size} />
      <XAxisTitle title="+ Center" position="top" alignment="center" rotate={true} {...size} />
      <XAxisTitle title="I Right" position="top" alignment="right" rotate={true} {...size} />

      <XAxisTitle title="Left I" position="top" alignment="left" placement="below" rotate={true} {...size} />
      <XAxisTitle title="Center +" position="top" alignment="center" placement="below" rotate={true} {...size} />
      <XAxisTitle title="Right I" position="top" alignment="right" placement="below" rotate={true} {...size} />
    </g>;
  }
}


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

      <div>
        {/*
        <XYPlot2 domain={{x: [0, 100], y: [-1, 1]}} scaleType="linear" {...{width: 600, height: 350}}>
          <XAxis title="Phase" gridLineStyle={{stroke: '#777'}} />
          <YAxis title="Intensity" titleRotate={false} gridLineStyle={{stroke: '#777'}} />
          <YAxis title="Intensity" position="right" showGrid={false} labelStyle={{fontSize: '12px'}} />

          <RangeBarChart data={_.range(100)} getX={null} getY={() => 0} getYEnd={d => Math.sin(d*.1)} />
        </XYPlot2>
        */}

        <XYPlot2 domain={{y: [-1, 1], x: [-1, 1]}} scaleType="linear" {...{width: 900, height: 350}}>
          <XAxis title="Phase" />
          <YAxis title="Intensity" />

          <RangeBarChart
            data={_.range(-1, 1, .005)}
            getX={null}
            getY={d => Math.sin(d*6)}
            getYEnd={d => Math.sin(d*6) * Math.cos(d*6)}
            barThickness={2}
          />

          {/*
          <RangeBarChart horizontal data={_.range(-1, 1, .05)} getY={null} getX={() => 0} getXEnd={d => Math.cos(d*3)} />
          <RangeBarChart data={_.range(-1, 1, .05)} getX={null} getY={() => 0} getYEnd={d => Math.cos(d*3)} />
           */}
        </XYPlot2>
      </div>

      <div>
        <XYPlot2 scaleType="linear" {...{width: 600, height: 350}}>
          <XAxis title="Phase" gridLineStyle={{stroke: '#777'}} />
          <YAxis title="Intensity" titleRotate={false} gridLineStyle={{stroke: '#777'}} />
          <YAxis title="Intensity" position="right" labelStyle={{fontSize: '12px'}} />

          <LineChart data={_.range(100)} getY={d => Math.sin(d*.1)} />
          <LineChart data={_.range(100)} getY={d => Math.cos(d*.1)} />
        </XYPlot2>
      </div>



      {/*

       <CombinedChildMargins {...{width: 500, height: 300, domain: dateDomain}}>
       <XAxisTitle {...{title: "X Title syzygy"}} />
       <XAxisTitle {...{title: "X Top", position: 'top', rotate: true}} />
       <YAxisTitle {...{title: "Y Title syzygy"}} />
       <YAxisTitle {...{title: "Y Title Right", position: 'right', rotate: false}} />
       </CombinedChildMargins>

       <CombinedChildMargins {...{width: 500, height: 300, domain: dateDomain}}>
       <XTicks scale={testXScale} tickLength={10} />
       <XTicks scale={testXScale} tickLength={20} position="top" />
       <YAxisTitle {...{title: "Y Title Right", position: 'right'}} />
       </CombinedChildMargins>

       <CombinedChildMargins {...{width: 800, height: 400, domain: dateDomain}}>
       <XAxis title="X Title syzygy" tickLength={10} gridLineStyle={{stroke: '#666'}}/>
       <XAxis title="X Title syzygy" position="top" tickLength={18} />
       <YAxisTitle {...{title: "Y Title Right"}} />
       <YAxisTitle {...{title: "Y Title Right", position: 'right'}} />
       <YGrid lineStyle={{stroke: '#666'}} />
       </CombinedChildMargins>


       <svg width={innerSize.width + 200} height={innerSize.height + 200}>
       <g transform="translate(100, 100)">
       <rect fill="#dddddd" {...innerSize} />
       <XGrid scale={testXScale} lineStyle={{stroke: '#666'}} {...innerSize} />
       <YGrid scale={testYScale} lineStyle={{stroke: '#666'}} {...innerSize} />
       <XAxisTitleTest {...innerSize} />
       </g>
       </svg>

       <svg width={innerSize.width + 200} height={innerSize.height + 200}>
       <g transform="translate(100, 100)">
       <rect fill="#dddddd" {...innerSize} />
       <XGrid scale={testXScale} lineStyle={{stroke: '#666'}} {...innerSize} />
       <YGrid scale={testYScale} lineStyle={{stroke: '#666'}} {...innerSize} />
       <YAxisTitleTest {...innerSize} />
       </g>
       </svg>


       <svg width={innerSize.width + 200} height={innerSize.height + 200}>
       <g transform="translate(100, 100)">
       <rect fill="#dddddd" {...innerSize} />

       <XGrid scale={testXScale} lineStyle={{stroke: '#ccc'}} tickCount={40} {...innerSize} />
       <YGrid scale={testYScale} lineStyle={{stroke: '#ccc'}} tickCount={40} {...innerSize} />
       <XGrid scale={testXScale} lineStyle={{stroke: '#666'}} {...innerSize} />
       <YGrid scale={testYScale} lineStyle={{stroke: '#666'}} {...innerSize} />

       <XAxis title="Bottom Date" scale={testXScale} {...innerSize} />
       <XAxis position="top" title="Top Date" scale={testXScale} tickStyle={{stroke: 'purple'}} {...innerSize} />

       <YAxisTitle title="Left Value" {...innerSize} />
       <YAxisTitle title="Right Value" position="right" {...innerSize} />

       </g>
       </svg>

       <svg width={innerSize.width + 100} height={innerSize.height + 100}>
       <g transform="translate(50, 50)">
       <rect fill="#dddddd" {...innerSize} />

       <XAxis top scale={linearXScale} tickStyle={{stroke: 'blue'}} {...innerSize} />
       <XAxis top inner scale={linearXScale} tickStyle={{stroke: 'red'}} {...innerSize} />

       <XAxis scale={linearXScale} tickLength={8} {...innerSize} />
       <XAxis inner scale={linearXScale} tickStyle={{stroke: 'red'}} {...innerSize} />

       <XGrid scale={linearXScale} lineStyle={{stroke: '#ccc'}} tickCount={40} {...innerSize} />
       <YGrid scale={testYScale} lineStyle={{stroke: '#ccc'}} tickCount={40} {...innerSize} />
       <XGrid scale={linearXScale} lineStyle={{stroke: '#666'}} {...innerSize} />
       <YGrid scale={testYScale} lineStyle={{stroke: '#666'}} {...innerSize} />

       <XAxisLabels scale={linearXScale} tickCount={6} {...innerSize} />
       <XAxisLabels position="top" scale={linearXScale} {...innerSize} />
       </g>
       </svg>
       */}



      {/*
       <div>
       <LineChart
       margin={10}
       width={500}
       height={300}
       data={[['a', 0.5], ['b', 1], ['c', 0.25]]}
       data={_.range(20).map(i => [i, i*i])}
       getValue={getXYArrayValue}
       />

       </div>


       <div>
       <XYPlot margin={40}>
       <LineChart
       data={[['a', 0.5], ['b', 1], ['c', 0.25]]}
       getValue={getXYArrayValue}
       />
       </XYPlot>
       </div>
       */}

      {/*
       <div>
       <XYPlot
       width={500} height={300}
       xTicks={[0, 1, 2, 4, 8, 16]}
       xLabels={[0, 1, 3, 9, 12]}
       yTicks={[-8000, -3000, 0, 10000, 5000, 20000]}
       yLabels={[-5000, -2000, 0, 8000, 3000, 16000]}
       showYZero={true}
       >
       <BarChart
       data={randomBarData2.numberNumber}
       getValue={{x: 0, y: 1}}
       barThickness={20}
       />
       </XYPlot>
       </div>
       <div>
       <XYPlot
       width={500} height={300}
       xTicks={[0, 1, 2, 4, 8, 16]}
       yTicks={[-8000, -3000, 0, 10000, 5000, 20000]}
       showYZero={true}
       >
       <BarChart
       data={randomBarData2.numberNumber}
       getValue={{x: 0, y: 1}}
       barThickness={20}
       />
       </XYPlot>
       </div>

       */}

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
    return <div className={`example-section example-section-${example.id}`} key={`${example.id}`}>
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

//export default App;
