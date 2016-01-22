/*
 * Polyfills for:
 *  - Adding classes
 *  - Transforming elements
 */
const poly = {
  addClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ` ${className}`;
    }
  },
  removeClass(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  },
  transform(el, transform) {
    el.style.webkitTransform = transform;
    el.style.MozTransform = transform;
    el.style.msTransform = transform;
    el.style.transform = transform;
  }
};
export default poly;
