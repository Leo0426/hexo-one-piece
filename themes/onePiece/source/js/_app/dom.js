var domApi = (function(app) {
  var enhanced = new WeakSet();

  function isElementLike(element) {
    return !!element && (element.nodeType === 1 || element.nodeType === 9 || element.nodeType === 11);
  }

  function enhance(element) {
    if (!isElementLike(element) || enhanced.has(element)) {
      return element || null;
    }

    Object.defineProperties(element, {
      createChild: {
        value: function(tag, props, position) {
          return createChild(element, tag, props, position);
        }
      },
      wrap: {
        value: function(props) {
          return wrap(element, props);
        }
      },
      height: {
        value: function(value) {
          return height(element, value);
        }
      },
      width: {
        value: function(value) {
          return width(element, value);
        }
      },
      top: {
        value: function() {
          return top(element);
        }
      },
      left: {
        value: function() {
          return left(element);
        }
      },
      attr: {
        value: function(type, value) {
          return attr(element, type, value);
        }
      },
      insertAfter: {
        value: function(target) {
          return insertAfter(element, target);
        }
      },
      display: {
        value: function(value) {
          return display(element, value);
        }
      },
      child: {
        value: function(selector) {
          return child(element, selector);
        }
      },
      find: {
        value: function(selector) {
          return find(element, selector);
        }
      },
      addClass: {
        value: function(className) {
          return addClass(element, className);
        }
      },
      removeClass: {
        value: function(className) {
          return removeClass(element, className);
        }
      },
      toggleClass: {
        value: function(className, visible) {
          return toggleClass(element, className, visible);
        }
      },
      hasClass: {
        value: function(className) {
          return hasClass(element, className);
        }
      }
    });

    enhanced.add(element);
    return element;
  }

  function applyProperties(element, props) {
    if (!props) {
      return element;
    }

    Object.keys(props).forEach(function(key) {
      if (key === 'style' && props.style && typeof props.style === 'object') {
        Object.assign(element.style, props.style);
        return;
      }

      element[key] = props[key];
    });

    return element;
  }

  function createElement(tag, props) {
    return applyProperties(enhance(document.createElement(tag)), props);
  }

  function select(selector, element) {
    var root = element || document;
    if (selector.indexOf('#') === 0 && root === document) {
      return enhance(document.getElementById(selector.replace('#', '')));
    }

    return enhance(root.querySelector(selector));
  }

  function selectAll(selector, element) {
    return Array.prototype.slice.call((element || document).querySelectorAll(selector)).map(enhance);
  }

  function each(selector, callback, element) {
    return selectAll(selector, element).forEach(callback);
  }

  function createChild(parent, tag, props, position) {
    var childElement = createElement(tag, props);

    switch (position) {
      case 'after':
        insertAfter(parent, childElement);
        break;
      case 'replace':
        parent.innerHTML = '';
        parent.appendChild(childElement);
        break;
      default:
        parent.appendChild(childElement);
        break;
    }

    return childElement;
  }

  function wrap(element, props) {
    var wrapper = createElement('div', props);
    element.parentNode.insertBefore(wrapper, element);
    element.parentNode.removeChild(element);
    wrapper.appendChild(element);
    return wrapper;
  }

  function height(element, value) {
    if (typeof value !== 'undefined') {
      element.style.height = typeof value === 'number' ? value + 'rem' : value;
    }
    return element.getBoundingClientRect().height;
  }

  function width(element, value) {
    if (typeof value !== 'undefined') {
      element.style.width = typeof value === 'number' ? value + 'rem' : value;
    }
    return element.getBoundingClientRect().width;
  }

  function top(element) {
    return element.getBoundingClientRect().top;
  }

  function left(element) {
    return element.getBoundingClientRect().left;
  }

  function attr(element, type, value) {
    if (value === null) {
      element.removeAttribute(type);
      return element;
    }

    if (typeof value !== 'undefined') {
      element.setAttribute(type, value);
      return element;
    }

    return element.getAttribute(type);
  }

  function insertAfter(element, target) {
    var parent = element.parentNode;
    if (parent.lastChild === element) {
      parent.appendChild(target);
    } else {
      parent.insertBefore(target, element.nextSibling);
    }
    return enhance(target);
  }

  function display(element, value) {
    if (typeof value === 'undefined' || value === null) {
      return element.style.display;
    }

    element.style.display = value;
    return element;
  }

  function child(element, selector) {
    return select(selector, element);
  }

  function find(element, selector) {
    return selectAll(selector, element);
  }

  function splitClassNames(className) {
    return String(className || '').split(/\s+/).filter(Boolean);
  }

  function addClass(element, className) {
    splitClassNames(className).forEach(function(name) {
      element.classList.add(name);
    });
    return element;
  }

  function removeClass(element, className) {
    splitClassNames(className).forEach(function(name) {
      element.classList.remove(name);
    });
    return element;
  }

  function toggleClass(element, className, visible) {
    splitClassNames(className).forEach(function(name) {
      if (typeof visible === 'undefined') {
        element.classList.toggle(name);
      } else {
        element.classList.toggle(name, visible);
      }
    });
    return element;
  }

  function hasClass(element, className) {
    return element.classList.contains(className);
  }

  function parent(element) {
    return enhance(element && element.parentNode);
  }

  enhance(document.head);
  enhance(document.body);
  enhance(document.documentElement);

  return {
    $: select,
    all: selectAll,
    each: each,
    enhance: enhance,
    createElement: createElement,
    createChild: createChild,
    wrap: wrap,
    height: height,
    width: width,
    top: top,
    left: left,
    attr: attr,
    insertAfter: insertAfter,
    display: display,
    child: child,
    find: find,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    hasClass: hasClass,
    parent: parent
  };
})(APP);

APP.dom = domApi;
APP.register('dom', domApi);

var $ = domApi.$;
$.all = domApi.all;
$.each = domApi.each;
