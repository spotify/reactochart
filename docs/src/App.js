import React from 'react';
import PropTypes from 'prop-types';
import { HashRouter as Router, Link, Route } from 'react-router-dom';
import _ from 'lodash';

import * as Docs from './docs';
import * as Lessons from './lessons';

const lessons = [
  {
    name: 'Quick Start',
    path: '/quick-start',
    Component: Lessons.QuickStartLesson,
  },
  { name: 'XY Plots', path: '/xy-plots', Component: Lessons.XYPlotsLesson },
  // TODO lesson needs to be cleaned up, see lessons/GettersAndAccessors
  // {name: "Getters & Accessors", path: '/getters-and-accessors', Component: Lessons.GettersAndAccessorsLesson},
  // TODO lesson needs to be cleaned up, see lessons/Interaction
  // {name: "Interaction", path: '/interaction', Component: Lessons.InteractionLesson},
];

const mainComponents = [
  { name: 'XYPlot', path: '/xy-plot', Component: Docs.XYPlotDocs },
  {
    name: 'ZoomContainer',
    path: '/zoom-container',
    Component: Docs.ZoomContainerDocs,
  },
];

const xyChartComponents = [
  {
    name: 'AriaLabelContainer',
    path: '/aria-label-container',
    Component: Docs.AriaLabelContainerDocs,
  },
  {
    name: 'AreaBarChart',
    path: '/area-bar-chart',
    Component: Docs.AreaBarChartDocs,
  },
  { name: 'AreaChart', path: '/area-chart', Component: Docs.AreaChartDocs },
  {
    name: 'AreaHeatmap',
    path: '/area-heatmap',
    Component: Docs.AreaHeatmapDocs,
  },
  { name: 'BarChart', path: '/bar-chart', Component: Docs.BarChartDocs },
  {
    name: 'ColorHeatmap',
    path: '/color-heatmap',
    Component: Docs.ColorHeatmapDocs,
  },
  {
    name: 'FunnelChart',
    path: '/funnel-chart',
    Component: Docs.FunnelChartDocs,
  },
  { name: 'Histogram', path: '/histogram', Component: Docs.HistogramDocs },
  {
    name: 'KernelDensityEstimation',
    path: '/kernel-density-estimation',
    Component: Docs.KernelDensityEstimationDocs,
  },
  { name: 'LineChart', path: '/line-chart', Component: Docs.LineChartDocs },
  {
    name: 'MarkerLineChart',
    path: '/marker-line-chart',
    Component: Docs.MarkerLineChartDocs,
  },
  {
    name: 'RangeBarChart',
    path: '/range-bar-chart',
    Component: Docs.RangeBarChartDocs,
  },
  {
    name: 'ScatterPlot',
    path: '/scatter-plot',
    Component: Docs.ScatterPlotDocs,
  },
];

const standaloneChartComponents = [
  { name: 'PieChart', path: '/pie-chart', Component: Docs.PieChartDocs },
  { name: 'SankeyDiagram', path: '/sankey', Component: Docs.SankeyDiagramDocs },
  { name: 'TreeMap', path: '/tree-map', Component: Docs.TreeMapDocs },
];

const dataMarkComponents = [
  { name: 'Bar', path: '/bar', Component: Docs.BarDocs },
  { name: 'RangeRect', path: '/range-rect', Component: Docs.RangeRectDocs },
  { name: 'XLine', path: '/x-line', Component: Docs.XLineDocs },
  { name: 'YLine', path: '/y-line', Component: Docs.YLineDocs },
];

const axisComponents = [
  { name: 'XAxis', path: '/x-axis', Component: Docs.XAxisDocs },
  {
    name: 'XAxisLabels',
    path: '/x-axis-labels',
    Component: Docs.XAxisLabelsDocs,
  },
  { name: 'XAxisTitle', path: '/x-axis-title', Component: Docs.XAxisTitleDocs },
  { name: 'XGrid', path: '/x-grid', Component: Docs.XGridDocs },
  { name: 'XTicks', path: '/x-ticks', Component: Docs.XTicksDocs },
  { name: 'YAxis', path: '/y-axis', Component: Docs.YAxisDocs },
  {
    name: 'YAxisLabels',
    path: '/y-axis-labels',
    Component: Docs.YAxisLabelsDocs,
  },
  { name: 'YAxisTitle', path: '/y-axis-title', Component: Docs.YAxisTitleDocs },
  { name: 'YGrid', path: '/y-grid', Component: Docs.YGridDocs },
  { name: 'YTicks', path: '/y-ticks', Component: Docs.YTicksDocs },
];

const allComponents = lessons
  .concat(mainComponents)
  .concat(xyChartComponents)
  .concat(standaloneChartComponents)
  .concat(dataMarkComponents)
  .concat(axisComponents);

const NavLink = ({ label, to }) => {
  return (
    <Route
      path={to}
      exact
      children={({ match }) => (
        <li className={`example-link ${match ? 'active' : ''}`}>
          <Link to={to}>{label}</Link>
        </li>
      )}
    />
  );
};

NavLink.propTypes = {
  label: PropTypes.string,
  to: PropTypes.string,
};

