
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
