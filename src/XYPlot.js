import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import resolveXYScales from "./utils/resolveXYScales";
import { innerSize } from "./utils/Margin";
import { inferScaleType } from "./utils/Scale";
import { methodIfFuncProp } from "./util";

function indexOfClosestNumberInList(number, list) {
  return list.reduce((closestI, current, i) => {
    return Math.abs(current - number) < Math.abs(list[closestI] - number)
      ? i
      : closestI;
  }, 0);
}

function invertPointScale(scale, rangeValue) {
  // shim until d3.scalePoint.invert() is implemented for real
  // given a value from the output range, returns the *nearest* corresponding value in the input domain
  const rangePoints = scale.domain().map(domainValue => scale(domainValue));
  const nearestPointIndex = indexOfClosestNumberInList(rangeValue, rangePoints);
  return scale.domain()[nearestPointIndex];
}

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

  const xValue = !_.inRange(
    innerX,
    0,
    chartSize.width /* + padding.left + padding.right */
  )
    ? null
    : xScaleType === "ordinal"
      ? invertPointScale(xScale, innerX)
      : xScale.invert(innerX);
  const yValue = !_.inRange(
    innerY,
    0,
    chartSize.height /* + padding.top + padding.bottom */
  )
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
     * The X and/or Y domains of the data in {x: [...], y: [...]} format.
     * For numerical scales, this is represented as [min, max] of the data;
     * for ordinal/categorical scales it is an array of known values ie. ['a', 'b', 'c'].
     * Automatically determined from data if not passed.
     */
    xDomain: PropTypes.array,
    yDomain: PropTypes.array,

    xScaleType: PropTypes.string,
    yScaleType: PropTypes.string,

    /**
     * Whether or not to invert the x and y scales
     */
    invertXScale: PropTypes.bool,
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
     *
     */
    marginTop: PropTypes.number,
    marginBottom: PropTypes.number,
    marginLeft: PropTypes.number,
    marginRight: PropTypes.number,

    // todo spacing & padding...
    spacingTop: PropTypes.number,
    spacingBottom: PropTypes.number,
    spacingLeft: PropTypes.number,
    spacingRight: PropTypes.number,

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
    xyPlotClassName: ""
  };

  onXYMouseEvent = (callbackKey, event) => {
    const callback = this.props[callbackKey];
    if (!_.isFunction(callback)) return;
    const options = getMouseOptions(event, this.props);
    callback(options);
  };
  onMouseMove = _.partial(this.onXYMouseEvent, "onMouseMove");
  onMouseDown = _.partial(this.onXYMouseEvent, "onMouseDown");
  onMouseUp = _.partial(this.onXYMouseEvent, "onMouseUp");
  onClick = _.partial(this.onXYMouseEvent, "onClick");
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
    const handlers = _.fromPairs(
      handlerNames.map(n => [n, methodIfFuncProp(n, this.props, this)])
    );
    const scales = {
      xScale,
      yScale
    };
    const xyPlotPropKeys = _.keys(XYPlot.propTypes);
    const propsToPass = {
      ..._.pick(this.props, xyPlotPropKeys),
      ...chartSize,
      ...scales
    };

    const className = `rct-xy-plot ${this.props.xyPlotClassName}`;

    return (
      <svg {...{ width, height, className }} {...handlers}>
        <rect className="rct-chart-background" {...{ width, height }} />
        <g
          transform={`translate(${marginLeft + spacingLeft}, ${marginTop +
            spacingTop})`}
          className="rct-chart-inner"
        >
          <rect
            transform={`translate(${-spacingLeft}, ${-spacingTop})`}
            className="rct-plot-background"
            {...panelSize}
          />
          {React.Children.map(this.props.children, child => {
            return _.isNull(child) || _.isUndefined(child)
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
