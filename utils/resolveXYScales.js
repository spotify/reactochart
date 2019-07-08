"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolveXYScales;

var _lodash = _interopRequireDefault(require("lodash"));

var _react = _interopRequireDefault(require("react"));

var _Data = require("./Data");

var _Margin = require("./Margin");

var _Scale = require("./Scale");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * `resolveXYScales` is a higher-order-component.
 *
 * @param {Component} Component - The React Component (class) which should be wrapped by this HOC
 * @returns {Component} - A Component which auto-resolves XY scales from given props
 */
function isValidScaleType(scaleType) {
  const validScaleTypes = ["ordinal", "time", "log", "pow", "linear"];
  return _lodash.default.includes(validScaleTypes, scaleType);
}

function areValidScaleTypes(scaleTypes) {
  return _lodash.default.every(scaleTypes, isValidScaleType);
}

function mapOverChildren(children, iteratee, ...iterateeArgs) {
  // loop over all children (react elements) and call iteratee (a function) on each one
  // iteratee is called with parameters (child.props, child.type, ...iterateeArgs)
  if (!_lodash.default.isFunction(iteratee)) throw new Error("mapOverChildren iteratee must be a function");
  return _lodash.default.compact(_react.default.Children.map(children, child => {
    if (!child || !_react.default.isValidElement(child)) return null;
    return iteratee(child.props, child.type, ...iterateeArgs);
  }));
}

function omitNullUndefined(obj) {
  return _lodash.default.omitBy(obj, v => _lodash.default.isUndefined(v) || _lodash.default.isNull(v));
} // not currently being used but potentially has some learnings
// attempt at condensing all the resolve functions below
// function resolveXYPropsOnComponentOrChildren(propKeys, props, reducers = {}, validators = {}, result = {}) {
//   const isDone = (o) => (_.every(propKeys, k => _.isObject(o[k]) && _.every(['x', 'y'], xy => _.has(o[k][xy]))));
//   result = _.pick({...props, ...result}, propKeys);
//   let resolved = {};
//   _.forEach(propKeys, propKey => {
//     _.forEach(['x', 'y'], k => {
//       const isValid = validators[propKey] || (() => true);
//       if(_.isObject(props[propKey]) && _.has(props[propKey], k) && isValid(props[propKey][k])) {
//         if(!_.has(result, propKey)) result[propKey] = {};
//         result[propKey][k] = props[propKey][k];
//       }
//     });
//   });
//   if(isDone(result)) return result;
//   if(React.Children.count(props.children)) {
//     let childProps = mapOverChildren(props.children, resolveXYPropsOnComponentOrChildren, propKeys, 'props', result);
//     React.Children.forEach(props.children, child => {
//       if(!child) return;
//       childProps.push(resolveXYPropsOnComponentOrChildren(propKeys, child.props, result));
//     });
//       let childDomains = [];
//       React.Children.forEach(props.children, child => {
//         childDomains = childDomains.concat(this._resolveDomain(child.props, child.type, scaleType));
//       });
//       console.log('combining domains', childDomains);
//       const childDomain =  _.fromPairs(['x', 'y'].map(k => {
//         console.log(_.compact(_.map(childDomains, k)), scaleType[k]);
//         const kDomain = combineDomains(_.compact(_.map(childDomains, k)), dataTypeFromScaleType(scaleType[k]));
//         console.log(kDomain);
//         return [k, kDomain];
//       }));
//       console.log('combined domains', childDomain);
//       domain = _.assign(childDomain, domain);
//       return domain;
//   }
//   propKeys.forEach(k => {
//     result[propKeys] = props
//   })
// }


