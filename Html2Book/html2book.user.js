// ==UserScript==
// @name          Html2Book
// @namespace     http://www.example.com/gmscripts
// @description   Converting HTML page to book file (fb2, epub, etc.)
// @downloadURL   https://github.com/HaronK/Html2Book/raw/master/Html2Book/html2book.user.js
// @updateURL     https://github.com/HaronK/Html2Book/raw/master/Html2Book/html2book.user.js
// @match         http://habrahabr.ru/post/*
// @require       http://github.com/sizzlemctwizzle/GM_config/raw/master/gm_config.js
// @version       0.1.2
// @icon          http://www.example.net/icon.png
// @run-at        document-end
// ==/UserScript==

var config = {
	converters : {
		xslt : {
			script : 'https://github.com/HaronK/Html2Book/raw/master/Html2Book/xslt_converter.js',
			klass : 'XsltConverter',
		},
	},
	savers : {
		fs : {
			script : 'https://github.com/HaronK/Html2Book/raw/master/Html2Book/fs_saver.js',
			klass : 'FsSaver',
		},
		// gdrive : {},
		// dropbox : {},
	},
	sites : {
		'http://habrahabr.ru' : { // site
			'post/\d+' : { // site page
				fb2 : {
					type : 'xslt',
					params : '"https://github.com/HaronK/Html2Book/raw/master/Html2Book/habr/habr2fb2.xsl"',
				},
			},
		},
	},
};

function appendButton(blockClass){
    var h2b_button = document.createElement("button");
    h2b_button.type = "button";
    var h2b_button_text = document.createTextNode("fb2");
    h2b_button.appendChild(h2b_button_text);

    var elem = document.getElementsByClassName(blockClass);
    if (elem.length == 0){
        alert("Cannot find " + blockClass + " element");
        return;
    }
    else
		elem[0].appendChild(h2b_button);
}

(function() {

    appendScriptFile("https://raw.github.com/eligrey/FileSaver.js/master/FileSaver.js");
    appendScriptFile("https://raw.github.com/eligrey/Blob.js/master/Blob.js");
	appendScriptFile("http://ejohn.org/files/htmlparser.js");

    appendButton("title");
    appendButton("content");

})();
