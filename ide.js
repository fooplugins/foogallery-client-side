// This file contains any definitions that my IDE (PhpStorm 2017.1.1) was failing to pick up correctly resulting in warnings/errors being displayed.
/**
 * @summary The jQuery.Event object.
 * @typedef {object} jQuery.Event
 * @property {Element} currentTarget - The current DOM element within the event bubbling phase.
 * @property {object} data - An optional object of data passed to an event method when the current executing handler is bound.
 * @property {Element} delegateTarget - The element where the currently-called jQuery event handler was attached.
 * @property {function} isDefaultPrevented - Returns whether `event.preventDefault()` was ever called on this event object.
 * @property {function} isImmediatePropagationStopped - Returns whether `event.stopImmediatePropagation()` was ever called on this event object.
 * @property {function} isPropagationStopped - Returns whether `event.stopPropagation()` was ever called on this event object.
 * @property {boolean} metaKey - Indicates whether the META key was pressed when the event fired.
 * @property {string} namespace - The namespace specified when the event was triggered.
 * @property {number} pageX - The mouse position relative to the left edge of the document.
 * @property {number} pageY - The mouse position relative to the top edge of the document.
 * @property {function} preventDefault - If this method is called, the default action of the event will not be triggered.
 * @property {*} result - The last value returned by an event handler that was triggered by this event, unless the value was undefined.
 * @property {function} stopImmediatePropagation - Keeps the rest of the handlers from being executed and prevents the event from bubbling up the DOM tree.
 * @property {function} stopPropagation - Prevents the event from bubbling up the DOM tree, preventing any parent handlers from being notified of the event.
 * @property {Element} target - The DOM element that initiated the event.
 * @property {number} timeStamp - The difference in milliseconds between the time the browser created the event and January 1, 1970.
 * @property {string} type - Describes the nature of the event.
 * @property {number} which - For key or mouse events, this property indicates the specific key or button that was pressed.
 * @see {@link https://api.jquery.com/category/events/event-object/|Event Object | jQuery API Documentation}
 */

/**
 * @summary The HTMLImageElement.onerror callback.
 * @typedef {HTMLImageElement} HTMLImageElement
 * @property {function} onerror
 */

/**
 * @summary The window.devicePixelRatio property.
 * @typedef {window} window
 * @property {number} devicePixelRatio
 */

/**
 * @summary The jQuery.fn namespace.
 * @typedef {jQuery} jQuery
 * @property {object} fn
 */

/**
 * @summary The jQuery.extend function.
 * @typedef {jQuery} jQuery
 * @property {function} extend
 */