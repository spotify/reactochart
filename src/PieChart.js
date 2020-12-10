import sumBy from 'lodash/sumBy';
import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import React from 'react';
import { methodIfFuncProp, bindTrailingArgs } from './util.js';
import * as CustomPropTypes from './utils/CustomPropTypes';
import { getValue, makeAccessor } from './utils/Data';

// default height/width, used only if height & width & radius are all undefined
const DEFAULT_SIZE = 150;

/**
 * `PieChart` is a circular graphic that is divided into slices to illustrate proportions or percentages.
 */
class PieChart extends React.Component {
  static propTypes = {
    /**
     * Array of data to plot with pie chart.
     */
    data: PropTypes.array.isRequired,
    /* Accessor function for getting the pie slices plotted on the pie chart.
     * If not provided, just uses the data value itself at given index.
     */
    slice: CustomPropTypes.getter.isRequired,
    /**
     * Total expected sum of all the pie slice values.
     * If provided && slices don't add up to total, an "empty" slice will be rendered for the rest
     * If not provided, will be the sum of all values (ie. all values will always add up to 100%)
     */
    total: PropTypes.number,
    /**
     * Optional width of the SVG
     * if not passed in and height is passed in, same # is used for both (ie. width=100 means height=100 also)
     * if neither is passed, but radius is, radius+margins is used
     * if neither is passed, and radius isn't either, 150 is used
     */
    width: PropTypes.number,
    /**
     * Optional height of the SVG
     * if not passed in and width is passed in, same # is used for both (ie. width=100 means height=100 also)
     * if neither is passed, but radius is, radius+margins is used
     * if neither is passed, and radius isn't either, 150 is used
     */
    height: PropTypes.number,
    /**
     * Optional radius of the pie chart, inferred from margin/width/height if not provided.
     */
    radius: PropTypes.number,
    marginTop: PropTypes.number,
    marginBottom: PropTypes.number,
    marginLeft: PropTypes.number,
    marginRight: PropTypes.number,
    /**
     * Optional radius of the "donut hole" circle drawn on top of the pie chart to turn it into a donut chart.
     */
    holeRadius: PropTypes.number,
    /**
     * Optional label text to display in the middle of the pie/donut.
     */
    centerLabel: PropTypes.string,
    /**
     * Class attribute to be applied to center label.
     */
    centerLabelClassName: PropTypes.string,
    /**
     * Inline style object to be applied to center label.
     */
    centerLabelStyle: PropTypes.object,
    /**
     * Accessor for getting labels that are rendered outside each slice of the pie chart.
     * If not provided no labels will be rendered.
     */
    getPieSliceLabel: PropTypes.func,
    /**
     * Inline style object applied to each slice label.
     * When a function is provided it will receive the value for the slice and should return the
     * style object for that slice's label.
     * Used along with `getPieSliceLabel`.
     */
    pieSliceLabelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Distance to render the label from the outer edge of the pie chart. Positive numbers will
     * move away from the center and negative numbers will move toward the center.
     * When a function is provided it will receive the value for the slice and should return the
     * distance for that slice's label.
     * Used along with `getPieSliceLabel`.
     */
    pieSliceLabelDistance: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.func,
    ]),
    /**
     * Class attribute to be applied to each pie slice,
     * or accessor function which returns a class.
     */
    pieSliceClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * Inline style object applied to each pie slice.
     * When a function is provided it will receive the value and index for the
     * slice as its parameters, and should return the style object for the slice.
     */
    pieSliceStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * Value for where to place markerline.
     */
    markerLineValue: PropTypes.number,
    /**
     * Class attribute to be applied to marker line.
     */
    markerLineClassName: PropTypes.string,
    /**
     * Inline style object to be applied to marker line.
     */
    markerLineStyle: PropTypes.object,
    /**
     * Number of pixels marker line hangs inside the pie chart.
     */
    markerLineOverhangInner: PropTypes.number,
    /**
     * Number of pixels marker line hangs outside the pie chart.
     */
    markerLineOverhangOuter: PropTypes.number,
    /**
     * `mouseenter` event handler callback, called when user's mouse enters the marker line.
     */
    onMouseEnterLine: PropTypes.func,
    /**
     * `mousemove` event handler callback, called when user's mouse moves within the marker line.
     */
    onMouseMoveLine: PropTypes.func,
    /**
     * `mouseleave` event handler callback, called when user's mouse leaves the marker line.
     */
    onMouseLeaveLine: PropTypes.func,
    /**
     * `mouseenter` event handler callback, called when user's mouse enters a pie slice.
     */
    onMouseEnterSlice: PropTypes.func,
    /**
     * `mousemove` event handler callback, called when user's mouse moves within a pie slice.
     */
    onMouseMoveSlice: PropTypes.func,
    /**
     * `mouseleave` event handler callback, called when user's mouse leaves a pie slice.
     */
    onMouseLeaveSlice: PropTypes.func,
    /**
     * `click` event handler callback, called when user click a pie slice.
     */
    onClick: PropTypes.func,
  };
  static defaultProps = {
    centerLabelClassName: '',
    centerLabelStyle: {},
    pieSliceClassName: '',
    pieSliceStyle: {},
    markerLineClassName: '',
    markerLineOverhangInner: 2,
    markerLineOverhangOuter: 2,
    markerLineStyle: {},
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  };

  onMouseEnterSlice = (e, d) => {
    this.props.onMouseEnterSlice(e, d);
  };
  onMouseMoveSlice = (e, d) => {
    this.props.onMouseMoveSlice(e, d);
  };
  onMouseLeaveSlice = (e, d) => {
    this.props.onMouseLeaveSlice(e, d);
  };

  onMouseEnterLine = (e, d) => {
    this.props.onMouseEnterLine(e, d);
  };
  onMouseMoveLine = (e, d) => {
    this.props.onMouseMoveLine(e, d);
  };
  onMouseLeaveLine = (e, d) => {
    this.props.onMouseLeaveLine(e, d);
  };
  onClick = (e, d) => {
    this.props.onClick(e, d);
  };

  renderMarkerLine(pathData) {
    const { markerLineClassName, markerLineStyle } = this.props;
    const lineD = {
      value: this.props.markerLineValue,
    };

    const [onMouseEnter, onMouseMove, onMouseLeave, onClick] = [
      'onMouseEnterLine',
      'onMouseMoveLine',
      'onMouseLeaveLine',
      'onClick',
    ].map(eventName => {
      // partially apply this line's data point as 2nd callback argument
      const callback = methodIfFuncProp(eventName, this.props, this);
      return isFunction(callback) ? bindTrailingArgs(callback, lineD) : null;
    });

    return (
      <path
        style={markerLineStyle}
        className={`rct-marker-line ${markerLineClassName}`}
        d={pathData}
        {...{ onMouseEnter, onMouseMove, onMouseLeave, onClick }}
      />
    );
  }

  renderSliceLabel(value, slice, center, radius, index) {
    const {
      getPieSliceLabel,
      pieSliceLabelStyle,
      pieSliceLabelDistance,
    } = this.props;
    const labelPercent = (slice.end - slice.start) / 2 + slice.start;
    const style = {
      textAnchor: 'middle',
      dominantBaseline: 'central',
    };

    if (pieSliceLabelStyle) {
      Object.assign(style, getValue(pieSliceLabelStyle, value));
    }

    const r = pieSliceLabelDistance
      ? radius + getValue(pieSliceLabelDistance, value)
      : radius;
    const x = center.x + Math.sin((2 * Math.PI) / (1 / labelPercent)) * r;
    const y = center.y - Math.cos((2 * Math.PI) / (1 / labelPercent)) * r;

    return (
      <text key={index} x={x} y={y} style={style}>
        {getPieSliceLabel(value)}
      </text>
    );
  }

  renderCenterLabel(center) {
    const { centerLabelStyle, centerLabelClassName, centerLabel } = this.props;
    const { x, y } = center;
    const style = Object.assign(
      {},
      { textAnchor: 'middle', dominantBaseline: 'central' },
      centerLabelStyle,
    );

    return (
      <text
        className={`rct-pie-label-center ${centerLabelClassName}`}
        {...{ x, y, style }}
      >
        {centerLabel}
      </text>
    );
  }

  render() {
    const {
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      holeRadius,
    } = this.props;

    // sizes fallback based on provided info: given dimension -> radius + margin -> other dimension -> default
    const width =
      this.props.width ||
      (this.props.radius
        ? this.props.radius * 2 + marginLeft + marginRight
        : this.props.height) ||
      DEFAULT_SIZE;
    const height =
      this.props.height ||
      (this.props.radius
        ? this.props.radius * 2 + marginTop + marginBottom
        : this.props.width) ||
      DEFAULT_SIZE;
    const radius =
      this.props.radius ||
      Math.min(
        (width - (marginLeft + marginRight)) / 2,
        (height - (marginTop + marginBottom)) / 2,
      );
    const center = { x: marginLeft + radius, y: marginTop + radius };

    const {
      data,
      total,
      centerLabel,
      getPieSliceLabel,
      markerLineValue,
      markerLineOverhangInner,
      markerLineOverhangOuter,
      pieSliceClassName,
    } = this.props;

    const valueAccessor = makeAccessor(this.props.slice);
    const sum = sumBy(data, valueAccessor);
    const newTotal = total || sum;
    const markerLinePercent = isFinite(markerLineValue)
      ? markerLineValue / newTotal
      : null;

    let startPercent = 0;
    const slices = data.map(d => {
      const slicePercent = valueAccessor(d) / newTotal;
      const slice = {
        start: startPercent,
        end: startPercent + slicePercent,
      };
      startPercent += slicePercent;

      return slice;
    });

    return (
      <svg className="rct-pie-chart" {...{ width, height }}>
        {data.map((d, i) => {
          const [onMouseEnter, onMouseMove, onMouseLeave, onClick] = [
            'onMouseEnterSlice',
            'onMouseMoveSlice',
            'onMouseLeaveSlice',
            'onClick',
          ].map(eventName => {
            // partially apply this slice's data point as 2nd callback argument
            const callback = methodIfFuncProp(eventName, this.props, this);
            return isFunction(callback) ? bindTrailingArgs(callback, d) : null;
          });

          const className = `rct-pie-slice rct-pie-slice-${i} ${getValue(
            pieSliceClassName,
            d,
            i,
          ) || ''}`;
          const slice = slices[i];
          const pathStr = pieSlicePath(
            slice.start,
            slice.end,
            center,
            radius,
            holeRadius,
          );
          const key = `pie-slice-${i}`;

          return (
            <path
              {...{
                className,
                d: pathStr,
                onMouseEnter,
                onMouseMove,
                onMouseLeave,
                onClick,
                key,
                style: getValue(this.props.pieSliceStyle, d, i),
              }}
            />
          );
        })}

        {sum < newTotal ? ( // draw empty slice if the sum of slices is less than expected total
          <path
            className="rct-pie-slice rct-pie-slice-empty"
            d={pieSlicePath(startPercent, 1, center, radius, holeRadius)}
            key="pie-slice-empty"
          />
        ) : null}

        {markerLinePercent !== null && isFinite(markerLinePercent)
          ? this.renderMarkerLine(
              markerLine(
                markerLinePercent,
                center,
                radius,
                holeRadius,
                markerLineOverhangOuter,
                markerLineOverhangInner,
              ),
            )
          : null}

        {centerLabel ? this.renderCenterLabel(center) : null}
        {getPieSliceLabel
          ? data.map((d, i) =>
              this.renderSliceLabel(d, slices[i], center, radius, i),
            )
          : null}
      </svg>
    );
  }
}

