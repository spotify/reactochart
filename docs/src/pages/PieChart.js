import React from 'react';
import ReactDOM from 'react-dom';
import ExampleSection from '../components/ExampleSection';

const basicExample = require('raw-loader!../examples/PieChart.js.example');
const examples = [
  {
    id: "basic",
    label: "Basic Pie Charts",
    codeText: basicExample,
  }
];

export default class PieChartExamples extends React.Component {
  render() {
    return <div className="container" style={{minHeight: 2000}}>
      <div className="row">
        <h2>Pie Chart</h2>
      </div>

      {examples.map(example => {
        return <ExampleSection {...example} key={example.id} />;
      })}
    </div>;
  }
}
