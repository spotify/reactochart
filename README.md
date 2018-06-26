![Build Status](https://travis-ci.org/spotify/reactochart.svg?branch=master)](https://travis-ci.org/spotify/reactochart)
![NPM version](https://img.shields.io/npm/v/reactochart.svg?style=flat-square)](https://npmjs.org/package/reactochart)

# Overview

Reactochart is a library of React components for creating data visualization charts and graphs. Components include **line chart**, **bar chart**, **area chart**, **heat maps**, **scatterplot**, **histogram**, **pie chart**, **sankey diagram**, and **tree map**.

# Getting started

1. Install reactochart using npm.

  ```
  npm i reactochart --save
  ```

2. Then you can import an individual Reactochart component:
 ```
 import LineChart from 'reactochart/LineChart'
 ```

3. If you prefer, you can import all of Reactochart at once, though this may hinder some optimizations, such as webpack tree-shaking:
  ```
  import {XYPlot, XAxis, YAxis, LineChart} from 'reactochart';
  ```
or
  ```
  import * as Reactochart from 'reactochart';
  ```
4. See your first chart rendered!


# Live Examples

The examples contain more details about each component and the prop-types it accepts. To run the examples locally and play with the different types of charts in a live code editor:

1.  Clone this repo and `cd` to the newly-created directory
2.  Run `npm run serve` in your terminal (note: if you're running Python in v3 or higher you'll need to run `python -m http.server`)
3.  Go to [http://localhost:8000](http://localhost:8000)

# Reactochart Components
## Chart Foundations

### XY Plot
  * XYPlot

### XY Axis Components

* XAxis, YAxis
* XAxisTitle, YAxisTitle
* XAxisLabels, YAxisLabels
* XTicks, YTicks
* XGrid, YGrid

# Chart Types
### Non-XY charts

* PieChart
* TreeMap

### XY charts

* AreaBarChart
* AreaChart
* AreaHeatmap
* BarChart
* ColorHeatmap
* FunnelChart
* Histogram
* LineChart
* MarkerLineChart
* RangeBarChart
* SankeyDiagram
* ScatterPlot

### XY datum components (used by charts/axes)

* Bar
* RangeRect
* XLine, YLine

### Higher-order components

* resolveXYScales

### Utilities

* Data
* Scale
* Axis
* Label
* Margin
* depthEqual

# Development

If you'd like to contribute to the development this project, first fork & clone this repo, and then follow these steps:

### Global dependencies

* This project uses NPM to manage dependencies and run scripts. Run `npm -v` to check if you already have it installed.
  If you don't have it, NPM is packaged with Node.js - download and run the
  [install package located on nodejs.org](https://nodejs.org/) to install.
* Babel is used to transpile ES6+ code to ES5 syntax. Install by running `npm install --global babel`
* Webpack is used to bundle the JS & styles for the examples. Install by running `npm install --global webpack`

### Project dependencies

* Run `npm install` in the project root directory. This will install all of the project dependencies into the
  `node_modules` directory.

### Development process

* Run `npm run dev` to run the development server (webpack-dev-server), which will serve a live development version of
  the examples at [localhost:9876](http://localhost:9876)
* Make changes to the library code in the `src` directory, and/or changes to the examples in the `examples/src`
  directory.
* Once you are happy with your changes, run `npm run build` to generate a production build. (This transpiles the ES6
  library code, and transpiles + bundles the examples).
* `git commit` and `git push` your changes to your forked version of the repo.
* Open a Github pull request if you'd like to get your changes merged into the official repository.

### Notes

* **Do not make any changes in the `lib` or `examples/build` directories**, as these directories are destroyed and
  regenerated on each build.
* The development server uses [react-hot-loader](https://github.com/gaearon/react-hot-loader) to automatically
  "hot reload" changes to React components, so refreshing your web browser is usually not necessary. However, some
  changes will still require a refresh to propagate.

## Code of Conduct
This project adheres to the [Open Code of Conduct][code-of-conduct]. By participating, you are expected to honor this code.

[code-of-conduct]: https://github.com/spotify/code-of-conduct/blob/master/code-of-conduct.md
