import React from 'react';
import ReactDOM from 'react-dom';
import Lesson from '../../Lesson';
import ExampleSection from '../../ExampleSection';

export default class XYPlotsLesson extends React.Component {
  render() {
    return <Lesson name="XY Plots" componentName="XYPlots">
      <p>
        Nearly all of the chart components included in Reactochart (except PieChart and TreeMap)
        are cartesian or "X/Y"-type charts. They accept an array of <code>data</code> and
        represent these data with some form of SVG marks on a 2-dimensional X/Y coordinate plane.
      </p>
      <p>
        These chart components are not meant to be rendered on their own, but should instead always be wrapped in a
        <code>{'<'}XYPlot{'>'}</code> component. <code>XYPlot</code> is a wrapper which iterates over all
        of its charts and generates a common set of
        X and Y <a href="https://github.com/d3/d3-scale">scales</a>, which are shared and
        provided to its children as <code>scale</code> props. <code>XYPlot</code> also accepts several
        other props which apply to all of its children, such as <code>width</code> and <code>height</code>.
      </p>
      <p>
        Here's an example of basic <code>XYPlot</code> to render a <code>LineChart</code>:
      </p>
      <ExampleSection
        id="basic"
        label="XYPlot and LineChart"
        codeText={require('raw-loader!./examples/LineChart.js.example')}
      />

      <p>
        Generally, you will want to render a <code>XAxis</code> and a <code>YAxis</code> component
        along with your chart. These components render
        titles, labels, ticks and grid lines to denote your X and Y axes. One
        advantage of using a common <code>XYPlot</code> wrapper is that it ensures the axis labels are using the
        same scales as the charts themselves, and are therefore correctly labeling
        them. <code>XAxis</code> and <code>YAxis</code> accept several props to control how
        they are displayed; see their docs for more information.
      </p>
      <p>
        Note that the axes will take up some space in the margin around the chart.
        The <code>width</code> and <code>height</code> props
        provided to <code>XYPlot</code> control the <strong>outer</strong> width of the chart,
        including the margin and the axes inside them. The inner size of the chart plot itself is
        determined by <code>XYPlot</code> and passed down to children charts as
        (smaller) <code>width</code> and <code>height</code> props.
      </p>
      <ExampleSection
        id="lineChartWithAxis"
        label="LineChart with axes"
        codeText={require('raw-loader!./examples/LineChartWithAxis.js.example')}
      />

      <p>
        Another advantage of <code>XYPlot</code> is that it provides a common container
        for rendering multiple charts together on the same axes. These can be charts of the same type
        (ie. multiple <code>LineCharts</code>), and/or multiple kinds of charts.
        Any of the XY-type charts in Reactochart can be rendered alongside one another inside <code>XYPlot</code>.
      </p>
      <p>
        Note that these charts render SVG elements, which do not respect <code>z-index</code>; instead their
        Z-order is determined by the order in which they are drawn. So if you want to draw a <code>BarChart</code> underneath
        a <code>LineChart</code>, put it before the <code>LineChart</code> inside <code>XYPlot</code>.
      </p>
      <ExampleSection
        id="multiChart"
        label="Multiple Charts in one XYPlot"
        codeText={require('raw-loader!./examples/MultiChart.js.example')}
      />

    </Lesson>;
  }
}
