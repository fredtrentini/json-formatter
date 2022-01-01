// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name context-menu.js
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/chrome_extensions.js
// @js_externs let console = {assert: function(){}};
// @formatting pretty_print
// ==/ClosureCompiler==

/** @license
JSON Formatter | MIT License
Copyright 2012 Callum Locke

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

/*jshint eqeqeq:true, forin:true, strict:true */
/*global chrome, console */

(function() {

	"use strict";
	
    const FORMAT_JSON_MESSAGE = "formatJson";

	// Config
	const INDENT_SIZE = 4;

	/********** Exceptions **********/
	class InvalidJsonException extends Error {
	
	}
	
	/********** Variables **********/
	let isLeftButtonActive = false;
	// Current element being right clicked
	let selectedElement = null;
	// Position of element being right clicked
	let selectedPosition = {x: null, y: null};
	// Current json wrapper being moved
	let currentJsonWrapper = null;
	
	// Map HTML element to child json wrapper element tooltip
	// Map<HTMLElement, HTMLElement>
	const jsonMap = new Map();
	
	// Enum for HTML classes
	const jsonClass = Object.freeze({
		// Json wrapper tooltip
		WRAPPER: "json-formatter__json-wrapper",
		// Json wrapper and all ancestors
		WRAPPER_FAMILY: "json-formatter__json-wrapper-family",
		// Top bar
		TOP_BAR: "json-formatter__top-bar",
		// Inner textarea
		TEXTAREA: "json-formatter__textarea",
		// Moveable element
		MOVEABLE: "json-formatter__moveable",
		// Buttons
		BUTTON: "json-formatter__button",
		// Copy button
		COPY_BUTTON: "json-formatter__copy-button",
		// Close button
		CLOSE_BUTTON: "json-formatter__close-button",
		// Json wrapper containing invalid json
		ERROR: "json-formatter__error",
	})
	
	/********** Functions **********/
	function formatJsonText(text) {
		try {
			return JSON.stringify(JSON.parse(text.replace(/\s/g, "")), null, " ".repeat(INDENT_SIZE));
		}
		catch {
			throw new InvalidJsonException;
		}
	}
	
	function moveElement(event) {
		if (!isLeftButtonActive) {
			return;
		}
		
		let jsonWrapper = currentJsonWrapper;
		let left = jsonWrapper.offsetLeft;
		let top = jsonWrapper.offsetTop;
		let x = event.pageX;
		let y = event.pageY;
		
		// Previous values
		let previousX = Number(jsonWrapper.getAttribute("x"));
		let previousY = Number(jsonWrapper.getAttribute("y"));
		
		// Updated values
		jsonWrapper.style.left = `${left + (x - previousX)}px`;
		jsonWrapper.style.top = `${top + (y - previousY)}px`;
		
		jsonWrapper.setAttribute("x", x);
		jsonWrapper.setAttribute("y", y);
	}
		
	function addMoveButtonEvent(event) {
		// Prevent child elements from being moveable
		if (!event.target.classList.contains(jsonClass.MOVEABLE)) {
			return;
		}
		
		let jsonWrapper = this.parentElement;
		jsonWrapper.setAttribute("x", event.pageX);
		jsonWrapper.setAttribute("y", event.pageY);
		currentJsonWrapper = jsonWrapper;
		document.addEventListener("mousemove", moveElement);
	}
		
	function removeMoveButtonEvent(event) {
		document.removeEventListener("mousemove", moveElement);
		currentJsonWrapper = null;
	}
	
	function copyTextToClipboard(text) {
		try {
			let json = formatJsonText(text);
			navigator.clipboard.writeText(json);
		}
		catch (e) {
			if (e instanceof InvalidJsonException) {                    
				navigator.clipboard.writeText(text);
			}
			else {
				throw e;
			}
		}
	}
	
	function removeJsonWrapperElement(jsonWrapperElement) {
		let origin = jsonWrapperElement.origin;
		jsonMap.delete(origin);
		jsonWrapperElement.parentElement.removeChild(jsonWrapperElement);
	}
	
	// Create or update json wrapper
	function handleJsonWrapperElement(text, originElement) {
		let jsonWrapperElement;
		let topBarElement;
		let copyButtonElement;
		let closeButtonElement;
		let textareaElement;
	
		if (jsonMap.has(originElement)) {
			jsonWrapperElement = jsonMap.get(originElement);
			topBarElement = jsonWrapperElement.querySelector(`div.${jsonClass.TOP_BAR}`);
			copyButtonElement = jsonWrapperElement.querySelector(`button.${jsonClass.COPY_BUTTON}`);
			closeButtonElement = jsonWrapperElement.querySelector(`button.${jsonClass.CLOSE_BUTTON}`);
			textareaElement = jsonWrapperElement.querySelector(`textarea.${jsonClass.TEXTAREA}`);
		}
		else {
			// Create json wrapper
			jsonWrapperElement = document.createElement("div");
			jsonWrapperElement.classList.add(jsonClass.WRAPPER_FAMILY, jsonClass.WRAPPER);
			jsonWrapperElement.style.left = `${selectedPosition.x}px`;
			jsonWrapperElement.style.top = `${selectedPosition.y}px`;
			jsonWrapperElement.origin = originElement; // Element from which json wrapper was created
			document.body.appendChild(jsonWrapperElement);
			
			// Create move element
			topBarElement = document.createElement("div");
			topBarElement.classList.add(jsonClass.WRAPPER_FAMILY, jsonClass.TOP_BAR, jsonClass.MOVEABLE);
			topBarElement.addEventListener("mousedown", addMoveButtonEvent);
			topBarElement.addEventListener("mouseup", removeMoveButtonEvent);
			jsonWrapperElement.appendChild(topBarElement);
	
			// Create copy button
			copyButtonElement = document.createElement("button");
			copyButtonElement.classList.add(jsonClass.WRAPPER_FAMILY, jsonClass.BUTTON, jsonClass.COPY_BUTTON, "fa", "fa-clone");
			copyButtonElement.addEventListener("click", () => copyTextToClipboard(text));
			
			// Create close button
			closeButtonElement = document.createElement("button");
			closeButtonElement.classList.add(jsonClass.WRAPPER_FAMILY, jsonClass.BUTTON, jsonClass.CLOSE_BUTTON);
			closeButtonElement.addEventListener("click", () => removeJsonWrapperElement(jsonWrapperElement));
	
			// Append buttons
			topBarElement.appendChild(closeButtonElement);
			topBarElement.appendChild(copyButtonElement);
	
			// Create inner textarea
			textareaElement = document.createElement("textarea");
			textareaElement.rows = 8;
			textareaElement.cols = 20;
			textareaElement.classList.add(jsonClass.WRAPPER_FAMILY, jsonClass.TEXTAREA);
			jsonWrapperElement.appendChild(textareaElement);
	
			// Store json wrapper
			jsonMap.set(originElement, jsonWrapperElement);
		}
	
		// Update element
		if (text != null) {
			try {
				textareaElement.value = formatJsonText(text);
				jsonWrapperElement.classList.remove(jsonClass.ERROR);
			} catch (e) {
				if (e instanceof InvalidJsonException) {
					textareaElement.value = text;
					jsonWrapperElement.classList.add(jsonClass.ERROR);
				}
				else {
					throw e;
				}
			}
		}
	
		return jsonWrapperElement;
	}
	
	function handleContextMenu(element) {
		element = element || document.body;
		
		// Ignore json wrapper related elements
		if (element.classList.contains(jsonClass.WRAPPER_FAMILY)) {
			return;
		}
		
		let selection = getSelection().toString();
		let text = selection || element.value || element.innerText;
		
		// Ignore empty elements
		if (!text) {
			return;
		}
		
		handleJsonWrapperElement(text, element);
	}

	function handleMessage(message, sender, {info}) {
		switch (message) {
			case FORMAT_JSON_MESSAGE:
				handleContextMenu(selectedElement);
				break;
			default:
				console.warn("Received unknown message: ", message);
		}
	}
	
	/********** Events **********/
	document.addEventListener("mousedown", (event) => {
		isLeftButtonActive = true;
	});
	
	document.addEventListener("mouseup", (event) => {
		isLeftButtonActive = false;
	});
	
	document.addEventListener("contextmenu", (event) => {
		selectedElement = event.target;
		selectedPosition = {x: event.pageX, y: event.pageY};
	});

	// Handle incoming message
	chrome.runtime.onMessage.addListener(handleMessage);
}());

// Fullscreen mode
// Icons: copy | fullscreen | re-evaluate json | close
// Options: fixed [default] / relative