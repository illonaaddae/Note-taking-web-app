/**
 * Utils Module
 * Shared utility functions across the app
 */

/**
 * DOM Helper - Get element by selector type
 * @param {string} selectorName - The ID, class name, or tag name
 * @param {string} type - "id", "class", or "tag"
 * @returns {HTMLElement|HTMLCollection|null}
 */
export function getDocument(selectorName, type) {
  switch (type) {
    case "id":
      return document.getElementById(selectorName);
    case "class":
      return document.getElementsByClassName(selectorName);
    case "tag":
      return document.getElementsByTagName(selectorName);
    case "query":
      return document.querySelector(selectorName);
    case "queryAll":
      return document.querySelectorAll(selectorName);
    default:
      return null;
  }
}
