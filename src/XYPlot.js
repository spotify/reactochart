import inRange from "lodash/inRange";
import isFunction from "lodash/isFunction";
import fromPairs from "lodash/fromPairs";
import omit from "lodash/omit";
import pick from "lodash/pick";
import isNull from "lodash/isNull";
import isUndefined from "lodash/isUndefined";
import PropTypes from "prop-types";
import React from "react";
import { methodIfFuncProp } from "./util";
import { innerSize } from "./utils/Margin";
import resolveXYScales from "./utils/resolveXYScales";
import { inferScaleType, invertPointScale } from "./utils/Scale";

function getMouseOptions(
  event,
  {
    xScale,
    yScale,
    height,
    width,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight
  }
) {
  const chartBB = event.currentTarget.getBoundingClientRect();
  const outerX = Math.round(event.clientX - chartBB.left);
  const outerY = Math.round(event.clientY - chartBB.top);
  const innerX = outerX - (marginLeft || 0);
  const innerY = outerY - (marginTop || 0);
  const chartSize = innerSize(
    { width, height },
    {
      top: marginTop,
      bottom: marginBottom,
      left: marginLeft,
      right: marginRight
    }
  );
  const xScaleType = inferScaleType(xScale);
  const yScaleType = inferScaleType(yScale);

  const xValue = !inRange(innerX, 0, chartSize.width)
    ? null
    : xScaleType === "ordinal"
      ? invertPointScale(xScale, innerX)
      : xScale.invert(innerX);

  const yValue = !inRange(innerY, 0, chartSize.height)
    ? null
    : yScaleType === "ordinal"
      ? invertPointScale(yScale, innerY)
      : yScale.invert(innerY);

  return {
    event,
    outerX,
    outerY,
    innerX,
    innerY,
    xValue,
    yValue,
    xScale,
    yScale,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight
  };
}

class XYPlot extends React.Component {
  static propTypes = {
    /**
     * (outer) width of the chart (SVG element).
     */
    width: PropTypes.number,
    /**
     * (outer) width of the chart (SVG element).
     */
    height: PropTypes.number,
    /**
     * The X domain of the data as an array.
     * For numerical scales, this is represented as [min, max] of the data;
     * for ordinal/categorical scales it is an array of known values ie. ['a', 'b', 'c'].
     * Automatically determined from data if not passed.
     */
    xDomain: PropTypes.array,
    /**
     * The Y domain of the data as an array.
     * For numerical scales, this is represented as [min, max] of the data;
     * for ordinal/categorical scales it is an array of known values ie. ['a', 'b', 'c'].
     * Automatically determined from data if not passed.
     */
    yDomain: PropTypes.array,

    xScaleType: PropTypes.string,
    yScaleType: PropTypes.string,

    /**
     * Whether or not to invert the x scale
     */
    invertXScale: PropTypes.bool,
    /**
     * Whether or not to invert the y scale
     */
    invertYScale: PropTypes.bool,

    /**
     * Whether or not to coerce 0 into your x domain
     */
    includeXZero: PropTypes.bool,
    /**
     * Whether or not to coerce 0 into your y domain
     */
    includeYZero: PropTypes.bool,

    /**
     * Internal top margin, in pixels.
     */
    marginTop: PropTypes.number,
    /**
     * Internal bottom margin, in pixels.
     */
    marginBottom: PropTypes.number,
    /**
     * Internal left margin, in pixels.
     */
    marginLeft: PropTypes.number,
    /**
     * Internal right margin, in pixels.
     */
    marginRight: PropTypes.number,
    /**
     * Internal top spacing of XYPlot, in pixels.
     */
    spacingTop: PropTypes.number,
    /**
     * Internal bottom spacing of XYPlot, in pixels.
     */
    spacingBottom: PropTypes.number,
    /**
     * Internal left spacing of XYPlot, in pixels.
     */
    spacingLeft: PropTypes.number,
    /**
     * Internal right spacing of XYPlot, in pixels.
     */
    spacingRight: PropTypes.number,

    /**
     * Inline style object to be applied to the parent SVG element.
     */
    style: PropTypes.object,
    /**
     * Inline style object to be applied to the plot.
     * This is the inner rect DOM element where the graphs are rendered within the axes.
     */
    xyPlotStyle: PropTypes.object,
    // todo implement padding (helper for spacing)
    // paddingTop: PropTypes.number,
    // paddingBottom: PropTypes.number,
    // paddingLeft: PropTypes.number,
    // paddingRight: PropTypes.number,

    onMouseMove: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseUp: PropTypes.func,

    /**
     * Class attribute applied to xy plot
     */
    xyPlotClassName: PropTypes.string
  };

