import React from 'react';
import ReactDOM from 'react-dom';
import ExampleSection from '../components/ExampleSection';

const basicExample = require('raw-loader!../examples/BarChart.js.example');
const rangeExample = require('raw-loader!../examples/RangeBarChart.js.example');
const areaBarExample = require('raw-loader!../examples/AreaBarChart.js.example');

const examples = [
  {
    id: "basic",
    label: "Basic Bar Chart",
    codeText: basicExample,
  },
  {
    id: "range-bar",
    label: "Range Bar Chart",
    codeText: rangeExample,
  },
  {
    id: "area-bar",
    label: "Area Bar Chart",
    codeText: areaBarExample
  },
];

export default class BarChartExamples extends React.Component {
  render() {
    return <div className="container" style={{minHeight: 2000}}>
      <div className="row">
        <h2>Bar Chart</h2>
      </div>

      {examples.map(example => {
        return <ExampleSection {...example} key={example.id} />;
      })}
    </div>;
  }
}
