import React from 'react';
import ReactDOM from 'react-dom';
import ExampleSection from '../components/ExampleSection';

const basicExample = require('raw-loader!../examples/ScatterPlot.js.example');
const examples = [
  {
    id: "basic",
    label: "Scatter plot with various symbol types",
    codeText: basicExample,
  }
];

export default class ScatterPlotExamples extends React.Component {
  render() {
    return <div className="container" style={{minHeight: 2000}}>
      <div className="row">
        <h2>Scatter Plot Chart</h2>
      </div>

      {examples.map(example => {
        return <ExampleSection {...example} key={example.id} />;
      })}
    </div>;
  }
}
