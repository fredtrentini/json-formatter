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

	// Config
	const indentSize = 4;
    const FORMAT_JSON_MESSAGE = "formatJson";
	let selectedElement = null;

	class InvalidJsonException extends Error {

	}

	function formatJsonText(text) {
		try {
			return JSON.stringify(JSON.parse(text), null, " ".repeat(indentSize));
		}
		catch {
			throw new InvalidJsonException;
		}
	}

	function formatJson() {
		// Format selected text if exists, else element value/innerText
		let selection = document.getSelection();
		let selectedText = selection.toString();
		let text = selectedText || selectedElement.value || selectedElement.innerText;
		let jsonText = formatJsonText(text);
		// TODO: Add tooltip rather than changing existing HTML

		// // Handle input elements (input, textarea, ...)
		// if (selectedElement.value) {
		// 	let previousText = selectedElement.value.slice(0, selectedElement.selectionStart);
		// 	let afterText = selectedElement.value.slice(selectedElement.selectionEnd);
		// 	selectedElement.value = previousText + jsonText + afterText;
		// }
		// // Handle non-input elements (div, span, ...)
		// else if (selectedElement.innerText) {
		// 	if (selectedText) {
		// 		let range = selection.getRangeAt(0);
		// 		range.deleteContents();
		// 		range.insertNode(document.createTextNode(jsonText));
		// 	}
		// 	else {
		// 		selectedElement.innerText = jsonText;
		// 	}
		// }
	}

	function handleJsonMessage() {
		try {
			formatJson();
		}
		catch (e) {
			if (e instanceof InvalidJsonException) {
				
			}
			else {
				throw e;
			}
		}
	}

	function handleMessage(message, sender, {info}) {
		switch (message) {
			case FORMAT_JSON_MESSAGE:
				return handleJsonMessage(info);
			default:
				console.warn("Received unknown message: ", message);
		}
	}

	// Handle incoming message
	chrome.runtime.onMessage.addListener(handleMessage);
	
	// Update currently selected element
	document.oncontextmenu = (e) => {
		selectedElement = e.target || document.body;
	}
}());
