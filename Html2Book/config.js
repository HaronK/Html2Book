
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

function initDefaultPages(config)
{
    config.pages.habr_article = initDefaultHabrConfig();
    config.pages.samlib_page  = initDefaultSamlibConfig();
    config.pages.kniganews    = initDefaultKniganewsConfig();
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

    // habr_article is a default page
    if (!checkObjectFields(config.pages.habr_article, ["name", "addr", "formatters"]))
    {
        config.pages.habr_article = initDefaultHabrConfig();
    }

    // samlib_page is a default page
    if (!checkObjectFields(config.pages.samlib_page, ["name", "addr", "formatters"]))
    {
        config.pages.samlib_page = initDefaultSamlibConfig();
    }

    // kniganews is a default page
    if (!checkObjectFields(config.pages.kniganews, ["name", "addr", "formatters"]))
    {
        config.pages.kniganews = initDefaultKniganewsConfig();
    }

    return config;
}

function validateMandatoryFields(fields, obj, objName)
{
    for (var i = 0; i < fields.length; ++i)
    {
        if (!obj.hasOwnProperty(fields[i]))
        {
            alert(objName + " doesn't contain mandatory field '" + field[i] +
                    "'. Mandatory fields: [" + fields + "]");
            return false;
        }
    }
    return true;
}

function checkConfigConverters(config)
{
    for (var converterId in config.converters)
    {
        if (!validateMandatoryFields(["klass", "mime"], config.converters[converterId], "Converter '" + converterId + "'"))
            return null;
    }
}

function checkConfigFormatters(config)
{
    for (var formatterId in config.formatters)
    {
        var formatter = config.formatters[formatterId];
        if (!validateMandatoryFields(["converter"], formatter, "Formatter '" + formatterId + "'"))
            return null;

        if (!config.converters.hasOwnProperty(formatter.converter))
        {
            alert("Formatter '" + formatterId + "' uses unknown converter '" + formatter.converter + "'");
            return null;
        }

        // check formatter fields required by converter
        var converter = config.converters[formatter.converter];
        if (converter.formatterFields &&
            !validateMandatoryFields(converter.formatterFields, formatter, "Formatter '" + formatterId + "'"))
            return null;
    }
}

function checkConfigSavers(config)
{
    for (var saverId in config.savers)
    {
        if (!validateMandatoryFields(["klass"], config.savers[saverId], "Saver '" + saverId + "'"))
            return null;
    }
}

function checkCofigPages(config)
{
    for (var pageId in config.pages)
    {
        var page = config.pages[pageId];
        if (!validateMandatoryFields(["name", "addr", "formatters"], page, "Page '" + pageId + "'"))
            return null;

        for (var formatterId in page.formatters)
        {
            if (!config.formatters.hasOwnProperty(formatterId))
            {
                alert("Page '" + pageId + "' uses unknown formatter '" + formatterId + "'");
                return null;
            }

            var converter = config.converters[config.formatters[formatterId].converter];
            if (converter.pageFormatterFields &&
                !validateMandatoryFields(converter.pageFormatterFields, page.formatters[formatterId],
                    "Page '" + pageId + "' formatter '" + formatterId + "'"))
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