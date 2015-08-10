import '../styles/main.less'
import React from 'react/addons';
const {PureRenderMixin} = React.addons;

import {
    StackedBarChart,
    LineChart,
    XYPlot,
    V2LineChart
} from '../../src';

import statesData from './data/statesData.json';
import temperatureData from './data/dailyTemperature.json';
import simpleXYData from './data/simpleXY.json';

const tempDataClean = temperatureData.map(d => _.assign({}, d, {date: new Date(d.date)}));

import {randomWalk, randomWalkSeries} from './data/util';

const randomSequences = [
    randomWalkSeries(400, 100, 3),
    randomWalkSeries(400),
    randomWalkSeries(400, -100, 4)
];

_.extend(window, {randomWalk});

const App = React.createClass({
    getInitialState() {
        return {
            hoveredLineChartData: null,
            randomSeries: [
                randomWalkSeries(400, 100, 3),
                randomWalkSeries(400),
                randomWalkSeries(400, -100, 4)
            ]
        }
    },
    onMouseMoveLineChart(d, index, event) {
        this.setState({hoveredLineChartData: d})
    },
    onMouseMoveXYPlot(d, event) {
        this.setState({hoveredXYPlotData: d})
    },
    render() {
        const {hoveredLineChartData, hoveredXYPlotData} = this.state;
        return <div>
            <h1>Reactochart</h1>

            <h2>v2</h2>

            <div>
                {hoveredXYPlotData ?
                    <div>
                        {hoveredXYPlotData[0] + ', ' + hoveredXYPlotData[1]}
                    </div>
                    : null
                }
                <XYPlot width={700} height={400} onMouseMove={this.onMouseMoveXYPlot}>
                    <V2LineChart data={randomSequences[0]} getX={0} getY={1} />
                    <V2LineChart data={randomSequences[1]} getX={0} getY={1} />
                    <V2LineChart data={randomSequences[2]} getX={0} getY={1} />
                </XYPlot>
            </div>

            <div>
                <XYPlot width={600} height={400}>
                    <V2LineChart data={simpleXYData} getX="x" getY="y" />
                    <V2LineChart data={simpleXYData} getX="x" getY="y0" />
                    <V2LineChart data={simpleXYData} getX="x" getY="y1" />
                </XYPlot>
            </div>

            <h2>v1</h2>

            <h3>Timeseries Line Chart</h3>

            <div>
                {hoveredLineChartData ?
                    <div>
                        {hoveredLineChartData.date + ''}
                        <br/>
                        New York Temperature: {hoveredLineChartData.newYork}
                    </div>
                    : null
                }
                <div>
                </div>
                <LineChart
                    width={1000}
                    height={400}
                    data={tempDataClean}
                    plotKeys={['newYork']}
                    dateKey="date"
                    onMouseMove={this.onMouseMoveLineChart}
                />
            </div>

            <h3>Bar Chart</h3>

            <div>
                <StackedBarChart
                    data={statesData}
                    plotKeys={['a','b','c','d','e','f','g']}
                />
            </div>

            <div>
                <StackedBarChart
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