function resolveXYScales(ComposedComponent) {
  var _class, _temp;

  return _temp = _class = class extends _react.default.Component {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "_makeScales", ({
        width,
        height,
        xScaleType,
        yScaleType,
        invertXScale,
        invertYScale,
        xDomain,
        yDomain,
        xScale,
        yScale,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        spacingTop,
        spacingBottom,
        spacingLeft,
        spacingRight
      }) => {
        const spacing = {
          top: spacingTop,
          bottom: spacingBottom,
          left: spacingLeft,
          right: spacingRight
        };
        const margin = {
          top: marginTop,
          bottom: marginBottom,
          left: marginLeft,
          right: marginRight
        };
        const innerChartWidth = (0, _Margin.innerWidth)(width, margin);
        const innerChartHeight = (0, _Margin.innerHeight)(height, margin); // use existing scales if provided, otherwise create new

        if (!(0, _Scale.isValidScale)(xScale)) {
          //innerRange functions produce range (i.e. [5,20]) and map function normalizes to 0 (i.e. [0,15])
          const xRange = (0, _Margin.innerRangeX)(innerChartWidth, spacing).map(v => v - (spacing.left || 0));
          xScale = (0, _Scale.initScale)(xScaleType).domain(xDomain).range(xRange); // reverse scale domain if `invertXScale` is passed

          if (invertXScale) {
            xScale.domain(xScale.domain().reverse());
          }
        }

        if (!(0, _Scale.isValidScale)(yScale)) {
          const yRange = (0, _Margin.innerRangeY)(innerChartHeight, spacing).map(v => v - (spacing.top || 0));
          yScale = (0, _Scale.initScale)(yScaleType).domain(yDomain).range(yRange); // reverse scale domain if `invertYScale` is passed

          if (invertYScale) {
            yScale.domain(yScale.domain().reverse());
          }
        }

        return {
          xScale,
          yScale
        };
      });
    }

    _resolveScaleType(props, Component) {
      let {
        xScaleType,
        yScaleType
      } = props;

      const isDone = () => areValidScaleTypes([xScaleType, yScaleType]); // short-circuit if both scale types provided


      if (isDone()) return {
        xScaleType,
        yScaleType
      }; // if Component provides a custom static getScaleType method
      // use it to determine remaining scale types

      if (_lodash.default.isFunction(Component.getScaleType)) {
        const componentScaleTypes = omitNullUndefined(Component.getScaleType(props));
        ({
          xScaleType,
          yScaleType
        } = _lodash.default.assign(componentScaleTypes, omitNullUndefined({
          xScaleType,
          yScaleType
        })));
        if (isDone()) return {
          xScaleType,
          yScaleType
        };
      } // if component has domain props,
      // infer the data type, & use that to get scale type


      if (!isValidScaleType(xScaleType) && (0, _Data.isValidDomain)(props.xDomain)) {
        xScaleType = (0, _Scale.scaleTypeFromDataType)((0, _Scale.inferDataTypeFromDomain)(props.xDomain));
      }

      if (!isValidScaleType(yScaleType) && (0, _Data.isValidDomain)(props.yDomain)) {
        yScaleType = (0, _Scale.scaleTypeFromDataType)((0, _Scale.inferDataTypeFromDomain)(props.yDomain));
      }

      if (isDone()) return {
        xScaleType,
        yScaleType
      }; // if Component has data or datasets props,
      // infer the data type, & use that to get scale type

      if (_lodash.default.isArray(props.data) || _lodash.default.isArray(props.datasets)) {
        const datasets = _lodash.default.isArray(props.datasets) ? props.datasets : [props.data];

        if (!isValidScaleType(xScaleType)) {
          xScaleType = (0, _Scale.scaleTypeFromDataType)((0, _Data.inferDatasetsType)(datasets, (0, _Data.makeAccessor2)(props.x)));
        }

        if (!isValidScaleType(yScaleType)) {
          yScaleType = (0, _Scale.scaleTypeFromDataType)((0, _Data.inferDatasetsType)(datasets, (0, _Data.makeAccessor2)(props.y)));
        }

        if (isDone()) return {
          xScaleType,
          yScaleType
        };
      } // if Component has children,
      // recurse through descendants to resolve their scale types the same way


      if (_react.default.Children.count(props.children)) {
        let childrenScaleTypes = mapOverChildren(props.children, this._resolveScaleType.bind(this));

        if (!isValidScaleType(xScaleType)) {
          const childXScaleTypes = _lodash.default.compact(_lodash.default.uniq(childrenScaleTypes.map(childScaleTypes => childScaleTypes.xScaleType)));

          if (!childXScaleTypes.length === 1) console.warn("Multiple children with different X scale types found - defaulting to 'ordinal'");
          xScaleType = childXScaleTypes.length === 1 ? childXScaleTypes[0] : "ordinal";
        }

        if (!isValidScaleType(yScaleType)) {
          const childYScaleTypes = _lodash.default.compact(_lodash.default.uniq(childrenScaleTypes.map(childScaleTypes => childScaleTypes.yScaleType)));

          if (!childYScaleTypes.length === 1) console.warn("Multiple children with different Y scale types found - defaulting to 'ordinal'");
          yScaleType = childYScaleTypes.length === 1 ? childYScaleTypes[0] : "ordinal";
        }
      } // if(!isDone()) console.warn(`resolveXYScales was unable to resolve both scale types. xScaleType: ${xScaleType}, yScaleType: ${yScaleType}`);


      return {
        xScaleType,
        yScaleType
      };
    }

    _resolveDomain(props, Component, xScaleType, yScaleType) {
      let {
        xDomain,
        yDomain,
        includeXZero,
        includeYZero
      } = props;
      const xDataType = (0, _Scale.dataTypeFromScaleType)(xScaleType);
      const yDataType = (0, _Scale.dataTypeFromScaleType)(yScaleType);

      const isXDone = () => (0, _Data.isValidDomain)(xDomain, xDataType);

      const isYDone = () => (0, _Data.isValidDomain)(yDomain, yDataType);

      const isDone = () => isXDone() && isYDone(); // short-circuit if all domains provided


      if (isDone()) return {
        xDomain,
        yDomain
      }; // if Component provides a custom static getScaleType method
      // use it to determine remaining scale types

      if (_lodash.default.isFunction(Component.getDomain)) {
        const {
          xDomain: componentXDomain,
          yDomain: componentYDomain
        } = Component.getDomain(_objectSpread({}, props, {
          xScaleType,
          yScaleType
        }));
        if (!isXDone() && componentXDomain && !(0, _Data.isValidDomain)(componentXDomain, xDataType)) console.warn("Component.getDomain returned an invalid domain for data type '".concat(xDataType, "': ").concat(componentXDomain, " - ignoring"));
        if (!isXDone() && (0, _Data.isValidDomain)(componentXDomain, xDataType)) xDomain = componentXDomain;
        if (!isYDone() && componentYDomain && !(0, _Data.isValidDomain)(componentYDomain, yDataType)) console.warn("Component.getDomain returned an invalid domain for data type '".concat(yDataType, "': ").concat(componentYDomain, " - ignoring"));
        if (!isYDone() && (0, _Data.isValidDomain)(componentYDomain, yDataType)) yDomain = componentYDomain;
      } // if Component has data or datasets props,
      // use the default domainFromDatasets function to determine a domain from them


      if (!isDone() && (_lodash.default.isArray(props.data) || _lodash.default.isArray(props.datasets))) {
        const datasets = _lodash.default.isArray(props.datasets) ? props.datasets : [props.data];

        if (!isXDone()) {
          xDomain = (0, _Data.domainFromDatasets)(datasets, (0, _Data.makeAccessor2)(props.x), xDataType);
        }

        if (!isYDone()) {
          yDomain = (0, _Data.domainFromDatasets)(datasets, (0, _Data.makeAccessor2)(props.y), yDataType);
        }
      } // if Component has children,
      // recurse through descendants to resolve their domains the same way,
      // and combine them into a single domain, if there are multiple


      if (!isDone() && _react.default.Children.count(props.children)) {
        let childrenDomains = mapOverChildren(props.children, this._resolveDomain.bind(this), xScaleType, yScaleType);

        if (!isXDone()) {
          const childXDomains = _lodash.default.compact(childrenDomains.map(childDomains => childDomains.xDomain));

          xDomain = (0, _Data.combineDomains)(childXDomains, xDataType);
        }

        if (!isYDone()) {
          const childYDomains = _lodash.default.compact(childrenDomains.map(childDomains => childDomains.yDomain));

          yDomain = (0, _Data.combineDomains)(childYDomains, yDataType);
        }
      }

      if (isDone()) {
        if (includeXZero && !_lodash.default.inRange(0, ...xDomain)) {
          // If both are negative set max of domain to 0
          if (xDomain[0] < 0 && xDomain[1] < 0) {
            xDomain[1] = 0;
          } else {
            xDomain[0] = 0;
          }
        }

        if (includeYZero && !_lodash.default.inRange(0, ...yDomain)) {
          // If both are negative set max of domain to 0
          if (yDomain[0] < 0 && yDomain[1] < 0) {
            yDomain[1] = 0;
          } else {
            yDomain[0] = 0;
          }
        }
      } // TODO handle resolveXYScales not calculating the domain
      // Because this is recursive on its children it will log this warn for children missing domain
      // even though it is later inferred by parent later during the recursion
      // if (!isDone()) {
      //   console.warn(`resolveXYScales was unable to resolve both domains. xDomain: ${xDomain}, yDomain: ${yDomain}`);
      // }


      return {
        xDomain,
        yDomain
      };
    }

    _resolveTickDomain(props, Component, {
      xScaleType,
      yScaleType,
      xDomain,
      yDomain,
      xScale,
      yScale
    }) {
      if (_lodash.default.isFunction(Component.getTickDomain)) {
        const componentTickDomains = Component.getTickDomain(_objectSpread({
          xScaleType,
          yScaleType,
          xDomain,
          yDomain,
          xScale,
          yScale
        }, props));
        return omitNullUndefined(componentTickDomains);
      }

      if (_react.default.Children.count(props.children)) {
        let childrenTickDomains = mapOverChildren(props.children, this._resolveTickDomain.bind(this), {
          xScaleType,
          yScaleType,
          xDomain,
          yDomain,
          xScale,
          yScale
        });

        const childrenXTickDomains = _lodash.default.compact(childrenTickDomains.map(childTickDomains => childTickDomains.xTickDomain));

        const xTickDomain = childrenXTickDomains.length ? (0, _Data.combineDomains)(childrenXTickDomains, (0, _Scale.dataTypeFromScaleType)(xScaleType)) : undefined;

        const childrenYTickDomains = _lodash.default.compact(childrenTickDomains.map(childTickDomains => childTickDomains.yTickDomain));

        const yTickDomain = childrenYTickDomains.length ? (0, _Data.combineDomains)(childrenYTickDomains, (0, _Scale.dataTypeFromScaleType)(yScaleType)) : undefined;
        return omitNullUndefined({
          xTickDomain,
          yTickDomain
        });
      }

      return {};
    }

    _resolveMargin(props, Component, {
      xScaleType,
      yScaleType,
      xDomain,
      yDomain,
      xScale,
      yScale
    }) {
      let {
        marginTop,
        marginBottom,
        marginLeft,
        marginRight
      } = props;

      const isDone = () => _lodash.default.every([marginTop, marginBottom, marginLeft, marginRight], _lodash.default.isNumber); // short-circuit if all margins provided


      if (isDone()) return {
        marginTop,
        marginBottom,
        marginLeft,
        marginRight
      }; // if Component provides a custom static getMargin method
      // use it to determine remaining domains

      if (_lodash.default.isFunction(Component.getMargin)) {
        const componentMargin = omitNullUndefined(Component.getMargin(_objectSpread({}, props, {
          xScaleType,
          yScaleType,
          xDomain,
          yDomain,
          xScale,
          yScale
        })));
        ({
          marginTop,
          marginBottom,
          marginLeft,
          marginRight
        } = _lodash.default.assign(componentMargin, omitNullUndefined({
          marginTop,
          marginBottom,
          marginLeft,
          marginRight
        })));
        if (isDone()) return {
          marginTop,
          marginBottom,
          marginLeft,
          marginRight
        };
      } // if Component has children,
      // recurse through descendants to resolve their margins the same way,
      // and combine them into a single margin, if there are multiple


      if (_react.default.Children.count(props.children)) {
        let childrenMargins = mapOverChildren(props.children, this._resolveMargin.bind(this), {
          xScaleType,
          yScaleType,
          xDomain,
          yDomain,
          xScale,
          yScale
        }); // console.log('combining child margins', childMargins);

        const childrenMargin = (0, _Data.combineBorderObjects)(childrenMargins.map(childMargins => ({
          top: childMargins.marginTop,
          bottom: childMargins.marginBottom,
          left: childMargins.marginLeft,
          right: childMargins.marginRight
        })));
        marginTop = _lodash.default.isUndefined(marginTop) ? childrenMargin.top : marginTop;
        marginBottom = _lodash.default.isUndefined(marginBottom) ? childrenMargin.bottom : marginBottom;
        marginLeft = _lodash.default.isUndefined(marginLeft) ? childrenMargin.left : marginLeft;
        marginRight = _lodash.default.isUndefined(marginRight) ? childrenMargin.right : marginRight;
      }

      return {
        marginTop,
        marginBottom,
        marginLeft,
        marginRight
      };
    }

    _resolveSpacing(props, Component, {
      xScaleType,
      yScaleType,
      xDomain,
      yDomain,
      xScale,
      yScale
    }) {
      let {
        spacingTop,
        spacingBottom,
        spacingLeft,
        spacingRight
      } = props;

      const isDone = () => _lodash.default.every([spacingTop, spacingBottom, spacingLeft, spacingRight], _lodash.default.isNumber); // short-circuit if all spacing provided


      if (isDone()) return {
        spacingTop,
        spacingBottom,
        spacingLeft,
        spacingRight
      }; // if Component provides a custom static getSpacing method
      // use it to determine remaining domains

      if (_lodash.default.isFunction(Component.getSpacing)) {
        const componentSpacing = omitNullUndefined(Component.getSpacing(_objectSpread({}, props, {
          xScaleType,
          yScaleType,
          xDomain,
          yDomain,
          xScale,
          yScale
        })));
        ({
          spacingTop,
          spacingBottom,
          spacingLeft,
          spacingRight
        } = _lodash.default.assign(componentSpacing, omitNullUndefined({
          spacingTop,
          spacingBottom,
          spacingLeft,
          spacingRight
        })));
        if (isDone()) return {
          spacingTop,
          spacingBottom,
          spacingLeft,
          spacingRight
        };
      } // if Component has children,
      // recurse through descendants to resolve their spacings the same way,
      // and combine them into a single spacing, if there are multiple


      if (_react.default.Children.count(props.children)) {
        let childrenSpacings = mapOverChildren(props.children, this._resolveSpacing.bind(this), {
          xScaleType,
          yScaleType,
          xDomain,
          yDomain,
          xScale,
          yScale
        });
        const childrenSpacing = (0, _Data.combineBorderObjects)(childrenSpacings.map(childSpacing => ({
          top: childSpacing.spacingTop,
          bottom: childSpacing.spacingBottom,
          left: childSpacing.spacingLeft,
          right: childSpacing.spacingRight
        })));
        spacingTop = _lodash.default.isUndefined(spacingTop) ? childrenSpacing.top : spacingTop;
        spacingBottom = _lodash.default.isUndefined(spacingBottom) ? childrenSpacing.bottom : spacingBottom;
        spacingLeft = _lodash.default.isUndefined(spacingLeft) ? childrenSpacing.left : spacingLeft;
        spacingRight = _lodash.default.isUndefined(spacingRight) ? childrenSpacing.right : spacingRight;
      }

      if (isDone()) return {
        spacingTop,
        spacingBottom,
        spacingLeft,
        spacingRight
      };
    }

    render() {
      const {
        props
      } = this;
      const {
        width,
        height,
        invertXScale,
        invertYScale
      } = props; // scales not provided, so we have to resolve them
      // first resolve scale types and domains
      // const scaleType = this._resolveScaleType(props, ComposedComponent);

      const {
        xScaleType,
        yScaleType
      } = this._resolveScaleType(props, ComposedComponent); // const domain = this._resolveDomain(props, ComposedComponent, scaleType);


      let {
        xDomain,
        yDomain
      } = this._resolveDomain(props, ComposedComponent, xScaleType, yScaleType);

      if (invertXScale) xDomain = xDomain.slice().reverse();
      if (invertYScale) yDomain = yDomain.slice().reverse(); // create a temporary scale with size & domain, which may be used by the Component to calculate margin/tickDomain
      // (eg. to create and measure labels for the scales)
      // let tempScale = this._makeScales(scaleOptions);

      let scaleOptions = {
        width,
        height,
        xScaleType,
        yScaleType,
        xDomain,
        yDomain,
        invertXScale,
        invertYScale,
        scaleX: props.scaleX,
        scaleY: props.scaleY,
        marginTop: props.marginTop,
        marginBottom: props.marginBottom,
        marginLeft: props.marginLeft,
        marginRight: props.marginRight,
        spacingTop: props.spacingTop,
        spacingBottom: props.spacingBottom,
        spacingLeft: props.spacingLeft,
        spacingRight: props.spacingRight,
        xScale: props.xScale,
        yScale: props.yScale
      }; // create a temporary scale with size & domain, which may be used by the Component to calculate margin/tickDomain
      // (eg. to create and measure labels for the scales)

      let tempScale = this._makeScales(scaleOptions);

      let {
        xScale: tempXScale,
        yScale: tempYScale
      } = tempScale; // getTickDomain gives children the opportunity to modify the domain to include their scale ticks
      // (can't happen in getDomain, because it can't be done until the base domain/tempScale has been created)
      // nice-ing happens in the getTickDomain function inside of _resolveTickDomain

      const {
        xTickDomain,
        yTickDomain
      } = this._resolveTickDomain(props, ComposedComponent, {
        xScaleType,
        yScaleType,
        xDomain,
        yDomain,
        xScale: tempXScale,
        yScale: tempYScale
      });

      if ((0, _Data.isValidDomain)(xTickDomain, (0, _Scale.dataTypeFromScaleType)(xScaleType))) {
        xDomain = (0, _Data.combineDomains)([xDomain, xTickDomain], (0, _Scale.dataTypeFromScaleType)(xScaleType));
      }

      if ((0, _Data.isValidDomain)(yTickDomain, (0, _Scale.dataTypeFromScaleType)(yScaleType))) {
        yDomain = (0, _Data.combineDomains)([yDomain, yTickDomain], (0, _Scale.dataTypeFromScaleType)(yScaleType));
      } // update tempScale to use new domain before creating margins


      scaleOptions = _objectSpread({}, scaleOptions, {
        xDomain,
        yDomain
      });
      tempScale = this._makeScales(scaleOptions); // then resolve the margins

      const {
        marginTop,
        marginBottom,
        marginLeft,
        marginRight
      } = _lodash.default.defaults(this._resolveMargin(props, ComposedComponent, {
        xScaleType,
        yScaleType,
        xDomain,
        yDomain,
        xScale: tempScale.xScale,
        yScale: tempScale.yScale
      }), {
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0
      });

      const {
        spacingTop,
        spacingBottom,
        spacingLeft,
        spacingRight
      } = _lodash.default.defaults(this._resolveSpacing(props, ComposedComponent, {
        xScaleType,
        yScaleType,
        xDomain,
        yDomain,
        xScale: tempScale.xScale,
        yScale: tempScale.yScale
      }), {
        spacingTop: 0,
        spacingBottom: 0,
        spacingLeft: 0,
        spacingRight: 0
      }); // create real scales from resolved margins


      scaleOptions = _objectSpread({}, scaleOptions, {
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        spacingTop,
        spacingBottom,
        spacingLeft,
        spacingRight
      });

      const {
        xScale,
        yScale
      } = this._makeScales(scaleOptions);

      const passedProps = _lodash.default.assign({}, this.props, {
        xScale,
        yScale,
        xDomain,
        yDomain,
        xScaleType,
        yScaleType,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        spacingTop,
        spacingBottom,
        spacingLeft,
        spacingRight
      });

      return _react.default.createElement(ComposedComponent, passedProps); // todo throw if cannot resolve scaleType
      // todo throw if cannot resolve domain
      // todo check to make sure margins didn't change after scales resolved?
    }

  }, _defineProperty(_class, "getScaleType", ComposedComponent.getScaleType), _defineProperty(_class, "getSpacing", ComposedComponent.getSpacing), _defineProperty(_class, "getDomain", ComposedComponent.getDomain), _defineProperty(_class, "getMargin", ComposedComponent.getMargin), _defineProperty(_class, "defaultProps", ComposedComponent.defaultProps), _temp;
}
//# sourceMappingURL=resolveXYScales.js.map