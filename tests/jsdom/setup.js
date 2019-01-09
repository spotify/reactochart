// see https://github.com/airbnb/enzyme/blob/master/docs/guides/jsdom.md

const jsdom = require("jsdom").jsdom;
const exposedProperties = ["window", "navigator", "document"];

global.document = jsdom("");
global.window = document.defaultView;
Object.keys(document.defaultView).forEach(property => {
  if (typeof global[property] === "undefined") {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: "node.js"
};

// hack to deal with https://github.com/airbnb/enzyme/issues/888
// see also https://github.com/chaijs/type-detect/issues/98
global.HTMLElement = window.HTMLElement;
global.SVGElement = function() {};

const enzyme = require("enzyme");
const adapter = require("enzyme-adapter-react-16");

enzyme.configure({ adapter: new adapter() });
