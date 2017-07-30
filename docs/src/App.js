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

export const Home = (props) => (
  <div className="docs-home">
    <h2>Home</h2>
  </div>
);

const components = [
  {name: 'Line Chart', path: '/line', Component: LineChartDocs},
  {name: 'Scatter Plot', path: '/scatter', Component: ScatterPlotDocs},
  {name: 'Pie Chart', path: '/pie', Component: PieChartDocs},
  {name: 'Bar Chart', path: '/bar', Component: BarChartDocs},
  {name: 'Area Chart', path: '/area', Component: AreaChartDocs},
  {name: 'Color Heatmap', path: '/color-heatmap', Component: ColorHeatmapDocs},
  {name: 'Area Heatmap', path: '/area-heatmap', Component: AreaHeatmapDocs},
];

export const App = (props) => (
    <Router>
      <div className="docs-home">
        <h2>Reactochart Docs &amp; Examples:</h2>


        <ul>
          <li><Link to="/">Home</Link></li>
          {components.map((component, i) => {
            return <li className="example-link" key={i}>
              <Link to={component.path}>{component.name}</Link>
            </li>;
          })}
        </ul>

        <Route exact path={'/'} component={Home} />
        {components.map((c, i) => (
          <Route path={c.path} component={c.Component} key={i} />
        ))}
      </div>
    </Router>
);


