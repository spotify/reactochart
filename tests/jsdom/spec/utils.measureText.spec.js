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
import { expect } from 'chai';
import measureText from '../../../src/utils/measureText';

class MockCtx {
  measureText() {
    return { width: 42 };
  }
}

class MockCanvas {
  getContext() {
    return new MockCtx();
  }
}

describe('measure-text', () => {
  it(`should measure a single line of text provided a
      px font size and a unitless line height`, () => {
    const measurement = measureText({
      text: 'The quick brown fox jumps over the lazy dog',
      fontFamily: 'Helvetica Neue',
      fontSize: '24px',
      lineHeight: '1.2',
      fontWeight: 400,
      fontStyle: 'normal',
      canvas: new MockCanvas(),
    });

    expect(measurement).to.have.deep.nested.property('width.value', 42);
    expect(measurement).to.have.deep.nested.property('height.value', 24 * 1.2);
    expect(measurement).to.have.deep.nested.property('width.unit', 'px');
    expect(measurement).to.have.deep.nested.property('height.unit', 'px');
  });

  it(`should measure multiline text provided a
      px font size and a unitless line height`, () => {
    const measurement = measureText({
      text: [
        'The quick brown fox jumps over the lazy dog',
        'The lazy fox jumps over the quick brown dog',
        'The dog jumps over the quick, lazy brown fox',
      ],
      fontFamily: 'Helvetica Neue',
      fontSize: '24px',
      lineHeight: '1.2',
      fontWeight: 'bold',
      fontStyle: 'italic',
      canvas: new MockCanvas(),
    });
    expect(measurement).to.have.deep.nested.property('width.value', 42);
    expect(measurement).to.have.deep.nested.property(
      'height.value',
      24 * 1.2 * 3,
    );
    expect(measurement).to.have.deep.nested.property('width.unit', 'px');
    expect(measurement).to.have.deep.nested.property('height.unit', 'px');
  });

  it(`should calculate height when provided a
      em font size and a unitless line height`, () => {
    const measurement = measureText({
      text: 'The quick brown fox jumps over the lazy dog',
      fontFamily: 'Georgia',
      fontSize: '2em',
      lineHeight: 1.3,
      fontWeight: 700,
      fontStyle: 'italic',
      canvas: new MockCanvas(),
    });

    expect(measurement).to.have.deep.nested.property('height.value', 2 * 1.3);
    expect(measurement).to.have.deep.nested.property('height.unit', 'em');
  });

  it(`should calculate height when provided a
      line height with units`, () => {
    const measurement = measureText({
      text: 'The quick brown fox jumps over the lazy dog',
      fontFamily: 'Georgia',
      fontSize: '30px',
      lineHeight: '40px',
      fontWeight: 400,
      fontStyle: 'normal',
      canvas: new MockCanvas(),
    });

    expect(measurement).to.have.deep.nested.property('height.value', 40);
    expect(measurement).to.have.deep.nested.property('height.unit', 'px');
  });
});
