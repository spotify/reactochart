import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router, Link, Route} from 'react-router-dom';

import * as Docs from './docs';
import * as Lessons from './lessons';

const lessons = [
  {name: "Quick Start", path: '/quick-start', Component: Lessons.QuickStartLesson},
  {name: "XY Plots", path: '/xy-plots', Component: Lessons.XYPlotsLesson},
  {name: "Getters & Accessors", path: '/getters-and-accessors', Component: Lessons.GettersAndAccessorsLesson},
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

const dataMarkComponents = [
  {name: 'Bar', path: '/bar', Component: Docs.BarDocs},
  {name: 'RangeRect', path: '/range-rect', Component: Docs.RangeRectDocs},
  {name: 'XLine', path: '/x-line', Component: Docs.XLineDocs},
  {name: 'YLine', path: '/y-line', Component: Docs.YLineDocs},
];

const axisComponents = [
  {name: 'XAxis', path: '/x-axis', Component: Docs.XAxisDocs},
  {name: 'XAxisLabels', path: '/x-axis-labels', Component: Docs.XAxisLabelsDocs},
  {name: 'XAxisTitle', path: '/x-axis-title', Component: Docs.XAxisTitleDocs},
  {name: 'XGrid', path: '/x-grid', Component: Docs.XGridDocs},
  {name: 'XTicks', path: '/x-ticks', Component: Docs.XTicksDocs},
  {name: 'YAxis', path: '/y-axis', Component: Docs.YAxisDocs},
  {name: 'YAxisLabels', path: '/y-axis-labels', Component: Docs.YAxisLabelsDocs},
  {name: 'YAxisTitle', path: '/y-axis-title', Component: Docs.YAxisTitleDocs},
  {name: 'YGrid', path: '/y-grid', Component: Docs.YGridDocs},
  {name: 'YTicks', path: '/y-ticks', Component: Docs.YTicksDocs},
];

const allComponents = lessons
  .concat(chartComponents)
  .concat(dataMarkComponents)
  .concat(axisComponents);


const NavLink = ({label, to}) => {
  return <Route path={to} exact={true} children={({match}) => (
    <li className={`example-link ${match ? 'active' : ''}`}>
      <Link to={to}>{label}</Link>
    </li>
  )}/>
};

const Nav = () => {
  return <div className="sidebar-nav col-md-2" style={{backgroundColor: '#2E2F33'}}>
    <h3>Lessons</h3>
    <ul className="nav-inverse nav-tabs nav-stacked">
      {lessons.map((lesson, i) => {
        return <NavLink to={lesson.path} label={lesson.name} key={`lesson-${i}`}/>;
      })}
    </ul>

    <h3>Component Docs</h3>
    <h4>Chart Components</h4>
    <ul className="nav-inverse nav-tabs nav-stacked">
      {chartComponents.map((component, i) => {
        return <NavLink to={component.path} label={component.name} key={`chart-component-${i}`}/>;
      })}
    </ul>

    <h4>Data Components</h4>
    <ul className="nav-inverse nav-tabs nav-stacked">
      {dataMarkComponents.map((component, i) => {
        return <NavLink to={component.path} label={component.name} key={`data-component-${i}`}/>;
      })}
    </ul>

    <h4>Axis Components</h4>
    <ul className="nav-inverse nav-tabs nav-stacked">
      {axisComponents.map((component, i) => {
        return <NavLink to={component.path} label={component.name} key={`axis-component-${i}`}/>;
      })}
    </ul>
  </div>
};

export const Home = (props) => (
  <div className="docs-home">
    <p>
      Reactochart is a library of React components for creating charts and graphs, used internally at Spotify.
    </p>

    <MultipleXYExample/>
  </div>
);


export const App = (props) => (
  <Router>
    <div className="row docs-home">
      <Nav />
      <div className="col-md-10">
        <Route exact path={'/'} component={Home} />
        {allComponents.map((c, i) => (
          <Route path={c.path} component={c.Component} key={i} />
        ))}
      </div>
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

console.log('test');