import "jest-canvas-mock";

// see https://github.com/airbnb/enzyme/blob/master/docs/guides/jsdom.md
const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
});
const { window } = jsdom;

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
global.requestAnimationFrame = function(callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function(id) {
  clearTimeout(id);
};
copyProps(window, global);

// hack to deal with https://github.com/airbnb/enzyme/issues/888
// see also https://github.com/chaijs/type-detect/issues/98
global.HTMLElement = window.HTMLElement;
global.SVGElement = function() {};

const enzyme = require('enzyme');
const adapter = require('enzyme-adapter-react-16');

enzyme.configure({ adapter: new adapter() });
