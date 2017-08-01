import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router, Link, Route} from 'react-router-dom';

import LineChartDocs from './pages/LineChart';
import ScatterPlotDocs from './pages/ScatterPlot';
import PieChartDocs from './pages/PieChart';
import BarChartDocs from './pages/BarChart';
import AreaChartDocs from './pages/AreaChart';
import ColorHeatmapDocs from './pages/ColorHeatmap';
import AreaHeatmapDocs from './pages/AreaHeatmap';

import * as Docs from './docs';
import * as Lessons from './lessons';

const lessons = [
  {name: "Quick Start", path: '/quick-start', Component: Lessons.QuickStartLesson},
  {name: "XY Plots", path: '/xy-plots', Component: Lessons.XYPlotsLesson},
];

const chartComponents = [
  {name: 'AreaBarChart', path: '/area-bar-chart', Component: Docs.AreaBarChartDocs},
  {name: 'AreaChart', path: '/area-chart', Component: Docs.AreaChartDocs},
  {name: 'AreaHeatmap', path: '/area-heatmap', Component: Docs.AreaHeatmapDocs},
  {name: 'BarChart', path: '/bar-chart', Component: Docs.BarChartDocs},
  {name: 'ColorHeatmap', path: '/color-heatmap', Component: Docs.ColorHeatmapDocs},
  {name: 'FunnelChart', path: '/funnel-chart', Component: Docs.FunnelChartDocs},
  {name: 'Histogram', path: '/histogram', Component: Docs.HistogramDocs},
  {name: 'KernelDensityEstimation', path: '/kernel-density-estimation', Component: Docs.KernelDensityEstimationDocs},
  {name: 'LineChart', path: '/line-chart', Component: Docs.LineChartDocs},
  {name: 'MarkerLineChart', path: '/marker-line-chart', Component: Docs.MarkerLineChartDocs},
  {name: 'PieChart', path: '/pie-chart', Component: Docs.PieChartDocs},
  {name: 'RangeBarChart', path: '/range-bar-chart', Component: Docs.RangeBarChartDocs},
  {name: 'ScatterPlot', path: '/scatter-plot', Component: Docs.ScatterPlotDocs},
  {name: 'TreeMap', path: '/tree-map', Component: Docs.TreeMapDocs},
];

const allComponents = lessons.concat(chartComponents);

export const Home = (props) => (
  <div className="docs-home">
    <p>
      Reactochart is a library of React components for creating charts and graphs, used internally at Spotify.
    </p>

    <MultipleXYExample/>

    <h3>Lessons</h3>
    <ul>
      {lessons.map((lesson, i) => {
        return <li className="example-link" key={i}>
          <Link to={lesson.path}>{lesson.name}</Link>
        </li>;
      })}
    </ul>

    <h3>Component Docs</h3>
    <h4>Chart Components</h4>
    <ul>
      {chartComponents.map((component, i) => {
        return <li className="example-link" key={i}>
          <Link to={component.path}>{component.name}</Link>
        </li>;
      })}
    </ul>
  </div>
);

export const App = (props) => (
    <Router>
      <div className="docs-home">

        <Route exact path={'/'} component={Home} />
        {allComponents.map((c, i) => (
          <Route path={c.path} component={c.Component} key={i} />
        ))}
      </div>
    </Router>
);

import * as Reactochart from '../../src';
const {
  XYPlot, XAxis, YAxis, RangeBarChart, LineChart, ScatterPlot, BarChart, MarkerLineChart, ColorHeatmap, AreaHeatmap
} = Reactochart;

class MultipleXYExample extends React.Component {
  render() {
    return <div>
      <XYPlot domain={{y: [-2, 2], x: [-2, 2]}} scaleType="linear" {...{width: 400, height: 400}}>
        <XAxis title="Phase" />
        <YAxis title="Intensity" />

        <RangeBarChart
          data={_.range(0, 2, .03)}
          getX={null}
          getY={d => (Math.sin(d*3) * .7) + 1.2}
          getYEnd={d => (Math.sin(d*3) * Math.cos(d*3) * .7) + 1.2}
          barThickness={2}
          barStyle={{fill: '#3690c0'}}
        />

        <LineChart
          data={_.range(-2, 0, .005)}
          getY={d => Math.pow(Math.abs(Math.sin(d*5)), Math.abs(Math.sin(d*.25))) * 1.8}
          lineStyle={{stroke: '#02818a', strokeWidth: 3}}
        />

        <ScatterPlot
          data={_.range(-2, 0, .05)}
          getY={d => Math.pow(2, (d + 2) * 1.8) * 0.1}
          pointSymbol={<rect width={5} height={5} fill="#3690c0" />}
        />

        <BarChart
          data={_.range(0, 2, .03)}
          getY={d => -Math.abs(Math.sin(d*4) * Math.cos(d*3))}
          barThickness={3}
          barStyle={{fill: '#67a9cf'}}
        />

        <MarkerLineChart
          data={_.range(0, 1.5, .1)}
          getY={d => Math.cos(d)}
          lineStyle={{stroke: '#ec7014', strokeWidth: 3}}
        />

        <ColorHeatmap
          data={_.flatten(_.range(-2, 0, .1).map(i => _.range(-2, 0, .1).map(j => [i, j])))}
          getValue={([i, j]) => Math.sin(i * j * 5)}
          getX={([i, j]) => i}
          getXEnd={([i, j]) => i + .1}
          getY={([i, j]) => j}
          getYEnd={([i, j]) => j + .1}
          colors={['#d0d1e6', '#016450']}
          interpolator={'lab'}
        />

        <AreaHeatmap
          data={_.flatten(_.range(0, 2, .1).map(i => _.range(-2, -1, .1).map(j => [i, j])))}
          getArea={([i, j]) => -Math.sin(i * j * 5)}
          getX={([i, j]) => i}
          getXEnd={([i, j]) => i + .1}
          getY={([i, j]) => j}
          getYEnd={([i, j]) => j + .1}
          rectStyle={{fill: '#016450'}}
        />
      </XYPlot>
    </div>;
  }
}