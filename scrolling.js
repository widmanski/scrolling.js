/*
 * Controls the on-scroll animations
 * Allows other modules to add callbacks via public methods
 */
import poly from './poly.js';

let scrolling = (() => {
  window.requestAnimFrame = (() => {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || false;
  })();

  // selectors
  const elementsSelector = '.js-scroll';

  // settings
  let headerHeight = 60;

  // cache
  let cache = [];
  let scrollTop;
  let windowHeight;
  let windowWidth; // eslint-disable-line no-unused-vars
  let elements;

  // states
  let isActive = false;

  // callbacks triggered only when element is in view
  let callbacks = {};

  // callbacks triggered always when the element is on the page
  let alwaysCallbacks = {
    /*
    Example:
    cartBottom: function(elCache, sT) {
      elCache.contentHeight = elCache.contentHeight || $(elCache.el).children().eq(0).outerHeight();
      if ( sT + windowHeight > parseInt(elCache.contentHeight, 10) + parseInt(elCache.top, 10) && !elCache.isFixed ) {
        poly.addClass(elCache.el, 'is-fixed');
        elCache.isFixed = true;
      } else if ( sT + windowHeight <= parseInt(elCache.contentHeight, 10) + parseInt(elCache.top, 10) && elCache.isFixed ) {
        poly.removeClass(elCache.el, 'is-fixed');
        elCache.isFixed = false;
      }
    }
    */
  };

  function indexElements() {
    elements = document.querySelectorAll(elementsSelector);
  }

  // utility function
  function camelToDash(input) {
    return input.replace(/\W+/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
  }

  function addCallback(callbackName, callbackFunction, always = false) {
    if ( always ) {
      alwaysCallbacks[callbackName] = callbackFunction;
    } else {
      callbacks[callbackName] = callbackFunction;
    }
  }

  function saveElementCache(el) {
    let boundingRect = el.getBoundingClientRect();
    let _scrollTop = window.scrollY || window.pageYOffset;
    let callback = (el.getAttribute('data-callback')) ? el.getAttribute('data-callback') || false : false;
    let elementCache = {
      el,
      callback,
      top: boundingRect.top + _scrollTop,
      left: boundingRect.left,
      height: el.offsetHeight
    };
    cache.push(elementCache);
  }

  function buildCache() {
    cache = [];
    Array.prototype.forEach.call(elements, saveElementCache);
  }

  function rebuildCache() {
    indexElements();
    buildCache();
  }

  function triggerElementCallback(elCache, always = false) {
    if ( !elCache.callback ) {
      return;
    }

    if ( always ) {
      if ( elCache.callback in alwaysCallbacks ) {
        // assuming the callback is always a function, not testing --> want it to happen FAST
        alwaysCallbacks[ elCache.callback ](elCache, scrollTop);
      }
    } else if ( elCache.callback in callbacks ) {
      // assuming the callback is always a function, not testing --> want it to happen FAST
      callbacks[ elCache.callback ](elCache, scrollTop);
    }
  }

  function syncStates(elCache, states, oldStates = false) {
    /*
    checks the element's calculated state against its current state
    and applies relevant classes if the state changes
    */
    Object.keys(states).forEach( (key) => {
      let state = states[key];
      let stateDash = camelToDash(key);
      if (!oldStates) {
        if (state) {
          poly.addClass(elCache.el, stateDash);
        } else {
          poly.removeClass(elCache.el, stateDash);
        }
      } else if (state !== elCache.states[key]) {
        if (state) {
          poly.addClass(elCache.el, stateDash);
        } else {
          poly.removeClass(elCache.el, stateDash);
        }
      }
    });
  }

  function renderElement(elCache) {
    let states = {};

    if ( scrollTop + windowHeight > elCache.top && scrollTop <= elCache.top + elCache.height ) {
      states.isInView = true;
      triggerElementCallback(elCache);
    } else {
      states.isInView = false;
    }

    if ( scrollTop + windowHeight / 2 >= elCache.top ) {
      states.isPastHalf = true;
    } else {
      states.isPastHalf = false;
    }

    if ( scrollTop + windowHeight * 0.75 >= elCache.top ) {
      states.isPastQuarter = true;
    } else {
      states.isPastQuarter = false;
    }

    if ( scrollTop + headerHeight >= elCache.top ) {
      states.isPastHeader = true;
    } else {
      states.isPastHeader = false;
    }

    if ( scrollTop >= elCache.top ) {
      states.isPastTop = true;
    } else {
      states.isPastTop = false;
    }

    if ( scrollTop + windowHeight > elCache.top + elCache.height ) {
      states.isPastBottom = true;
    } else {
      states.isPastBottom = false;
    }

    if (elCache.states) {
      syncStates(elCache, states);
    } else {
      syncStates(elCache, states, elCache.states);
    }

    triggerElementCallback(elCache, true);

    // The following mutates the function parameter, but that is an intentional behaviour
    elCache.states = states;
    return elCache;
  }

  function render() {
    scrollTop = window.scrollY || window.pageYOffset;
    cache.map(renderElement);
  }

  function onFrame() {
    if ( !isActive ) {
      return true;
    }
    render();
    window.requestAnimFrame(onFrame);
  }

  function onResize() {
    windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    buildCache();
  }

  function init() {
    isActive = true;
    indexElements();
    // onResize also builds the cache
    onResize();
    onFrame();
    window.addEventListener('resize', onResize);
  }

  function destroy() {
    isActive = false;
    window.removeEventListener('resize', onResize);
    elements = null;
  }

  function getWindowHeight() {
    return windowHeight;
  }

  function getWindowWidth() {
    return windowWidth;
  }

  function setHeaderHeight(height) {
    headerHeight = height;
  }

  return {
    init,
    buildCache,
    rebuildCache,
    addCallback,
    destroy,
    indexElements,
    getWindowHeight,
    getWindowWidth,
    setHeaderHeight
  };
}());
export default scrolling;