const Nav = () => {
  return (
    <div
      className="sidebar-nav col-md-2"
      style={{ backgroundColor: '#2E2F33' }}
    >
      <h3>Lessons</h3>
      <ul className="nav-inverse nav-tabs nav-stacked">
        {lessons.map((lesson, i) => {
          return (
            <NavLink to={lesson.path} label={lesson.name} key={`lesson-${i}`} />
          );
        })}
      </ul>

      <h3>Component Docs</h3>
      <ul className="nav-inverse nav-tabs nav-stacked">
        {mainComponents.map((component, i) => {
          return (
            <NavLink
              to={component.path}
              label={component.name}
              key={`chart-component-${i}`}
            />
          );
        })}
      </ul>

      <h4>XY Chart Components</h4>
      <ul className="nav-inverse nav-tabs nav-stacked">
        {xyChartComponents.map((component, i) => {
          return (
            <NavLink
              to={component.path}
              label={component.name}
              key={`chart-component-${i}`}
            />
          );
        })}
      </ul>

      <h4>Standalone Chart Components</h4>
      <ul className="nav-inverse nav-tabs nav-stacked">
        {standaloneChartComponents.map((component, i) => {
          return (
            <NavLink
              to={component.path}
              label={component.name}
              key={`chart-component-${i}`}
            />
          );
        })}
      </ul>

      <h4>XY Data Components</h4>
      <ul className="nav-inverse nav-tabs nav-stacked">
        {dataMarkComponents.map((component, i) => {
          return (
            <NavLink
              to={component.path}
              label={component.name}
              key={`data-component-${i}`}
            />
          );
        })}
      </ul>

      <h4>XY Axis Components</h4>
      <ul className="nav-inverse nav-tabs nav-stacked">
        {axisComponents.map((component, i) => {
          return (
            <NavLink
              to={component.path}
              label={component.name}
              key={`axis-component-${i}`}
            />
          );
        })}
      </ul>
    </div>
  );
};

export const Home = () => (
  <div className="docs-home">
    <p>
      Reactochart is a library of React components for creating charts and
      graphs, used internally at Spotify.
    </p>

    <MultipleXYExample />
  </div>
);

export const App = () => (
  <Router>
    <div className="row docs-home">
      <Nav />
      <div className="col-md-10">
        <Route exact path="/" component={Home} />
        {allComponents.map((c, i) => (
          <Route path={c.path} component={c.Component} key={i} />
        ))}
      </div>
    </div>
  </Router>
);

import * as Reactochart from '../../src';
const {
  XYPlot,
  XAxis,
  YAxis,
  RangeBarChart,
  LineChart,
  ScatterPlot,
  BarChart,
  MarkerLineChart,
  ColorHeatmap,
  AreaHeatmap,
} = Reactochart;

class MultipleXYExample extends React.Component {
  render() {
    return (
      <div>
        <XYPlot
          xDomain={[-2, 2]}
          yDomain={[-2, 2]}
          {...{ width: 400, height: 400 }}
        >
          <XAxis title="Phase" />
          <YAxis title="Intensity" />

          <RangeBarChart
            data={_.range(0, 2, 0.03)}
            x={d => d}
            y={d => Math.sin(d * 3) * 0.7 + 1.2}
            yEnd={d => Math.sin(d * 3) * Math.cos(d * 3) * 0.7 + 1.2}
            barThickness={2}
            barStyle={{ fill: '#3690c0' }}
          />

          <LineChart
            data={_.range(-2, 0, 0.005)}
            x={d => d}
            y={d =>
              Math.pow(
                Math.abs(Math.sin(d * 5)),
                Math.abs(Math.sin(d * 0.25)),
              ) * 1.8
            }
            lineStyle={{ stroke: '#02818a', strokeWidth: 3 }}
          />

          <ScatterPlot
            data={_.range(-2, 0, 0.05)}
            x={d => d}
            y={d => Math.pow(2, (d + 2) * 1.8) * 0.1}
            pointSymbol={<rect width={5} height={5} fill="#3690c0" />}
          />

          <BarChart
            data={_.range(0, 2, 0.03)}
            x={d => d}
            y={d => -Math.abs(Math.sin(d * 4) * Math.cos(d * 3))}
            barThickness={3}
            barStyle={{ fill: '#67a9cf' }}
          />

          <MarkerLineChart
            data={_.range(0, 1.5, 0.1)}
            x={d => d}
            y={d => Math.cos(d)}
            lineStyle={{ stroke: '#ec7014', strokeWidth: 3 }}
          />

          <ColorHeatmap
            data={_.flatten(
              _.range(-2, 0, 0.1).map(i =>
                _.range(-2, 0, 0.1).map(j => [i, j]),
              ),
            )}
            value={([i, j]) => Math.sin(i * j * 5)}
            /* eslint-disable */
            x={([i, j]) => i}
            xEnd={([i, j]) => i + 0.1}
            y={([i, j]) => j}
            yEnd={([i, j]) => j + 0.1}
            /* eslint-enable */
            colors={['#d0d1e6', '#016450']}
            interpolator="lab"
          />

          <AreaHeatmap
            data={_.flatten(
              _.range(0, 2, 0.1).map(i =>
                _.range(-2, -1, 0.1).map(j => [i, j]),
              ),
            )}
            area={([i, j]) => -Math.sin(i * j * 5)}
            /* eslint-disable no-unused-vars */
            x={([i, j]) => i}
            xEnd={([i, j]) => i + 0.1}
            y={([i, j]) => j}
            yEnd={([i, j]) => j + 0.1}
            /* eslint-enable no-unused-vars */
            rectStyle={{ fill: '#016450' }}
          />
        </XYPlot>
      </div>
    );
  }
}
