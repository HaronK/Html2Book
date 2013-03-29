
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
            onUtilityRespond = function(imageData)
            {
                data.images[data.index].setAttribute("xlink:href", "#img" + data.index + ".png");

                var binary = data.doc.createElement("binary");
                binary.setAttribute("id", "img" + data.index + ".png");
                binary.setAttribute("content-type", "image/png");
                var binary_text = data.doc.createTextNode(splitData(imageData, 72));
                binary.appendChild(binary_text);
                data.doc.documentElement.appendChild(binary);

                data.index++;
                processImage(data);
            };
            utilityPort.postMessage({id: "image2base64", imageHref: imgHref});
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
    postTransform: function(xml_doc, onfinish)
    {
        var images = xml_doc.getElementsByTagName("image");
        processImage({
            index:    0,
            images:   images,
            doc:      xml_doc,
            onfinish: onfinish
        });
    },
};
