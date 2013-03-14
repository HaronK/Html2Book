// ==UserScript==
// @name          Html2Book
// @namespace     http://www.example.com/gmscripts
// @description   Converting HTML page to book file (fb2, epub, etc.)
// @downloadURL   https://github.com/HaronK/Html2Book/raw/master/Html2Book/html2book.user.js
// @updateURL     https://github.com/HaronK/Html2Book/raw/master/Html2Book/html2book.user.js
// @match         http://habrahabr.ru/post/*
// @require       http://github.com/sizzlemctwizzle/GM_config/raw/master/gm_config.js
// @require       https://github.com/HaronK/Html2Book/raw/master/Html2Book/html2book_utils.js
// @version       0.1.3
// @icon          http://www.example.net/icon.png
// @run-at        document-end
// ==/UserScript==

var Html2BookConfig = {
//    converters : {
//        xslt : {
//            script : 'https://github.com/HaronK/Html2Book/raw/master/Html2Book/xslt_converter.js',
//            klass : 'XsltConverter',
//            imports : [ 'http://ejohn.org/files/htmlparser.js' ],
//        },
//    },
//    savers : {
//        fs : {
//            script : 'https://github.com/HaronK/Html2Book/raw/master/Html2Book/fs_saver.js',
//            klass : 'FsSaver',
//            imports : [ 'https://raw.github.com/eligrey/FileSaver.js/master/FileSaver.js',
//                        'https://raw.github.com/eligrey/Blob.js/master/Blob.js' ],
//        },
//        // gdrive : {script : '', klass : '', imports : []},
//        // dropbox : {script : '', klass : '', imports : []},
//    },
    pages : {
        habr_article : {
            addr : 'http://habrahabr.ru/post/\d+', // page url template
            converters : {
                fb2 : {
                    type : 'xslt',
                    params : '"https://github.com/HaronK/Html2Book/raw/master/Html2Book/habr/habr2fb2.xsl"',
                },
            },
            embed : function(element) // embedding element into the page
            {
                var element2 = element.cloneNode(true);
                embedAfter("title", element);
                embedAfter("content", element2);
            },
        },
    },
};

(function() {

    checkConfig();

    var page = getPageConfig(document.location);
    if (!page)
        return;

    // add default saver imports
    appendImports(Html2BookConfig.savers.fs.imports);

    // add page converters imports and embed buttons
    var page_converters = Html2BookConfig.pages[page].converters;
    for (var converter_name in page_converters)
    {
        var type = page_converters[converter_name].type;
        var converter = Html2BookConfig.converters[type];
        var imports = converter.imports;
        appendImports(imports);

        // generate button and button script
        var element = generateButton(converter_name, converter.klass, page_converters[converter_name].params);
        page_converters[converter_name].embed(element);
    }

})();
