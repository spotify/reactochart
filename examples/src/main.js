import '../styles/main.less'
import React from 'react/addons';
const {PureRenderMixin, update} = React.addons;

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
    numberNumber: _.zip(randomWalk(ordinalData.length, 5), randomWalk(ordinalData.length, 5)),
    numberOrdinal: _.zip(randomWalk(ordinalData.length, 5), ordinalData),
    numberTime: _.zip(randomWalk(timeData.length, 5), timeData),

    //ordinalOrdinal: ordinalData.map(d => [d, _.sample(ordinalData2)]),
    ordinalOrdinal: _.zip(ordinalData, ordinalData2),
    ordinalTime: _.zip(ordinalData, timeData),

    timeTime: _.zip(timeData, timeData2)
};
console.log(randomBarData2);

const normalDistribution = d3.random.normal(0);
//const randomNormal = _.times(1000, normalDistribution);
const randomNormal = _.times(1000, normalDistribution).concat(_.times(1000, d3.random.normal(3, 0.5)));

const emojis = ["😀", "😁", "😂", "😅", "😆", "😇", "😈", "👿", "😉", "😊", "😐", "😑", "😒", "😓", "😔", "😕", "😖", "😗", "😘", "😙", "😚", "😛", "😜", "😝", "👻", "👹", "👺", "💩", "💀", "👽", "👾", "🙇", "💁", "🙅", "🙆", "🙋", "🙎", "🙍", "💆", "💇"];
// end fake data



const ScatterPlotExample = React.createClass({
    render() {
        const rectangleSymbol = <rect width={5} height={5} fill="rebeccapurple" />;
        const triangleSymbol = <svg><polygon points="0,0 8,0 4,8" style={{fill: 'darkgreen'}} /></svg>;
        const randomEmoji = (d, i) => _.sample(emojis);

        return <div>
            <XYPlot width={700} height={500}>
                <ScatterPlot
                    data={randomScatter[3]} getX={0} getY={1}
                    pointSymbol={rectangleSymbol}
                    />
                <ScatterPlot
                    data={randomScatter[4]} getX={0} getY={1}
                    pointRadius={2}
                    />
                <ScatterPlot
                    data={randomScatter[1]} getX={0} getY={1}
                    pointSymbol={randomEmoji}
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
    }
});

const LineChartExample = React.createClass({
    render() {
        return <div>
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
                <LineChart
                    data={_.range(0,20,0.01)}
                    getX={null}
                    getY={(n) => Math.sin(n*0.5) * Math.cos(n)}
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
                <LineChart data={randomSequences[0]} getX={0} getY={1} />
                <LineChart data={randomSequences[1]} getX={0} getY={1} />
                <LineChart data={randomSequences[2]} getX={0} getY={1} />
            </XYPlot>
        </div>
    }
});

const HistogramExample = React.createClass({
    render() {
        return <div>
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
        </div>
    }
});

