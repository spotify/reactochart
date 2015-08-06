import '../styles/main.less'
import React from 'react';
import {StackedBarChart} from '../../src';

import statesData from './data/statesData.json';

const App = React.createClass({
    render() {
        return <div>
            <h1>Reactochart</h1>

            <h3>Bar Chart</h3>

            <StackedBarChart data={statesData} plotKeys={['a','b','c','d','e','f','g']} />

        </div>
    }
});

React.render(<App />, document.getElementById('container'));

export default App;