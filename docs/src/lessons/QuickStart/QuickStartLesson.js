import React from "react";
import ReactDOM from "react-dom";
import Lesson from "../../Lesson";
import ExampleSection from "../../ExampleSection";

const examples = [
  {
    id: "basic",
    label: "Quick Start Example",
    codeText: require("raw-loader!./examples/QuickStart.js.example")
  }
];

export default class QuickStartLesson extends React.Component {
  render() {
    return (
      <Lesson name="Quick Start" componentName="QuickStart">
        <p>
          To get started using Reactochart, first install it using{" "}
          <code>npm</code>:
        </p>
        <pre>npm install --save reactochart</pre>
        <p>
          Then you can <code>import</code> individual Reactochart components:
        </p>
        <pre>import LineChart from 'reactochart/LineChart'</pre>
        <p>
          The examples in this documentation will omit these imports to save
          space, so make sure you remember to include them in your code to get
          things working. For example, the example below requires importing the
          following components:
        </p>
        <pre>
          import XYPlot from 'reactochart/XYPlot';<br />
          import XAxis from 'reactochart/XAxis';<br />
          import YAxis from 'reactochart/YAxis';<br />
          import LineChart from 'reactochart/LineChart';
        </pre>
        <p>
          If you prefer, you can import all of Reactochart at once, though this
          may hinder some optimizations, such as <code>webpack</code>{" "}
          tree-shaking:
        </p>
        <pre>
          import {"{"}XYPlot, XAxis, YAxis, LineChart{"}"} from 'reactochart';<br />
          // or <br />
          import * as Reactochart from 'reactochart';
        </pre>
        <p>
          And now, here's our first line chart showing the basic usage of these
          components. In this and all future examples, the code on the left side
          is editable and will update the preview on the right - so experiment
          and see for yourself how things work!
        </p>

        {examples.map(example => {
          return <ExampleSection {...example} key={example.id} />;
        })}
      </Lesson>
    );
  }
}
