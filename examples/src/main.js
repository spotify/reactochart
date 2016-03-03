import '../styles/main.less'
import React from 'react';
import ReactDOM from 'react-dom';
import update from 'react-addons-update';
import numeral from 'numeral';
//_.extend(window, {Perf, numeral});

import {App} from './Examples'

ReactDOM.render(<App />, document.getElementById('container'));

//export default App;
