"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _unitsCss = _interopRequireDefault(require("units-css"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Formidable
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/* eslint-env browser */
const DEFAULT_CANVAS = document.createElement("canvas");
const DEFAULT_FONT_WEIGHT = 400;
const DEFAULT_FONT_STYLE = "normal";

const measureHeight = (size, lineHeight) => {
  // If the line-height is unitless,
  // multiply it by the font size.
  if (!lineHeight.unit) {
    return _unitsCss.default.parse("".concat(size.value * lineHeight.value).concat(size.unit));
  } // units-css requires the user to provide
  // DOM nodes for these units. We don't want
  // to pollute our API with that for the time being.


  const unitBlacklist = ["%", "ch", "cm", "em", "ex"];

  if (unitBlacklist.indexOf(lineHeight.unit) !== -1) {
    // eslint-disable-line no-magic-numbers
    throw new Error("We do not currently support the unit ".concat(lineHeight.unit, "\n      from the provided line-height ").concat(lineHeight.value, ".\n      Unsupported units include ").concat(unitBlacklist.join(", "), "."));
  } // Otherwise, the height is equivalent
  // to the provided line height.
  // Non-px units need conversion.


  if (lineHeight.unit === "px") {
    return lineHeight;
  }

  return _unitsCss.default.parse(_unitsCss.default.convert(lineHeight, "px"));
};

const measureText = ({
  text,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight = DEFAULT_FONT_WEIGHT,
  fontStyle = DEFAULT_FONT_STYLE,
  canvas = DEFAULT_CANVAS
}) => {
  const ctx = canvas.getContext("2d");
  ctx.font = "".concat(fontWeight, " ").concat(fontStyle, " ").concat(fontSize, " ").concat(fontFamily);

  const measure = line => {
    return {
      text: line,
      width: _unitsCss.default.parse("".concat(ctx.measureText(line).width, "px")),
      height: measureHeight(_unitsCss.default.parse(fontSize), _unitsCss.default.parse(lineHeight))
    };
  }; // If multiline, measure the bounds
  // of all of the lines combined


  if (Array.isArray(text)) {
    return text.map(measure).reduce((prev, curr) => {
      const width = curr.width.value > prev.width.value ? curr.width : prev.width;

      const height = _unitsCss.default.parse("".concat(prev.height.value + curr.height.value).concat(curr.height.unit));

      const longest = curr.text.length > prev.text.length ? curr.text : prev.text;
      return {
        width,
        height,
        text: longest
      };
    });
  }

  return measure(text);
};

var _default = measureText;
exports.default = _default;
//# sourceMappingURL=measureText.js.map