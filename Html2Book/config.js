
// Config functions

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

function checkProperty(prop, defaultValue)
{
    return !prop ? defaultValue : prop;
}

function initConfigLevel1(config)
{
    config            = checkProperty(config,            {});
    config.converters = checkProperty(config.converters, {});
    config.formatters = checkProperty(config.formatters, {});
    config.savers     = checkProperty(config.savers,     {});
    config.pages      = checkProperty(config.pages,      {});

    config.debug      = checkProperty(config.debug,      {});

    return config;
}

function initDefaultPages(config)
{
    config = initConfigLevel1(config);

    for (var pageId in DefaultPages)
        config.pages[pageId] = DefaultPages[pageId];

    return config;
}

function checkObjectFields(obj, prop, fields, defaultValue)
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
}

function initDefaultConfig(config)
{
    config = initConfigLevel1(config);

    config.debug.status     = checkProperty(config.debug.status,     false);
//    config.debug.save_xhtml = checkProperty(config.debug.save_xhtml, true);
//    config.debug.save_xsl   = checkProperty(config.debug.save_xsl,   true);

    // xslt is a default converter
    checkObjectFields(config.converters, "xslt", ["klass", "mime"], DefaultConverters.xslt);

    // fb2 is a default formatter
    checkObjectFields(config.formatters, "fb2", ["converter", "xsl"], DefaultFormatters.fb2);

    // fs is a default saver
    checkObjectFields(config.savers, "fs", ["klass"], DefaultSavers.fs);

    // reset default pages
    for (var pageId in DefaultPages)
    {
        checkObjectFields(config.pages, pageId, ["name", "addr", "formatters"], DefaultPages[pageId]);
    }

    return config;
}

function validateMandatoryFields(fields, obj, objName)
{
    for (var i = 0; i < fields.length; ++i)
    {
        if (!obj.hasOwnProperty(fields[i]))
        {
            return {errorMessage: MSG("obj_mandatory_field", [objName, field[i], fields])};
        }
    }
    return {succeed: true};
}

function checkConfigConverters(config)
{
    for (var converterId in config.converters)
    {
        var result = validateMandatoryFields(["klass", "mime"], config.converters[converterId], converterId);
        if (!result.succeed)
        {
            alert(result.errorMessage);
            return null;
        }
    }
}

function checkConfigFormatters(config)
{
    for (var formatterId in config.formatters)
    {
        var formatter = config.formatters[formatterId];

        var result = validateMandatoryFields(["converter"], formatter, formatterId);
        if (!result.succeed)
        {
            alert(result.errorMessage);
            return null;
        }

        if (!config.converters.hasOwnProperty(formatter.converter))
        {
            alert(MSG("formatter_unknown_converter", [formatterId, formatter.converter]));
            return null;
        }

        // check formatter fields required by converter
        var converter = config.converters[formatter.converter];
        if (converter.formatterFields)
        {
            result = validateMandatoryFields(converter.formatterFields, formatter, formatterId);
            if (!result.succeed)
            {
                alert(result.errorMessage);
                return null;
            }
        }
    }
}

function checkConfigSavers(config)
{
    for (var saverId in config.savers)
    {
        var result = validateMandatoryFields(["klass"], config.savers[saverId], saverId);
        if (!result.succeed)
        {
            alert(result.errorMessage);
            return null;
        }
    }
}

function validateConfigPage(config, pageId)
{
    var page = config.pages[pageId];
    var result = validateMandatoryFields(["name", "addr", "formatters"], page, pageId);
    if (!result.succeed)
    {
        alert(result.errorMessage);
        return null;
    }

    for (var formatterId in page.formatters)
    {
        if (!config.formatters.hasOwnProperty(formatterId))
            return {errorMessage: MSG("page_unknown_formatter", [pageId, formatterId])};

        var converter = config.converters[config.formatters[formatterId].converter];
        if (converter.pageFormatterFields)
        {
            result = validateMandatoryFields(converter.pageFormatterFields, page.formatters[formatterId],
                    pageId + "." + formatterId);
            if (!result.succeed)
            {
                alert(result.errorMessage);
                return null;
            }
        }
    }
    return {succeed: true};
}

function checkCofigPages(config)
{
    for (var pageId in config.pages)
    {
        var result = validateConfigPage(config, pageId);
        if (!result.succeed)
        {
            alert(result.errorMessage);
            return null;
        }
    }
}

function checkConfig(config)
{
    config = initDefaultConfig(config);

    checkConfigConverters(config);
    checkConfigSavers(config);
    checkCofigPages(config);

    return config;
}

function getPageConfig(config, location)
{
    if (config.pages)
    {
        for (var pageId in config.pages)
        {
            var addr = config.pages[pageId].addr;
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
}

function saveConfig(config)
{
    storage.set({'html2book_config': config}, function()
    {
        // TODO: check errors
    });
}
