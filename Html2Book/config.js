
// Config functions

var storage = chrome.storage.sync;

var DefaultConverters = {
    xslt: {
        imports : ['extern/htmlparser.js', 'converters/xslt.js'],
        klass : "XsltConverter",
        mime : 'text/xml;charset=' + document.characterSet,
        formatterFields: ["xsl"],
        pageFormatterFields: ["fileNameRegEx"],
    }
};

var DefaultFormatters = {
    fb2: {
        imports : ['formatters/fb2.js'],
        klass : "Fb2Formatter",
        converter: "xslt",
        xsl: "chrome|../formatters/fb2.xsl",
    }
};

var DefaultSavers = {
    fs: {
        imports : [ 'extern/FileSaver.js', 'savers/fs.js'],
        klass : "FsSaver",
    }
};

var DefaultPages = {
    habr_article: {
        name: 'Habrahabr',
        addr: ['http://habrahabr\\.ru/post/\\d+',
               'http://habrahabr\\.ru/company/\\w+/blog/\\d+'], // pages url template
        formatters: {
            fb2: {
                xsl: 'chrome|../pages/habr2fb2.xsl',
                fileNameRegEx: "//span[@class='post_title']",
                commentsSupported: true,
            },
        },
    },
    samlib_page: {
        name: 'Samizdat',
        addr: ['http://samlib\\.ru/\\w/\\w+/.+?\\.s?html'], // pages url template
        formatters: {
            fb2: {
//                xsl: 'chrome|../pages/samlib2fb2.xsl',
                xslChain: [
                    'chrome|../pages/samizdat/step1.xsl',
                    'chrome|../pages/samizdat/step2.xsl',
                    'chrome|../pages/steps2fb2.xsl'
                ],
                fileNameRegEx: "//title",
            },
        },
    },
    kniganews: {
        name: 'KnigaNews',
        addr: ['http://kniganews\\.org/\\d\\d\\d\\d/\\d\\d/\\d\\d/.+?/'], // pages url template
        formatters: {
            fb2: {
                xsl: 'chrome|../pages/kniganews2fb2.xsl',
                fileNameRegEx: "//h1[@class='entry-title']",
            },
        },
    },
    wikipedia: {
        name: 'Wikipedia',
        addr: ['http://\\w\\w\\.wikipedia\\.org/wiki/'], // pages url template
        formatters: {
            fb2: {
                xsl: 'chrome|../pages/wikipedia2fb2.xsl',
                fileNameRegEx: "//h1[@id='firstHeading']",
            },
        },
    }
};

function Html2BookConfigImpl()
{
    this.converters = {};
    this.formatters = {};
    this.savers = {};
    this.pages = {};

    this.debug = {};
}

