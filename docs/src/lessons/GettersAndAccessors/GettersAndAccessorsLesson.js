import React from 'react';
import ReactDOM from 'react-dom';
import Lesson from '../../Lesson';
import ExampleSection from '../../ExampleSection';

const examples = [
  {
    id: 'basic',
    label: 'Getters and Accessors Example',
    codeText: require('./examples/GettersAndAccessors.js.example'),
  },
];

export default class GettersAndAccessorsLesson extends React.Component {
  render() {
    return (
      <Lesson name="Getters and Accessors" componentName="GettersAndAccessors">
        <p>
          By now, you may have noticed that the charts in all of the previous
          examples have props called
          <code>getX</code> and <code>getY</code>, for which we've (so far)
          given values <code>'x'</code>
          and <code>'y'</code> respectively. We call these sorts of props{' '}
          <strong>getter</strong> props, and they allow Reactochart to be
          flexible about the format of the data you use in your charts.
        </p>

        <p>
          A getter prop tells the chart how to get the parameters it needs from
          the data you provide. Getters are used in components which accept a{' '}
          <code>data</code> array prop, and for each element (or "datum") in the{' '}
          <code>data</code>, the getter accesses a value from the datum in order
          to draw one part of the chart. For example, in a{' '}
          <code>LineChart</code>, <code>getX</code> and <code>getY</code>{' '}
          determine the X and Y values where each line segment should be drawn,
          while in a <code>BarChart</code> they determine the X position and
          height of each bar. Some types of charts have other getters too, for
          example a chart which represents data as a series of colors might have
          a <code>getColor</code> prop.
        </p>

        <p>
          This description of getters make them sound like functions which are
          run on each datum, so why did we pass strings <code>'x'</code> and{' '}
          <code>'y'</code>? All getters are in fact transformed into{' '}
          <strong>accessor</strong> functions inside Reactochart, but getters
          themselves have a bit more flexibility, for the sake of convenience.
          Here are all the types of values which may be passed as a getter, and
          the rules which determine how they are handled:
        </p>

        <ul>
          <li>
            <strong>Function:</strong> The simplest case - if the getter is a
            function, it will be run on each datum in <code>data</code> and the
            return value will be used.
          </li>
          <li>
            <strong>Number:</strong> If an integer number is provided, the chart
            will assume that data objects are arrays, and will use the number as
            an array index to access the value. eg.{' '}
            <code>
              getX={'{'}3{'}'}
            </code>{' '}
            is equivalent to{' '}
            <code>
              getX={'{'}(datum) => datum[3]{'}'}
            </code>
          </li>
          <li>
            <strong>String:</strong> The string will be used as an object key to
            access a value within each datum object. eg. passing{' '}
            <code>getX='x'</code> is equivalent to{' '}
            <code>
              getX={'{'}(datum) => datum.x{'}'}
            </code>
            . If your data objects are more complicated, the string may also
            contain dots to specify values which are multiple levels deep,
            and/or numbers in brackets to specify values which are in arrays, eg{' '}
            <code>"userInfo[0].demographics.age"</code>,
          </li>
          <li>
            <strong>Null/undefined:</strong> Passing <code>null</code> or{' '}
            <code>undefined</code> tells Reactochart to simply use the datum
            itself as the value, ie. it's equivalent to{' '}
            <code>
              getX={'{'}(datum) => datum{'}'}
            </code>
            .
          </li>
        </ul>

        <ExampleSection
          id="basic"
          label="Getter Usage Example"
          codeText={require('./examples/GettersAndAccessors.js.example')}
        />

        <p>
          The last option mentioned above - passing <code>null</code> or{' '}
          <code>undefined</code> to use the datum value itself - allows
          Reactochart to be used as an ad hoc "graphing calculator". Simply
          generate a range of numbers for your data (Lodash's{' '}
          <a href="">_.range function</a> is useful for this), and pass{' '}
          <code>null</code> for <code>getX</code> and some numerical function
          for <code>getY</code>. This is a great way to test your chart before
          your data is ready. This pattern will be used in future examples,
          since it's an easy way to generate "fake" data.
        </p>

        <ExampleSection
          id="basic"
          label="Graphing Calculator Example"
          codeText={require('./examples/GraphingCalculator.js.example')}
        />
      </Lesson>
    );
  }
}
