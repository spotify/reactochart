import React from 'react';
import _ from 'lodash';
import measureText from 'measure-text';

export default class YAxisTitle extends React.Component {
  static propTypes = {
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    distance: React.PropTypes.number,
    position: React.PropTypes.oneOf(['left', 'right']),
    alignment: React.PropTypes.oneOf(['top', 'middle', 'bottom']),
    placement: React.PropTypes.oneOf(['before', 'after']),
    rotate: React.PropTypes.bool,
    titleStyle: React.PropTypes.object
  };
  static defaultProps = {
    height: 250,
    width: 400,
    distance: 5,
    position: 'left',
    alignment: 'middle',
    placement: undefined,
    rotate: true,
    titleStyle: {
      fontFamily: "Helvetica, sans-serif",
      fontSize: '24px',
      lineHeight: 1,
      textAnchor: 'end'
    }
  };

  render() {
    const {height, width, distance, position, alignment} = this.props;
    const title = this.props.title || this.props.children;
    const placement = this.props.placement || ((position === 'left') ? 'before' : 'after');

    const rotate = this.props.rotate ? -90 : 0;
    const posX = (position === 'right') ? width : 0;
    const translateX = posX +
      ((placement === 'before') ? -distance : distance);
    const translateY =
      (alignment === 'middle') ? (height / 2) :
      (alignment === 'bottom') ? (height) :
      0;
    const textAnchor =
      (rotate && alignment === 'top') ? 'end' :
      (rotate && alignment === 'middle') ? 'middle' :
      (rotate && alignment === 'bottom') ? 'start' :
      (placement === 'before') ? 'end' :
      'start';
    const dy =
      (rotate && placement == 'before') ? '-0.2em' :
      (rotate) ? '0.8em' :
      (alignment === 'top') ? '0.8em' :
      (alignment === 'middle') ? '0.3em' :
      null;

    return <g>
      <g transform={`translate(${translateX},${translateY})`}>
        <text style={{textAnchor}} transform={`rotate(${rotate})`} dy={dy}>
          {title}
        </text>
      </g>

      {/*

      <g transform={`translate(${-distance},0)`}>
        <text style={{textAnchor: 'end'}} dy="0.8em">
          Top T
        </text>
        <text transform="rotate(-90)" style={{textAnchor: 'end'}}>
          Top -90
        </text>
      </g>

      <g transform={`translate(${-distance},${height / 2})`}>
        <text style={{textAnchor: 'end'}} dy="0.3em">
          Middle
        </text>
        <text transform="rotate(-90)" style={{textAnchor: 'middle'}}>
          Mid -o- Mid
        </text>
      </g>

      <g transform={`translate(${-distance},${height})`}>
        <text style={{textAnchor: 'end'}}>
          Bottom
        </text>
        <text transform="rotate(-90)" style={{textAnchor: 'start'}}>
          Bottom -90
        </text>
      </g>


      <g transform={`translate(${distance},0)`}>
        <text style={{textAnchor: 'start'}} dy="0.8em">
          Top T
        </text>
        <text transform="rotate(-90)" style={{textAnchor: 'end'}} dy="0.8em">
          Top -90
        </text>
      </g>

      <g transform={`translate(${distance},${height / 2})`}>
        <text style={{textAnchor: 'start'}} dy="0.3em">
          Middle
        </text>
        <text transform="rotate(-90)" style={{textAnchor: 'middle'}} dy="0.8em">
          Mid -T- Mid
        </text>
      </g>

      <g transform={`translate(${distance},${height})`}>
        <text style={{textAnchor: 'start'}}>
          Bottom
        </text>
        <text transform="rotate(-90)" style={{textAnchor: 'start'}} dy="0.8em">
          Bottom -90
        </text>
      </g>

       */}

    </g>;
  }
}
