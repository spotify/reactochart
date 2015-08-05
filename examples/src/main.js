import '../styles/main.less'
import React from 'react';
import {Component1, Component2} from '../../src';

const App = React.createClass({
    render() {
        return <div>
            <Component1></Component1>
            <Component2></Component2>
        </div>
    }
});

React.render(<App />, document.getElementById('container'));

export default App;