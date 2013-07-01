/********************************************************************************************************************
 * uncle-barany.js
 * https://github.com/coopersemantics/UncleBarany
 * MIT License
 ********************************************************************************************************************/
(function(globals, doc) {
	
	"use strict";
	
	/* jshint laxcomma : true */
	
	var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g
	
		, match = {
			ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/
			, CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/
			, ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/
			, TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/
			, COMBINATOR: /^[>~+]$/
			, HTML: /innerHTML|innerhtml|HTML|html/
		}
		
		/**
		 * Clones a RegExp literal and passes it to the constructor RegExp, so a global flag can be passed.
		 * @param {regexp} regex
		 * @returns {regexp}
		 */
		, cloneRegex = function(regex) {
			regex = regex.toString().slice(1, -1);
			
			return (new RegExp(regex, "g"));
		}
		
		/**
		 * Sets an attribute (class) on a DOM element.
		 * @param {htmlelement} elem
		 * @param {string} classList
		 * @returns {htmlelement}
		 */
		, setClass = function(elem, classList) {
			elem.className = classList;
			
			return elem;
		}
		
		/**
		 * Sets an attribute (id) on a DOM element.
		 * @param {htmlelement} elem
		 * @param {string} id
		 * @returns {htmlelement}
		 */
		, setId = function(elem, id) {
			elem.id = id;
			
			return elem;
		}
		
		/**
		 * Sets an attribute (class|id|attr) on a DOM element and/or injects innerHTML into a specific DOM element.
		 * @param {array} parts
		 * @param {number} ind
		 * @returns {htmlelement} 
		 * @todo Set attributes on DOM elements and pull out innerHTML into a separate thing.
		 */
		, setAttr = function(parts, ind) {
			var partsValue = (match.COMBINATOR.test(parts[ind]) ? parts[ind - 1] : parts[ind])
				, typeSelector = partsValue.match(match.TAG)
				, elem = doc.createElement(typeSelector && typeSelector[0] || "div")
				, attrSelector
				, temp;

			if (match.CLASS.exec(partsValue)) {
				elem = setClass(elem, partsValue.match(cloneRegex(match.CLASS)).join(" ").replace(/\./g, ""));
			}
			if (match.ID.exec(partsValue)) {
				elem = setId(elem, partsValue.match(match.ID)[1]);
			}
			if (match.ATTR.exec(partsValue)) {
				attrSelector = partsValue.match(cloneRegex(match.ATTR));

				while ((temp = attrSelector.shift())) {
					if (match.HTML.test(temp.match(match.ATTR)[1])) {
						elem.innerHTML =  temp.match(match.ATTR)[4];

						continue;
					}

					elem.setAttribute(temp.match(match.ATTR)[1], temp.match(match.ATTR)[4]);
				}
			}

			return elem;
		}

		/**
		 * A constructor function which creates a DOM element, and additionally, returns a new constructor function (Init).
		 * @constructor
		 * @param {string} selector
		 * @returns {object}
		 */
		, UncleBarany = function(selector) {
			var parts = []
				, c;

			while ((c = chunker.exec(selector)) !== null) {
				parts.push(c[1]);
			}

			return (new Init(parts));
		}
		
		/**
		 * @constructs UncleBarany
		 * @param {array} parts
		 * @returns {documentfragment}
		 */
		, Init = function(parts) {
			var self = this
				, len = parts.length 
				, elem = doc.createDocumentFragment()
				, clone = elem
				, ind = -1;
			
			self.elem = elem;

			while (ind++, ind < len) {
				appendElement.apply(self, [parts, ind]);
			}

			return clone;
		}
		
		/**
		 * Appends a DOM element.
		 * @param {array} parts
		 * @param {number} ind
		 */
		, appendElement = function(parts, ind) {
			var self = this
				, combinator = match.COMBINATOR.exec(parts[ind]);

			switch(combinator && combinator[0]) {
			case "+" :
			case "~" :
				self.elem.appendChild(createElement(parts, ind, "siblingCombinator"));
				break;
			case ">" :
				parts[ind] = parts[ind - 1];
			default :
				if (!match.COMBINATOR.exec(parts[ind + 1])) {
					self.elem = self.elem.appendChild(createElement(parts, ind, "childCombinator"));
				}
			}
		}
	
		/**
		 * Creates a DOM element.
		 * @param {array} parts
		 * @param {number} ind
		 * @param {string} type
		 * @returns {htmlelement}
		 */
		, createElement = function(parts, ind, type) {
			var elem = null
				, childCombinator = parts[ind]
				, siblingCombinator = parts[ind - 1];
			type = (type === "siblingCombinator" && siblingCombinator || childCombinator);

			if (match.CLASS.exec(type) || match.ID.exec(type) || match.ATTR.exec(type)) {
				elem = setAttr(parts, ind);
			} else {
				elem = doc.createElement(type);
			}

			return elem;
		};
	
	/**
	 * UncleBarany is available to the window scope.
	 * @public
	 */
	globals.UncleBarany = UncleBarany;
	
})(this, document);
