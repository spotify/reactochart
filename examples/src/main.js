import '../styles/main.less'
import React from 'react/addons';
const {PureRenderMixin} = React.addons;

import {
    // old charts
    V1StackedBarChart,
    V1LineChart,
    // new charts
    XYPlot,
    LineChart,
    BarChart,
    ScatterPlot,
    Histogram,
    KernelDensityEstimation
} from '../../src';

// get/make fake data for testing
import statesData from './data/statesData.json';
import temperatureData from './data/dailyTemperature.json';
import simpleXYData from './data/simpleXY.json';

const tempDataClean = temperatureData.map(d => _.assign({}, d, {date: new Date(d.date)}));

import {randomWalk, randomWalkSeries} from './data/util';
_.extend(window, {randomWalk});

// sample ordinal data
const ordinalData = ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'];
const ordinalData2 = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const randomSequences = [
    randomWalkSeries(500, 100, 3),
    randomWalkSeries(500),
    randomWalkSeries(500, -100, 4)
];

const randomBars = [
    randomWalkSeries(20, 0, 5)
];

const randomScatter = [
    _.zip(randomWalk(20, 100), randomWalk(20, 100)),
    _.zip(randomWalk(30, 100), randomWalk(30, 100)),
    _.zip(randomWalk(50, 100), randomWalk(50, 100)),
    _.zip(randomWalk(100, 100), randomWalk(100, 100)),
    _.zip(randomWalk(200, 100), randomWalk(200, 100))
];

const randomBarData = {
    valueValue: randomWalkSeries(20, 0, 5)
};
const randomBarData2 = {
    ordinalOrdinal: ordinalData.map(d => [d, _.sample(ordinalData2)]),
    ordinalNumber: _.zip(ordinalData, randomWalk(ordinalData.length, 5))
};
console.log(randomBarData2);

const normalDistribution = d3.random.normal(0);
//const randomNormal = _.times(1000, normalDistribution);
const randomNormal = _.times(1000, normalDistribution).concat(_.times(1000, d3.random.normal(3, 0.5)));

const emojis = ["😀", "😁", "😂", "😅", "😆", "😇", "😈", "👿", "😉", "😊", "😐", "😑", "😒", "😓", "😔", "😕", "😖", "😗", "😘", "😙", "😚", "😛", "😜", "😝", "👻", "👹", "👺", "💩", "💀", "👽", "👾", "🙇", "💁", "🙅", "🙆", "🙋", "🙎", "🙍", "💆", "💇"];
// end fake data

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
                <LineChart data={randomSequences[0]} getX={0} getY={1} />
                <LineChart data={randomSequences[1]} getX={0} getY={1} />
                <LineChart data={randomSequences[2]} getX={0} getY={1} />
            </XYPlot>
        </div>
    }
});

