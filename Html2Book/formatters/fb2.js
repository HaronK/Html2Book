
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
            var imageObj = new Image();
            imageObj.onload = function()
            {
                data.canvas.width = this.width;
                data.canvas.height = this.height;

                data.context.drawImage(imageObj, 0, 0);
                var dataURL = data.canvas.toDataURL("image/png");
                // escape data:image prefix
                var imageData = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

                data.images[data.index].setAttribute("xlink:href", "#img" + data.index + ".png");

                var binary = data.doc.createElement("binary");
                binary.setAttribute("id", "img" + data.index + ".png");
                binary.setAttribute("content-type", "image/png");
                var binary_text = data.doc.createTextNode(splitData(imageData.trim(), 72));
                binary.appendChild(binary_text);
                data.doc.documentElement.appendChild(binary);

                data.index++;
                processImage(data);
            };
            imageObj.src = imgHref;
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
