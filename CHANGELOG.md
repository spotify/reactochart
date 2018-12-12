## 1.5.0 (2018-12-11)

- [#129](https://github.com/spotify/reactochart/pull/129) Upgrade webpack and resolve security dev dependencies
- [#130](https://github.com/spotify/reactochart/pull/130) Upgrade to react v16 and update peer dependencies

## 1.4.1 (2018-12-04)

- [#127](https://github.com/spotify/reactochart/pull/127) Import measure-text source code to fix [security vulnerability](https://github.com/FormidableLabs/measure-text/issues/5) and [dev dependencies issue](https://github.com/spotify/reactochart/issues/123)

## 1.4.0 (2018-12-02)

- [#125](https://github.com/spotify/reactochart/pull/125) Omit certain XYPlot props from overriding children props downstream. Added xyPlotStyle prop.

## 1.3.1 (2018-09-12)

- [#117](https://github.com/spotify/reactochart/pull/117) Add style prop to XYPlot component
- [#115](https://github.com/spotify/reactochart/pull/115) Update documentation
- [#121](https://github.com/spotify/reactochart/pull/121) xyPlotClassName omission fix - thanks @rpjs!

## 1.3.0 (2018-09-12)

- [#114](https://github.com/spotify/reactochart/pull/114) Add optional label placement to barchart - thanks @dgdblank!
- [#111](https://github.com/spotify/reactochart/pull/111) Rebuild docs for gh-pages branch
- [#109](https://github.com/spotify/reactochart/pull/109) Adds curve prop to AreaChart for custom curves - thanks @dgdblank!

## 1.2.0 (2018-08-29)

- [#106](https://github.com/spotify/reactochart/pull/106) Adds showLine and lineStyle prop to X and Y Axis. Also adds default styling to provide X and Y Axis line with stroke color

## 1.1.0 (2018-08-28)

- [#99](https://github.com/spotify/reactochart/pull/99) Adds d3 line generator and curve prop to LineChart - thanks @scottsheffield!
- [#102](https://github.com/spotify/reactochart/pull/102) Adds offset prop to XAxis and YAxis labels
- [#103](https://github.com/spotify/reactochart/pull/103) Fix issue with doc generation with TreeMap

## 1.0.1 (2018-07-06)

- [#94](https://github.com/spotify/reactochart/pull/94) Minor Bug Fixes
  - Update propType `pointStyle` for ScatterPlot to be of type object or accessor func
  - Update propType `format` XAxis and YAxis (which is passed to X and YAxisLabel) to be of type string or accessor function
  - Update TreeMap and SankeyDiagram docs

## 1.0.0 (2018-06-28)

Although this is a major release, there aren't many breaking changes that weren't noted in previous releases. Additions include more tests, clean up of component API docs, minor bug fixes and feature adds and better consistency for chart props.

#### Breaking Changes

- Per [#63](https://github.com/spotify/reactochart/pull/63) Include css in root, the stylesheet has been moved to

```
import "reactochart/styles.css"
```

- [#85](https://github.com/spotify/reactochart/pull/80) PieChart - Deprecates markerLineClass in favor of markerLineClassName

## 0.4.8 (2018-06-08)

- [#80](https://github.com/spotify/reactochart/pull/80) Upgrade mocha to v4.0.1 to fix [growl dependency](https://github.com/tj/node-growl/pull/68)

## 0.4.7 (2018-05-31)

- [#73](https://github.com/spotify/reactochart/pull/73) Add step labeling to sankey

## 0.4.6 (2018-05-21)

- [#63](https://github.com/spotify/reactochart/pull/63) Include css in root
- [#65](https://github.com/spotify/reactochart/pull/65) Test for AreaBarChart
- [#66](https://github.com/spotify/reactochart/pull/66) Namespace CSS
- [#67](https://github.com/spotify/reactochart/pull/67) Add disableMouseWheelZoom to ZoomContainer

## 0.4.5 (2018-04-18)

- [#56](https://github.com/spotify/reactochart/pull/56) Add `react-docgen` to devDependencies.

## 0.4.4 (2018-04-10)

- [#55](https://github.com/spotify/reactochart/pull/55) Add `controlled` prop to `ZoomContainer` so it can be controlled by props instead of internal state.

## 0.4.3 (2018-03-12)

- [#54](https://github.com/spotify/reactochart/pull/54) Fix for non-string `SankeyDiagram` `nodeLabelText` prop (see 0.4.2 notes) - now rendered as SVG instead of HTML wrapped in `<foreignObject>`

## 0.4.2 (2018-02-27)

- Added CHANGELOG file
- [#52](https://github.com/spotify/reactochart/pull/52) New `SankeyDiagram` features
  - `marginTop`, `marginBottom`, marginLeft`,`marginRight` props for leaving internal empty space around the diagram
  - `nodeLabelText` prop may now be a function which returns an arbitrary HTML component (instead of only a string)
- [#53](https://github.com/spotify/reactochart/pull/53) Documentation typo fixes

## 0.4.1 (2018-01-26)

- [#49](https://github.com/spotify/reactochart/pull/49) New `SankeyDiagram` prop `shouldClone`, to control whether data should be cloned or mutated in place

## 0.4.0 (2018-01-03)

- [#47](https://github.com/spotify/reactochart/issues/47) API Changes - see ticket for detailed discussion
  - `getThing` getter props renamed to just `thing` - now accept either a constant value or accessor function (when possible)
  - Deprecated string/number/null shorthand for getter props
  - Deprecated combined `thing={{x:..., y:...}}` props in favor of separate `xThing` and `yThing` props
  - Deprecated combined `thing={{top:..., bottom:..., left:..., right:...}}` props in favor of separate `thingTop`, `thingBottom`, `thingLeft`, `thingRight` props
- New chart component: `SankeyDiagram`
- Improved documentation and test coverage
- Added markdown support in docs (including for component prop docs)
- Removed compiled library files from repo - build library on `prepublish` instead

## 0.3.1 (2017-11-15)

- Improved test coverage & docs for `Bar` and `BarChart` components
- Fixed incorrect `react` peerDependency version
- Added missing `sinon` devDependency
- Added `yarn` lock file

## 0.3.0 (2017-08-10)

- New documentation, including tutorials and interactive examples
- New chart components: `ColorHeatmap`, `FunnelChart`
- Unified branches from several contributors (see [#45](https://github.com/spotify/reactochart/pull/45) for details)
- Added `className` and `style` props to `AreaHeatmap`
- Added `style` prop to `LineChart`
- Added `pointStyle` prop to `ScatterPlot`
- Changed `MarkerLineChart` to use `horizontal` prop, rather than `orientation`, for consistency
- Fixed missing import in `Scale`
- Fixed incorrect propTypes in `ScatterPlot` and `YAxis`