const App = React.createClass({
    getInitialState() {
        return {
            hoveredV1LineChartData: null,
            randomSeries: [
                randomWalkSeries(400, 100, 3),
                randomWalkSeries(400),
                randomWalkSeries(400, -100, 4)
            ]
        }
    },
    onMouseMoveV1LineChart(d, index, event) {
        this.setState({hoveredV1LineChartData: d})
    },
    onMouseMoveXYPlot(d, event) {
        this.setState({hoveredXYPlotData: d})
    },
    render() {
        const {hoveredV1LineChartData, hoveredXYPlotData} = this.state;
        const triangleSymbol = <svg><polygon points="0,0 8,0 4,8" style={{fill: 'darkgreen'}} /></svg>;


        return <div>
            <h1>Reactochart</h1>

            <h2>v2</h2>

            <h3>Bar Charts</h3>

            <div>
                <XYPlot width={300} height={300} xType='ordinal'>
                    <BarChart data={randomBarData2.ordinalNumber} getX={0} getY={1} />
                </XYPlot>
            </div>

            <div>
                <XYPlot width={300} height={300}>
                    <BarChart data={randomBarData.valueValue} getX={0} getY={1} />
                    <BarChart data={[[25,20], [30, 10]]} getX={0} getY={1} />
                </XYPlot>
            </div>



            <div>
                <XYPlot width={300} height={300} >
                    <BarChart data={randomBarData.valueValue} getX={0} getY={1} />
                </XYPlot>
                <XYPlot width={300} height={300}>
                    <BarChart data={randomBarData.valueValue} getX={1} getY={0} orientation="horizontal" />
                </XYPlot>
            </div>

        </div>
    },
    _render() {
        const {hoveredV1LineChartData, hoveredXYPlotData} = this.state;
        const triangleSymbol = <svg><polygon points="0,0 8,0 4,8" style={{fill: 'darkgreen'}} /></svg>;

        return <div>
            <h1>Reactochart</h1>

            <h2>v2</h2>

            <h3>Bar Charts</h3>

            <h4>Value-Value Bar Chart</h4>

            <div>
                <XYPlot width={300} height={300}>
                    <BarChart data={randomBarData.valueValue} getX={0} getY={1} />
                </XYPlot>
                <XYPlot width={300} height={300}>
                    <BarChart data={randomBarData.valueValue} getX={1} getY={0} orientation="horizontal" />
                </XYPlot>
            </div>


            <h3>Histogram</h3>

            <div>
                <XYPlot width={700} height={300}>
                    <Histogram
                        data={randomNormal} getX={null}
                    />
                    <KernelDensityEstimation
                        data={randomNormal} bandwidth={0.5}
                    />
                    <KernelDensityEstimation
                        data={randomNormal} bandwidth={0.1}
                    />
                    <KernelDensityEstimation
                        data={randomNormal} bandwidth={2}
                    />
                </XYPlot>
            </div>

            <div>
                <XYPlot width={700} height={80} shouldDrawYLabels={false}>
                    <ScatterPlot
                        data={randomNormal} getX={null} getY={() => Math.random()}
                        pointRadius={1.5}
                        />
                </XYPlot>
            </div>

            <h3>ScatterPlot</h3>

            <div>
                <XYPlot width={700} height={500}>
                    <ScatterPlot
                        data={randomScatter[3]} getX={0} getY={1}
                        pointSymbol={<rect width={5} height={5} fill="rebeccapurple" />}
                    />
                    <ScatterPlot
                        data={randomScatter[4]} getX={0} getY={1}
                        pointRadius={2}
                    />
                    <ScatterPlot
                        data={randomScatter[1]} getX={0} getY={1}
                        pointSymbol={(d, i) => _.sample(emojis)}
                        pointOffset={[0, 2]}
                    />
                    <ScatterPlot
                        data={randomScatter[0]} getX={0} getY={1}
                        pointSymbol={(d, i) => i}
                    />
                    <ScatterPlot
                        data={randomScatter[2]} getX={0} getY={1}
                        pointSymbol={triangleSymbol}
                        pointOffset={[-4, -3]}
                        />
                </XYPlot>
            </div>

            <h3>LineChart</h3>

            <div>
                <XYPlot width={700}>
                    <LineChart
                        data={_.range(0,20,0.01)}
                        getX={null}
                        getY={(n) => Math.sin(n)}
                        />
                    <LineChart
                        data={_.range(0,20,0.01)}
                        getX={null}
                        getY={(n) => Math.sin(Math.pow(n,1.2)) * Math.cos(n)}
                        />
                </XYPlot>
            </div>

            <h3>Interactive LineChart</h3>

            <InteractiveLineExample></InteractiveLineExample>

            <h3>Multiple chart types in one XYPlot</h3>

            <div>
                <XYPlot>
                    <BarChart data={randomBars[0]} getX={0} getY={1} />
                    <LineChart data={randomBars[0]} getX={0} getY={1} />
                    <ScatterPlot data={randomBars[0]} getX={0} getY={1} pointSymbol={(d, i) => _.sample(emojis)} />
                </XYPlot>
            </div>


            <h2>v1</h2>

            <h3>Timeseries Line Chart</h3>

            <div>
                {hoveredV1LineChartData ?
                    <div>
                        {hoveredV1LineChartData.date + ''}
                        <br/>
                        New York Temperature: {hoveredV1LineChartData.newYork}
                    </div>
                    : null
                }
                <div>
                </div>
                <V1LineChart
                    width={1000}
                    height={400}
                    data={tempDataClean}
                    plotKeys={['newYork']}
                    dateKey="date"
                    onMouseMove={this.onMouseMoveV1LineChart}
                />
            </div>

            <h3>Bar Chart</h3>

            <div>
                <V1StackedBarChart
                    data={statesData}
                    plotKeys={['a','b','c','d','e','f','g']}
                />
            </div>

            <div>
                <V1StackedBarChart
                    orientation="column"
                    data={statesData}
                    plotKeys={['a','b','c','d','e','f','g']}
                />
            </div>
        </div>
    }
});

React.render(<App />, document.getElementById('container'));

export default App;