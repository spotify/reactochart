## WARNING: THIS IS NOT YET PRODUCTION-QUALITY CODE. Docs and Tests are still being written. Use at your own risk. If your project requires composable React charts, we recommend using [Victory](https://github.com/FormidableLabs/victory).

# reactochart

Charting library for React

# Styles
In order to use reactochart, import the base styles

```
import 'reactochart/styles.css'
```

# API


### Non-XY charts

* PieChart
* TreeMap

### XYPlot & XY charts

* XYPlot
* BarChart
* RangeBarChart
* LineChart
* ScatterPlot
* MarkerLineChart
* AreaHeatmap
* Histogram
* KernelDensityEstimation
* _planned: AreaChart, StackedBarChart, GroupedBarChart_

### XY Axis Components

* XAxis, YAxis
* XAxisTitle, YAxisTitle
* XAxisLabels, YAxisLabels
* XTicks, YTicks
* XGrid, YGrid

### XY datum components (used by charts/axes)

* Bar
* RangeRect
* XLine, YLine
* _planned: AreaRect?, AreaCircle?_

### Higher-order components

* resolveXYScales

### Utilities

* Data
* Scale
* Axis
* Label
* Margin
* depthEqual

# Examples

If you just want to run the examples locally:

1.  Clone this repo and `cd` to the newly-created directory
2.  Run `npm run serve` in your terminal (note: if you're running Python in v3 or higher you'll need to run `python -m http.server`)
3.  Go to [http://localhost:8000](http://localhost:8000)

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

# TO DO:

* write unit tests
* ensure all charts have common proptypes
* documentation

## additional chart types

* Range-Value Bar Chart
* Value-Range Bar Chart
* Range-Range Bar Chart
* 2D Histogram (heatmap)
* 2D KDE?

## Code of Conduct
This project adheres to the [Open Code of Conduct][code-of-conduct]. By participating, you are expected to honor this code.

[code-of-conduct]: https://github.com/spotify/code-of-conduct/blob/master/code-of-conduct.md
