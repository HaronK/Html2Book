
function MSG(id, params)
{
    return chrome.i18n.getMessage(id, params);
}

function len(obj)
{
    return Object.keys(obj).length;
}

String.prototype.endsWith = function(str)
{
    return (this.match(str + "$") == str);
};

String.prototype.startsWith = function(str)
{
    return (this.match("^" + str) == str);
};

String.prototype.format = function()
{
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number)
    {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

function appendScriptFile(file)
{
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.src = file;
    document.head.appendChild(script);
}

function appendScriptText(text)
{
    var script = document.createElement('script');
    script.type = "text/javascript";
    var script_text = document.createTextNode(text);
    script.appendChild(script_text);
    document.head.appendChild(elem);
}

function embedAfter(blockClass, element)
{
    var elem = document.getElementsByClassName(blockClass);
    if (elem.length == 0)
    {
        alert("Cannot find '" + blockClass + "' element");
        return;
    }
    else
        elem[0].appendChild(element);
}

function generateButton(name, converter_klass, converter_params, saver_klass, mime)
{
    // generate button script
    var script_text =
        "function convert2" + name + "(){\n" +
        "    var convert_handler = new " + converter_klass + "(" + (converter_params ? converter_params : "") + ");\n" +
        "    var save_handler = new " + saver_klass + "('book." + name + ", " + mime + ");\n" +
        "    var book_data = convert_handler.convert(document.documentElement.outerHTML);\n" +
        "    save_handler.save(book_data);\n" +
        "}";
    appendScriptText(script_text);

    var h2b_button = document.createElement("button");
    h2b_button.type = "button";
    h2b_button.onclik = "convert2" + name + "()";
    var h2b_button_text = document.createTextNode(name);
    h2b_button.appendChild(h2b_button_text);
    return h2b_button;
}

function resolvePath(path)
{
    var localFile = path.split("|");
    return (localFile.length == 2 && localFile[0] == 'chrome') ? chrome.extension.getURL(localFile[1]) : path;
}

// ---------------------------------------------------------------------------

// Source: http://www.w3schools.com/xsl/xsl_client.asp

function requestFileAsync(file_name, obj, onload)
{
    var xhr = new XMLHttpRequest();

    xhr.open("GET", file_name, true);
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4)
            onload(xhr, obj);
    };
    xhr.send(null);
}

function requestFileSync(file_name)
{
    var xhr = new XMLHttpRequest();

    xhr.open("GET", file_name, false);

    return xhr;
}

function applyXSLT(xsl_data, xml_data, transform_params)
{
    var xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsl_data);

    // set parameters
    if (transform_params)
    {
        for (var param in transform_params)
        {
            xsltProcessor.setParameter(null, param, transform_params[param]);
        }
    }

    var result = xsltProcessor.transformToDocument(xml_data);
    return result;
}

// Source: https://gist.github.com/Yaffle/1088850

function parseURI(url)
{
    var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
    // authority = '//' + user + ':' + pass '@' + hostname + ':' port
    return (m ? {
        href     : m[0] || '',
        protocol : m[1] || '',
        authority: m[2] || '',
        host     : m[3] || '',
        hostname : m[4] || '',
        port     : m[5] || '',
        pathname : m[6] || '',
        search   : m[7] || '',
        hash     : m[8] || ''
    } : null);
}

function absolutizeURI(base, href) // RFC 3986
{
    function removeDotSegments(input)
    {
        var output = [];
        input.replace(/^(\.\.?(\/|$))+/, '')
             .replace(/\/(\.(\/|$))+/g, '/')
             .replace(/\/\.\.$/, '/../')
             .replace(/\/?[^\/]*/g, function (p)
              {
                  if (p === '/..')
                  {
                      output.pop();
                  }
                  else
                  {
                      output.push(p);
                  }
              });
        return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
    }

    href = parseURI(href || '');
    base = parseURI(base || '');

    return !href || !base ? null : (href.protocol || base.protocol) +
         (href.protocol || href.authority ? href.authority : base.authority) +
         removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
         (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
         href.hash;
}
