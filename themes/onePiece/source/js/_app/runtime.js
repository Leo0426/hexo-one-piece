var APP = window.__ONEPIECE_APP__ || {};

window.__ONEPIECE_APP__ = APP;

APP.config = CONFIG;
APP.local = LOCAL;
APP.modules = APP.modules || {};
APP.state = Object.assign({
  statics: CONFIG.statics.indexOf('//') > 0 ? CONFIG.statics : CONFIG.root,
  scrollAction: { x: 'undefined', y: 'undefined' },
  diffY: 0,
  originTitle: null,
  titleTime: null,
  siteNavHeight: null,
  headerHightInner: null,
  headerHight: null,
  viewport: {
    height: window.innerHeight,
    width: window.innerWidth
  },
  navigation: {
    localHash: 0,
    localUrl: window.location.href,
    pjax: null
  },
  nowPlaying: null
}, APP.state || {});

APP.register = function(name, value) {
  this.modules[name] = value;
  return value;
};

APP.once = function(element, key, callback) {
  if (!element) {
    return null;
  }

  var attrName = 'data-app-' + key;
  if (element.getAttribute && element.getAttribute(attrName)) {
    return null;
  }

  if (element.setAttribute) {
    element.setAttribute(attrName, 'true');
  }

  return callback(element);
};