const MultipleXYExample = React.createClass({
    render() {
        return <div>
            <XYPlot>
                <BarChart data={randomBars[0]} getX={0} getY={1} />
                <LineChart data={randomBars[0]} getX={0} getY={1} />
                <ScatterPlot data={randomBars[0]} getX={0} getY={1} pointSymbol={(d, i) => _.sample(emojis)} />
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
                    <BarChart data={randomBarData2.numberNumber} getX={1} getY={0} />
                </XYPlot>
                <XYPlot width={300} height={300} xType='ordinal'>
                    <BarChart data={randomBarData2.numberOrdinal} getX={1} getY={0} />
                </XYPlot>
                <XYPlot width={300} height={300} xType='time'>
                    <BarChart data={randomBarData2.numberTime} getX={1} getY={0} />
                </XYPlot>

                <div>Number-Ordinal, Ordinal-Ordinal, Time-Ordinal</div>
                <XYPlot width={300} height={300} yType='ordinal'>
                    <BarChart data={randomBarData2.numberOrdinal} getX={0} getY={1} />
                </XYPlot>
                <XYPlot width={300} height={300} xType='ordinal' yType='ordinal'>
                    <BarChart data={randomBarData2.ordinalOrdinal} getX={0} getY={1} />
                </XYPlot>
                <XYPlot width={300} height={300} xType='time' yType='ordinal'>
                    <BarChart data={randomBarData2.ordinalTime} getX={1} getY={0} />
                </XYPlot>

                <div>Number-Time, Ordinal-Time, Time-Time</div>
                <XYPlot width={300} height={300} yType='time'>
                    <BarChart data={randomBarData2.numberTime} getX={0} getY={1} />
                </XYPlot>
                <XYPlot width={300} height={300} xType='ordinal' yType='time'>
                    <BarChart data={randomBarData2.ordinalTime} getX={0} getY={1} />
                </XYPlot>
                <XYPlot width={300} height={300} xType='time' yType='time'>
                    <BarChart data={randomBarData2.timeTime} getX={0} getY={1} />
                </XYPlot>
            </div>

            <h2>Horizontal</h2>

            <div>
                <div>Number-Number, Ordinal-Number, Date-Number</div>
                <XYPlot width={300} height={300}>
                    <BarChart data={randomBarData2.numberNumber} getX={0} getY={1} orientation="horizontal" />
                </XYPlot>
                <XYPlot width={300} height={300} yType='ordinal'>
                    <BarChart data={randomBarData2.numberOrdinal} getX={0} getY={1} orientation="horizontal" />
                </XYPlot>
                <XYPlot width={300} height={300} yType='time'>
                    <BarChart data={randomBarData2.numberTime} getX={0} getY={1} orientation="horizontal" />
                </XYPlot>

                <div>Number-Ordinal, Ordinal-Ordinal, Date-Ordinal</div>

                <div>Number-Date, Ordinal-Date, Date-Date</div>
            </div>

            <h2>old</h2>

            <div>
                <XYPlot width={300} height={300} xType='ordinal'>
                    <BarChart data={randomBarData2.numberOrdinal} getX={1} getY={0} />
                </XYPlot>
                <XYPlot width={300} height={300} yType='ordinal'>
                    <BarChart data={randomBarData2.numberOrdinal} getX={0} getY={1} orientation="horizontal" />
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
    }
});

const V1Examples = React.createClass({
    getInitialState() {
        return {hoveredV1LineChartData: null}
    },
    onMouseMoveV1LineChart(d, index, event) {
        this.setState({hoveredV1LineChartData: d})
    },
    render() {
        const {hoveredV1LineChartData} = this.state;
        return <div>
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



const examples = [
    {id: 'scatter', title: 'Scatter Plot', Component: ScatterPlotExample},
    {id: 'line', title: 'Line Chart', Component: LineChartExample},
    {id: 'valueValueBar', title: 'Value-Value Bar Charts', Component: ValueValueBarExample},
    {id: 'interactiveLine', title: 'Interactive Line Chart', Component: InteractiveLineExample},
    {id: 'histogram', title: 'Histogram', Component: HistogramExample},
    {id: 'multipleXY', title: 'Multiple Chart Types in one XYPlot', Component: MultipleXYExample},
    {id: 'v1', title: 'v1 Examples (old & deprecated)', Component: V1Examples}
];

const App = React.createClass({
    getInitialState() {
        return {
            visibleExamples: {}
        }
    },
    toggleExample(id) {
        const isVisible = this.state.visibleExamples[id];
        this.setState(update(this.state, {visibleExamples: {[id]: {$set: !isVisible}}}));
    },
    renderExamples() {
        return <div class='example-sections'>
            {examples.map(this.renderExample)}
        </div>;
    },
    renderExample(example) {
        const isVisible = this.state.visibleExamples[example.id];
        const ExampleComponent = example.Component;
        return <div className={`example-section example-section-${example.id}`}>
            <div
                className={`example-section-button ${isVisible ? 'active' : ''}`}
                onClick={this.toggleExample.bind(null, example.id)}
            >
                {example.title} {isVisible ? "▼" : "►"}
            </div>
            {isVisible ?
                <div className="example-section-content">
                    <ExampleComponent />
                </div>
                : null
            }
        </div>
    },
    render() {
        return <div>
            <h1>Reactochart Examples</h1>
            {this.renderExamples()}
        </div>
    }
});

React.render(<App />, document.getElementById('container'));

export default App;