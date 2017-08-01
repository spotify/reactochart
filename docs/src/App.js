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


const components = [
  {name: 'Line Chart', path: '/line', Component: LineChartDocs},
  {name: 'Scatter Plot', path: '/scatter', Component: ScatterPlotDocs},
  {name: 'Pie Chart', path: '/pie', Component: PieChartDocs},
  {name: 'Bar Chart', path: '/bar', Component: BarChartDocs},
  {name: 'Area Chart', path: '/area', Component: AreaChartDocs},
  {name: 'Area Chart New', path: '/area2', Component: Docs.AreaChartDocs},
  {name: 'Color Heatmap', path: '/color-heatmap', Component: ColorHeatmapDocs},
  {name: 'Area Heatmap', path: '/area-heatmap', Component: AreaHeatmapDocs},
];

const lessons = [
  {name: "Quick Start", path: '/quick-start', Component: Lessons.QuickStartLesson}
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
    <p>Reactochart is a library of React components for drawing charts and graphs, used internally at Spotify.</p>

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