Html2BookConfigImpl.prototype = {
    _checkProperty: function(prop, defaultValue)
    {
        return !prop ? defaultValue : prop;
    },

    initDefaultPages: function()
    {
        for (var pageId in DefaultPages)
            this.pages[pageId] = DefaultPages[pageId];
    },

    _checkObjectFields: function(obj, prop, fields, defaultValue)
    {
        if (!obj)
        {
            alert("Object is null"); // TODO: localize
            return;
        }
        if (!obj.hasOwnProperty(prop))
        {
            obj[prop] = {};
        }
        for (var i = 0; i < fields.length; ++i)
        {
            if (!obj[prop].hasOwnProperty(fields[i]))
            {
                obj[prop] = defaultValue;
                return;
            }
        }
    },

    initDefaultConfig: function()
    {
        this.debug.status = this._checkProperty(this.debug.status, false);
//        this.debug.save_xhtml = this._checkProperty(this.debug.save_xhtml, true);
//        this.debug.save_xsl   = this._checkProperty(this.debug.save_xsl,   true);

        // xslt is a default converter
        this._checkObjectFields(this.converters, "xslt", ["klass", "mime"], DefaultConverters.xslt);

        // fb2 is a default formatter
        this._checkObjectFields(this.formatters, "fb2", ["converter", "xsl"], DefaultFormatters.fb2);

        // fs is a default saver
        this._checkObjectFields(this.savers, "fs", ["klass"], DefaultSavers.fs);

        // reset default pages
        for (var pageId in DefaultPages)
        {
            this._checkObjectFields(this.pages, pageId, ["name", "addr", "formatters"], DefaultPages[pageId]);
        }
    },

    _validateMandatoryFields: function(fields, obj, objName)
    {
        for (var i = 0; i < fields.length; ++i)
        {
            if (!obj.hasOwnProperty(fields[i]))
            {
                return {errorMessage: MSG("obj_mandatory_field", [objName, field[i], fields])};
            }
        }
        return {succeed: true};
    },

    _checkConfigConverters: function()
    {
        for (var converterId in this.converters)
        {
            var result = this._validateMandatoryFields(["klass", "mime"], this.converters[converterId], converterId);
            if (!result.succeed)
            {
                alert(result.errorMessage);
                return null;
            }
        }
    },

    _checkConfigFormatters: function()
    {
        for (var formatterId in this.formatters)
        {
            var formatter = this.formatters[formatterId];

            var result = this._validateMandatoryFields(["converter"], formatter, formatterId);
            if (!result.succeed)
            {
                alert(result.errorMessage);
                return null;
            }

            if (!this.converters.hasOwnProperty(formatter.converter))
            {
                alert(MSG("formatter_unknown_converter", [formatterId, formatter.converter]));
                return null;
            }

            // check formatter fields required by converter
            var converter = this.converters[formatter.converter];
            if (converter.formatterFields)
            {
                result = this._validateMandatoryFields(converter.formatterFields, formatter, formatterId);
                if (!result.succeed)
                {
                    alert(result.errorMessage);
                    return null;
                }
            }
        }
    },

    _checkConfigSavers: function()
    {
        for (var saverId in this.savers)
        {
            var result = this._validateMandatoryFields(["klass"], this.savers[saverId], saverId);
            if (!result.succeed)
            {
                alert(result.errorMessage);
                return null;
            }
        }
    },

    _validateConfigPage: function(pageId)
    {
        var page = this.pages[pageId];
        var result = this._validateMandatoryFields(["name", "addr", "formatters"], page, pageId);
        if (!result.succeed)
        {
            alert(result.errorMessage);
            return null;
        }

        for (var formatterId in page.formatters)
        {
            if (!this.formatters.hasOwnProperty(formatterId))
                return {errorMessage: MSG("page_unknown_formatter", [pageId, formatterId])};

            var converter = this.converters[this.formatters[formatterId].converter];
            if (converter.pageFormatterFields)
            {
                result = this._validateMandatoryFields(converter.pageFormatterFields, page.formatters[formatterId],
                        pageId + "." + formatterId);
                if (!result.succeed)
                {
                    alert(result.errorMessage);
                    return null;
                }
            }
        }
        return {succeed: true};
    },

    _checkConfigPages: function()
    {
        for (var pageId in this.pages)
        {
            var result = this._validateConfigPage(pageId);
            if (!result.succeed)
            {
                alert(result.errorMessage);
                return null;
            }
        }
    },

    checkConfig: function()
    {
        this.initDefaultConfig();

        this._checkConfigConverters();
        this._checkConfigFormatters();
        this._checkConfigSavers();
        this._checkConfigPages();
    },

    getPageConfig: function(location)
    {
        if (this.pages)
        {
            for (var pageId in this.pages)
            {
                var addr = this.pages[pageId].addr;
                for (var i = 0; i < addr.length; i++)
                {
                    var patt = new RegExp(addr[i]);
                    if (patt.test(location))
                    {
                        return pageId;
                    }
                }
            }
        }
        return null;
    },

    _load: function(item, onload)
    {
        chrome.storage.sync.get('html2book_' + item, function(data)
        {
            this[item] = data;
            if (onload)
                onload();
        });
    },

    loadConverters: function(onload)
    {
        this._load("converters", onload);
    },

    loadFormatters: function(onload)
    {
        this._load("formatters", onload);
    },

    loadSavers: function(onload)
    {
        this._load("savers", onload);
    },

    loadPages: function(onload)
    {
        this._load("pages", onload);
    },

    load: function(onload)
    {
        this.loadConverters();
        this.loadFormatters();
        this.loadSavers();
        this.loadPages();

        if (onload)
            onload();
    },

    _save: function(item)
    {
        var data = {};
        data['html2book_' + item] = this[item];
        chrome.storage.sync.set({'html2book_test': this[item]}, function()
        {
            if (chrome.runtime.lastError)
                alert("Cannot save html2book_" + item + ": " + chrome.runtime.lastError);
        });
    },

    saveConverters: function()
    {
        this._save("converters");
    },

    saveFormatters: function()
    {
        this._save("formatters");
    },

    saveSavers: function()
    {
        this._save("savers");
    },

    savePages: function()
    {
        this._save("pages");
    },

    save: function()
    {
        this.saveConverters();
        this.saveFormatters();
        this.saveSavers();
        this.savePages();
    },

    hasChanges: function(changes)
    {
        return changes.html2book_converters ||
            changes.html2book_formatters ||
            changes.html2book_savers ||
            changes.html2book_pages;
    },

    onChanged: function(changes, onchange)
    {
        var changed = false;

        if (changes.html2book_converters)
        {
            this.converters = changes.html2book_converters;
            changed = true;
        }
        if (changes.html2book_formatters)
        {
            this.formatters = changes.html2book_formatters;
            changed = true;
        }
        if (changes.html2book_savers)
        {
            this.savers = changes.html2book_savers;
            changed = true;
        }
        if (changes.html2book_pages)
        {
            this.pages = changes.html2book_pages;
            changed = true;
        }

        if (changed && onchange)
            onchange();
    }
};

var Html2BookConfig = new Html2BookConfigImpl();
