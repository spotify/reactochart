import _ from 'lodash';
import d3 from 'd3';
import React from 'react';
import update from 'react-addons-update';
import numeral from 'numeral';

import {
  PieChart,
  XYPlot,
  LineChart,
  BarChart,
  MarkerLineChart,
  ScatterPlot,
  Histogram,
  KernelDensityEstimation
} from '../../src';

import XYPlot2 from '../../src/charts/XYPlot2';

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
      <XYPlot width={700} height={500} axisLabel={{x: "TIME", y: "EMOJI"}}>
        {/*
         <ScatterPlot
         data={randomScatter[3]}
         getValue={{x: 0, y: 1}}
         pointSymbol={rectangleSymbol}
         />
         <ScatterPlot
         data={randomScatter[4]}
         getValue={{x: 0, y: 1}}
         pointRadius={2}
         />

         <ScatterPlot
         data={randomScatter[0]}
         getValue={{x: 0, y: 1}}
         pointSymbol={(d, i) => i}
         />
         <ScatterPlot
         data={randomScatter[2]}
         getValue={{x: 0, y: 1}}
         pointSymbol={triangleSymbol}
         pointOffset={[-4, -3]}
         />
         */}
        <ScatterPlot
          data={randomScatter[1]}
          getValue={{x: 0, y: 1}}
          pointSymbol={randomEmoji}
          pointOffset={[0, 2]}
        />
      </XYPlot>
    </div>
  }
});

const LineChartExample = React.createClass({
  render() {
    return <div>
      <XYPlot width={700}>
        <LineChart
          data={_.range(-10,10,0.01)}
          getValue={{x: null, y: (n) => Math.sin(n)}}
        />
        <LineChart
          data={_.range(-10,10,0.01)}
          getValue={{
            x: null,
            y: (n) => Math.sin(Math.pow(Math.abs(n), Math.abs(n*.18))) * Math.cos(n)
          }}
        />
        <LineChart
          data={_.range(-10,10,0.01)}
          getValue={{
            x: null,
            y: (n) => Math.sin(n*0.5) * Math.cos(n)
          }}
        />
      </XYPlot>
    </div>
  }
});

const InteractiveLineExample = React.createClass({
  getInitialState() {
    return {
      hoveredXYPlotData: null
    }
  },
  onMouseMoveXYPlot(d, event) {
    this.setState({hoveredXYPlotData: d})
  },
  render() {
    const {hoveredXYPlotData} = this.state;
    return <div>
      {hoveredXYPlotData ?
        <div>
          {hoveredXYPlotData[0] + ', ' + hoveredXYPlotData[1]}
        </div> :
        <div>Hover over the chart to show values</div>
      }
      <XYPlot width={700} height={400} onMouseMove={this.onMouseMoveXYPlot}>
        <LineChart data={randomSequences[0]} getValue={{x: 0, y: 1}} />
        <LineChart data={randomSequences[1]} getValue={{x: 0, y: 1}} />
        <LineChart data={randomSequences[2]} getValue={{x: 0, y: 1}} />
      </XYPlot>
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

export const examples = [
  {id: 'line', title: 'Line Chart', Component: LineChartExample},
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

import XAxis from 'components/XAxis';
import XTicks from 'components/XTicks';
import XLine from 'components/XLine';
import XGrid from 'components/XGrid';

import YLine from 'components/YLine';
import YGrid from 'components/YGrid';

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

    const width = 300;
    const height = 200;
    const testXScale = d3.scale.linear().domain([-5, 5]).range([0, width]);
    const testYScale = d3.scale.linear().domain([-20, 20]).range([height, 0]);

    const innerSize = {width: 300, height: 200};

    return <div>
      <h1>Reactochart Examples</h1>

      <svg width={400} height={500}>
        <g transform="translate(50, 50)">
          <rect fill="lightblue" width="300" height="200" />

          <XGrid scale={testXScale} lineStyle={{stroke: 'orange'}} {...innerSize} />

          <XAxis top scale={testXScale} tickStyle={{stroke: 'blue'}} {...innerSize} />
          <XAxis top inner scale={testXScale} tickStyle={{stroke: 'red'}} {...innerSize} />

          <XAxis scale={testXScale} tickLength={8} {...innerSize} />
          <XAxis inner scale={testXScale} tickStyle={{stroke: 'red'}} {...innerSize} />

          <XLine scale={testXScale} value={0} lineStyle={{stroke: 'gray'}} {...innerSize} />
          <XLine scale={testXScale} value={2} lineStyle={{stroke: 'gray'}} {...innerSize} />
          <XLine scale={testXScale} value={-3} lineStyle={{stroke: 'gray'}} {...innerSize} />

          <XLine scale={testXScale} value={0} lineStyle={{stroke: 'gray'}} {...innerSize} />
          <XLine scale={testXScale} value={2} lineStyle={{stroke: 'gray'}} {...innerSize} />
          <XLine scale={testXScale} value={-3} lineStyle={{stroke: 'gray'}} {...innerSize} />

          <YGrid scale={testYScale} lineStyle={{stroke: 'blue'}} {...innerSize} />

          <YLine scale={testYScale} value={-5} lineStyle={{stroke: 'purple'}} {...innerSize} />
          <YLine scale={testYScale} value={10} lineStyle={{stroke: 'purple'}} {...innerSize} />
          <YLine scale={testYScale} value={0} lineStyle={{stroke: 'purple'}} {...innerSize} />

        </g>
      </svg>



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

      <div>
        <XYPlot2 margin={{left: 100}} domain={[0, 100]} scaleType="linear"/>
      </div>
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
