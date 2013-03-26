
// FB2 Formatter

function Fb2Formatter()
{
}

function splitData(data, rowLen)
{
    var result = "";
    for (var pos = 0, remain = data.length; remain > 0; pos += rowLen, remain -= rowLen)
    {
        var row = data.substr(pos, Math.min(rowLen, remain));
        result += row + "\n";
    }
    return result;
}

function processImage(data)
{
    if (data.index < data.images.length)
    {
        var imgHref = data.images[data.index].getAttribute("alt");
        if (imgHref.endsWith(".jpeg") || imgHref.endsWith(".jpg") || imgHref.endsWith(".png"))
        {
            var ext = imgHref.endsWith(".png") ? "png" : "jpg";

            requestFileAsync(imgHref, null, function(xhr, obj)
            {
                var imageData = window.btoa(unescape(encodeURIComponent(xhr.responseText)));

                data.images[data.index].setAttribute("xlink:href", "#img" + data.index + "." + ext);

                var binary = data.doc.createElement("binary");
                binary.setAttribute("id", "img" + data.index + "." + ext);
                binary.setAttribute("content-type", "image/" + ext);
                var binary_text = data.doc.createTextNode(splitData(imageData, 72));
                binary.appendChild(binary_text);
                data.doc.documentElement.appendChild(binary);

                data.index++;
                processImage(data);
            });
        }
        else
        {
            data.index++;
            processImage(data);
        }
    }
    else if (data.onfinish)
        data.onfinish();
}

Fb2Formatter.prototype = {
    postTransform: function(xsl_doc, onfinish)
    {
        var images = xsl_doc.getElementsByTagName("image");
        var canvas = document.createElement("canvas");
        canvas.width = 2048;
        canvas.height = 2048;
        var context = canvas.getContext('2d');
        processImage({
            index:    0,
            images:   images,
            canvas:   canvas,
            context:  context,
            doc:      xsl_doc,
            onfinish: onfinish
        });
    },
};
