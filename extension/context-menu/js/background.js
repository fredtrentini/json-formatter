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

(function () {

    "use strict";

    let FORMAT_JSON_MESSAGE = "formatJson";

    function handleContextMenu(info, tab) {
        chrome.tabs.sendMessage(tab.id, FORMAT_JSON_MESSAGE);
    }

    chrome.contextMenus.create({
        id: FORMAT_JSON_MESSAGE,
        title: "Format json",
        contexts: ["selection", "editable", "page"],
    });

    // Notify content script on content menu action
    chrome.contextMenus.onClicked.addListener(handleContextMenu);
}());
