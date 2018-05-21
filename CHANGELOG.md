## 0.4.6 (2018-05-21)

* [#63](https://github.com/spotify/reactochart/pull/63) Include css in root
* [#65](https://github.com/spotify/reactochart/pull/65) Test for AreaBarChart
* [#66](https://github.com/spotify/reactochart/pull/66) Namespace CSS
* [#67](https://github.com/spotify/reactochart/pull/67) Add disableMouseWheelZoom to ZoomContainer

## 0.4.5 (2018-04-18)

* [#56](https://github.com/spotify/reactochart/pull/56) Add `react-docgen` to devDependencies.

## 0.4.4 (2018-04-10)

* [#55](https://github.com/spotify/reactochart/pull/55) Add `controlled` prop to `ZoomContainer` so it can be controlled by props instead of internal state.

## 0.4.3 (2018-03-12)

* [#54](https://github.com/spotify/reactochart/pull/54) Fix for non-string `SankeyDiagram` `nodeLabelText` prop (see 0.4.2 notes) - now rendered as SVG instead of HTML wrapped in `<foreignObject>`

## 0.4.2 (2018-02-27)

* Added CHANGELOG file
* [#52](https://github.com/spotify/reactochart/pull/52) New `SankeyDiagram` features
  * `marginTop`, `marginBottom`, marginLeft`,`marginRight` props for leaving internal empty space around the diagram
  * `nodeLabelText` prop may now be a function which returns an arbitrary HTML component (instead of only a string)
* [#53](https://github.com/spotify/reactochart/pull/53) Documentation typo fixes

## 0.4.1 (2018-01-26)

* [#49](https://github.com/spotify/reactochart/pull/49) New `SankeyDiagram` prop `shouldClone`, to control whether data should be cloned or mutated in place

## 0.4.0 (2018-01-03)

* [#47](https://github.com/spotify/reactochart/issues/47) API Changes - see ticket for detailed discussion
  * `getThing` getter props renamed to just `thing` - now accept either a constant value or accessor function (when possible)
  * Deprecated string/number/null shorthand for getter props
  * Deprecated combined `thing={{x:..., y:...}}` props in favor of separate `xThing` and `yThing` props
  * Deprecated combined `thing={{top:..., bottom:..., left:..., right:...}}` props in favor of separate `thingTop`, `thingBottom`, `thingLeft`, `thingRight` props
* New chart component: `SankeyDiagram`
* Improved documentation and test coverage
* Added markdown support in docs (including for component prop docs)
* Removed compiled library files from repo - build library on `prepublish` instead

## 0.3.1 (2017-11-15)

* Improved test coverage & docs for `Bar` and `BarChart` components
* Fixed incorrect `react` peerDependency version
* Added missing `sinon` devDependency
* Added `yarn` lock file

## 0.3.0 (2017-08-10)

* New documentation, including tutorials and interactive examples
* New chart components: `ColorHeatmap`, `FunnelChart`
* Unified branches from several contributors (see [#45](https://github.com/spotify/reactochart/pull/45) for details)
* Added `className` and `style` props to `AreaHeatmap`
* Added `style` prop to `LineChart`
* Added `pointStyle` prop to `ScatterPlot`
* Changed `MarkerLineChart` to use `horizontal` prop, rather than `orientation`, for consistency
* Fixed missing import in `Scale`
* Fixed incorrect propTypes in `ScatterPlot` and `YAxis`
