/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * fluid.textNodeParser
     *
     * Parses out the text nodes from a DOM element and its descendants
     *******************************************************************************/

    fluid.defaults("fluid.textNodeParser", {
        gradeNames: ["fluid.component"],
        events: {
            onParsedTextNode: null,
            afterParse: null
        },
        invokers: {
            parse: {
                funcName: "fluid.textNodeParser.parse",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{that}.events.afterParse.fire"]
            },
            hasTextToRead: "fluid.textNodeParser.hasTextToRead",
            isWord: "fluid.textNodeParser.isWord",
            getLang: "fluid.textNodeParser.getLang"
        }
    });

    /**
     * Tests if a string is a word; i.e. it has a value and is not only whitespace.
     * inspired by https://stackoverflow.com/a/2031143
     *
     * @param {String} str - the String to test
     *
     * @return {Boolean} - `true` if a word, `false` otherwise.
     */
    fluid.textNodeParser.isWord = function (str) {
        return fluid.isValue(str) && /\S/.test(str);
    };

    /**
     * Determines if there is text in an element that should be read.
     * Will return false in the following conditions:
     * - elm is falsey (undefined, null, etc.)
     * - elm's offsetHeight is 0 (e.g. display none set on itself or its parent)
     * - elm has no text or only whitespace
     *
     * NOTE: Text added by pseudo elements (e.g. :before, :after) are not considered.
     * NOTE: This method is not supported in IE 11 because innerText returns the text for some hidden elements
     *       that is inconsistent with modern browsers.
     *
     * @param {jQuery|DomElement} elm - either a DOM node or a jQuery element
     *
     * @return {Boolean} - returns true if there is rendered text within the element and false otherwise.
     *                     (See rules above)
     */
    fluid.textNodeParser.hasTextToRead = function (elm) {
        elm = fluid.unwrap(elm);

        return elm &&
               !!elm.offsetHeight &&
               fluid.textNodeParser.isWord(elm.innerText);
    };

    /**
     * Similar to `fluid.textNodeParser.hasTextToRead` except adds the following condition:
     * - elm or its parent has `aria-hidden="true"` set.
     *
     * @param {jQuery|DomElement} elm - either a DOM node or a jQuery element
     *
     * @return {Boolean} - returns true if there is rendered text within the element and false otherwise.
     *                     (See rules above)
     */
    fluid.textNodeParser.hasVisibleText = function (elm) {
        return fluid.textNodeParser.hasTextToRead(elm) && !$(elm).closest("[aria-hidden=\"true\"]").length;
    };

    /**
     * Uses jQuery's `closest` method to find the closest element with a lang attribute, and returns the value.
     *
     * @param {jQuery|DomElement} elm - either a DOM node or a jQuery element
     *
     * @return {String|Undefined} - a valid BCP 47 language code if found, otherwise undefined.
     */
    fluid.textNodeParser.getLang = function (elm) {
        return $(elm).closest("[lang]").attr("lang");
    };

    /**
     * The parsed information of text node, including: the node itself, its specified language, and its index within its
     * parent.
     *
     * @typedef {Object} TextNodeData
     * @property {DomNode} node - The current child node being parsed
     * @property {Integer} childIndex - The index of the child node being parsed relative to its parent
     * @property {String} lang - a valid BCP 47 language code
     */

    /**
     * Recursively parses a DOM element and it's sub elements and fires the `onParsedTextNode` event for each text node
     * found. The event is fired with the text node, language and index of the text node in the list of its parent's
     * child nodes..
     *
     * Note: elements that return `false` to `that.hasTextToRead` are ignored.
     *
     * @param {fluid.textNodeParser} that - the component instance
     * @param {jQuery|DomElement} elm - the DOM node to parse
     * @param {String} lang - a valid BCP 47 language code.
     * @param {Event} afterParseEvent - the event to fire after parsing has completed.
     *
     * @return {TextNodeData[]} the array of parsed elements. Only text nodes for elements that have passed the
     *                          `that.hasTextToRead` check will be included.
     */
    fluid.textNodeParser.parse = function (that, elm, lang, afterParseEvent) {
        elm = fluid.unwrap(elm);
        var parsed = [];

        if (that.hasTextToRead(elm)) {
            var childNodes = elm.childNodes;
            var elementLang = elm.getAttribute("lang") || lang || that.getLang(elm);;

            fluid.each(childNodes, function (childNode, childIndex) {
                if (childNode.nodeType === Node.TEXT_NODE) {
                    var textNodeData = {
                        node: childNode,
                        lang: elementLang,
                        childIndex: childIndex
                    };
                    parsed.push(textNodeData);
                    that.events.onParsedTextNode.fire(textNodeData);
                } else if (childNode.nodeType === Node.ELEMENT_NODE) {
                    parsed = parsed.concat(fluid.textNodeParser.parse(that, childNode, elementLang));
                }
            });
        }

        if (afterParseEvent) {
            afterParseEvent(that, parsed);
        }

        return parsed;
    };

})(jQuery, fluid_3_0_0);