  static defaultProps = {
    width: 400,
    height: 250,
    invertXScale: false,
    invertYScale: false,
    includeXZero: false,
    includeYZero: false,
    style: {},
    xyPlotStyle: {},
    xyPlotClassName: ""
  };

  onXYMouseEvent = (callbackKey, event) => {
    const callback = this.props[callbackKey];
    if (!isFunction(callback)) return;
    const options = getMouseOptions(event, this.props);
    callback(options);
  };

  onMouseMove = this.onXYMouseEvent.bind(this, "onMouseMove");
  onMouseDown = this.onXYMouseEvent.bind(this, "onMouseDown");
  onMouseUp = this.onXYMouseEvent.bind(this, "onMouseUp");
  onClick = this.onXYMouseEvent.bind(this, "onClick");

  onMouseEnter = event => this.props.onMouseEnter({ event });
  onMouseLeave = event => this.props.onMouseLeave({ event });

  render() {
    const {
      width,
      height,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      spacingTop,
      spacingBottom,
      spacingLeft,
      spacingRight,
      style,
      xyPlotStyle,
      xyPlotClassName,
      // Passed in as prop from resolveXYScales
      xScale,
      yScale
    } = this.props;
    // subtract margin + spacing from width/height to obtain inner width/height of panel & chart area
    // panelSize is the area including chart + spacing but NOT margin
    // chartSize is smaller, chart *only*, not including margin or spacing
    const panelSize = innerSize(
      { width, height },
      {
        top: marginTop,
        bottom: marginBottom,
        left: marginLeft,
        right: marginRight
      }
    );
    const chartSize = innerSize(panelSize, {
      top: spacingTop,
      bottom: spacingBottom,
      left: spacingLeft,
      right: spacingRight
    });

    const handlerNames = [
      "onMouseMove",
      "onMouseEnter",
      "onMouseLeave",
      "onMouseDown",
      "onMouseUp",
      "onClick"
    ];
    const handlers = fromPairs(
      handlerNames.map(n => [n, methodIfFuncProp(n, this.props, this)])
    );
    const scales = {
      xScale,
      yScale
    };

    // Props to omit since we don't want them to override child props
    // TODO for v2: Namespace these props to be specific to XYPlot,
    // but will be an incompatible API change
    const omittedProps = [
      "style",
      "onMouseMove",
      "onMouseEnter",
      "onMouseLeave"
    ];

    const xyPlotPropKeys = Object.keys(XYPlot.propTypes).filter(
      k => omittedProps.indexOf(k) === -1
    );

    const propsToPass = omit(
      {
        ...pick(this.props, xyPlotPropKeys),
        ...chartSize,
        ...scales
      },
      omittedProps
    );

    const className = `rct-xy-plot ${xyPlotClassName}`;

    return (
      <svg {...{ width, height, className, style }} {...handlers}>
        <rect className="rct-chart-background" {...{ width, height }} />
        <g
          transform={`translate(${marginLeft + spacingLeft}, ${marginTop +
            spacingTop})`}
          className="rct-chart-inner"
        >
          <rect
            transform={`translate(${-spacingLeft}, ${-spacingTop})`}
            className="rct-plot-background"
            style={xyPlotStyle}
            {...panelSize}
          />
          {React.Children.map(this.props.children, child => {
            return isNull(child) || isUndefined(child)
              ? null
              : React.cloneElement(child, propsToPass);
          })}
        </g>
      </svg>
    );
  }
}

const XYPlotResolved = resolveXYScales(XYPlot);

export default XYPlotResolved;
