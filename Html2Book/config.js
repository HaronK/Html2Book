
// Config functions

function loadConfig(config_text)
{
    var config_str = "var Html2BookConfig = {" + config_text + "};";
    eval(config_str);
}

function checkObjectFields(obj, fields)
{
    if (!obj)
        return false;
    for (var i = 0; i < fields.length; ++i)
    {
        if (!obj.hasOwnProperty(fields[i]))
            return false;
    }
    return true;
}

function initDefaultHabrConfig()
{
    return {
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
    };
}

function initDefaultSamlibConfig()
{
    return {
        name: 'Samizdat',
        addr: ['http://samlib\\.ru/\\w/\\w+/.+?\\.s?html'], // pages url template
        formatters: {
            fb2: {
                xsl: 'chrome|../pages/samlib2fb2.xsl',
                fileNameRegEx: "//body/center/h2",
            },
        },
    };
}

function initDefaultKniganewsConfig()
{
    return {
        name: 'KnigaNews',
        addr: ['http://kniganews\\.org/\\d\\d\\d\\d/\\d\\d/\\d\\d/.+?/'], // pages url template
        formatters: {
            fb2: {
                xsl: 'chrome|../pages/kniganews2fb2.xsl',
                fileNameRegEx: "//h1[@class='entry-title']",
            },
        },
    };
}

var DefaultPages = {
    habr_article: initDefaultHabrConfig,
    samlib_page:  initDefaultSamlibConfig,
    kniganews:    initDefaultKniganewsConfig,
};

function initDefaultPages(config)
{
    for (var pageId in DefaultPages)
        config.pages[pageId] = DefaultPages[pageId]();
}

function initDefaultConfig(config)
{
    if (!config)
        config = {};

    if (!config.converters)
        config.converters = {};

    // xslt is a default converter
    if (!checkObjectFields(config.converters.xslt, ["klass", "mime"]))
    {
        config.converters.xslt = {
            imports : ['extern/htmlparser.js', 'converters/xslt.js'],
            klass : "XsltConverter",
            mime : 'text/xml;charset=' + document.characterSet,
            formatterFields: ["xsl"],
            pageFormatterFields: ["xsl", "fileNameRegEx"],
        };
    }

    if (!config.formatters)
        config.formatters = {};

    // fb2 is a default formatter
    if (!checkObjectFields(config.formatters.fb2, ["converter", "xsl"]))
    {
        config.formatters.fb2 = {
            imports : ['formatters/fb2.js'],
            klass : "Fb2Formatter",
            converter: "xslt",
            xsl: "chrome|../formatters/fb2.xsl",
        };
    }

    if (!config.savers)
        config.savers = {};

    // fs is a default saver
    if (!checkObjectFields(config.savers.fs, ["klass"]))
    {
        config.savers.fs = {
            imports : [ 'extern/FileSaver.js', 'savers/fs.js'],
            klass : "FsSaver",
        };
    }

    if (!config.pages)
        config.pages = {};

//    // habr_article is a default page
//    if (!checkObjectFields(config.pages.habr_article, ["name", "addr", "formatters"]))
//    {
//        config.pages.habr_article = initDefaultHabrConfig();
//    }
//
//    // samlib_page is a default page
//    if (!checkObjectFields(config.pages.samlib_page, ["name", "addr", "formatters"]))
//    {
//        config.pages.samlib_page = initDefaultSamlibConfig();
//    }
//
//    // kniganews is a default page
//    if (!checkObjectFields(config.pages.kniganews, ["name", "addr", "formatters"]))
//    {
//        config.pages.kniganews = initDefaultKniganewsConfig();
//    }

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
