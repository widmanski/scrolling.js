/*
 * Polyfills for:
 *  - Adding classes
 *  - Transforming elements
 */

const poly = {
  addClass(el, className) {
    const element = el;

    if (element.classList) {
      element.classList.add(className);
    } else {
      element.className += ` ${className}`;
    }
  },
  removeClass(el, className) {
    const element = el;

    if (element.classList) {
      element.classList.remove(className);
    } else {
      element.className = el.className.replace(new RegExp(
        '(^|\\b)' + // eslint-disable-line prefer-template
        className.split(' ').join('|') +
        '(\\b|$)', 'gi'
      ), ' ');
    }
  },
  transform(el, transform) {
    const element = el;
    element.style.webkitTransform = transform;
    element.style.MozTransform = transform;
    element.style.msTransform = transform;
    element.style.transform = transform;
  }
};

export default poly;
