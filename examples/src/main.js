import '../styles/main.less'
import React from 'react';

import {
    StackedBarChart,
    LineChart
} from '../../src';

import statesData from './data/statesData.json';
import temperatureData from './data/dailyTemperature.json';

const App = React.createClass({
    render() {
        const tempDataClean = temperatureData.map(d => _.assign({}, d, {date: new Date(d.date)}));

        return <div>
            <h1>Reactochart</h1>

            <h3>Timeseries Line Chart</h3>

            <div>
                <LineChart
                    width={800}
                    height={400}
                    data={tempDataClean}
                    plotKeys={['newYork']}
                    dateKey="date"
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