function markerLine(
  percentValue,
  center,
  radius,
  holeRadius = 0,
  overhangOuter = 0,
  overhangInner = 0,
) {
  const startX = Math.sin((2 * Math.PI) / (1 / percentValue));
  const startY = Math.cos((2 * Math.PI) / (1 / percentValue));
  const [c, r, rH, x0, y0] = [center, radius, holeRadius, startX, startY];
  const [r0, r1] = [Math.max(rH - overhangInner, 0), r + overhangOuter];

  return [
    // construct a string representing the marker line
    `M ${c.x + x0 * r0},${c.y - y0 * r0}`, // start at edge of inner (hole) circle, or center if no hole
    `L ${c.x + x0 * r1},${c.y - y0 * r1} z`, // straight line to outer circle, along radius
  ].join(' ');
}

function pieSlicePath(
  startPercent,
  endPercent,
  center,
  radius,
  holeRadius = 0,
) {
  let parsedEndPercent = endPercent;

  if (parsedEndPercent === 1) {
    parsedEndPercent = 0.9999999; // arc cannot be a full circle
  }

  const startX = Math.sin((2 * Math.PI) / (1 / startPercent));
  const startY = Math.cos((2 * Math.PI) / (1 / startPercent));
  const endX = Math.sin((2 * Math.PI) / (1 / parsedEndPercent));
  const endY = Math.cos((2 * Math.PI) / (1 / parsedEndPercent));

  const largeArc = parsedEndPercent - startPercent <= 0.5 ? 0 : 1;
  const [c, r, rH, x0, x1, y0, y1] = [
    center,
    radius,
    holeRadius,
    startX,
    endX,
    startY,
    endY,
  ];

  return [
    // construct a string representing the pie slice path
    `M ${c.x + x0 * rH},${c.y - y0 * rH}`, // start at edge of inner (hole) circle, or center if no hole
    `L ${c.x + x0 * r},${c.y - y0 * r}`, // straight line to outer circle, along radius
    `A ${r},${r} 0 ${largeArc} 1 ${c.x + x1 * r},${c.y - y1 * r}`, // outer arc
  ]
    .concat(
      holeRadius
        ? [
            // if we have an inner (donut) hole, draw an inner arc too, otherwise we're done
            `L ${c.x + x1 * rH},${c.y - y1 * rH}`, // straight line to inner (hole) circle, along radius
            `A ${rH},${rH} 0 ${largeArc} 0 ${c.x + x0 * rH},${c.y - y0 * rH} z`, // inner arc
          ]
        : 'z',
    )
    .join(' ');
}

export default PieChart;
