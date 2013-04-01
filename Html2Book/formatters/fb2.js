
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
        var ext = 'png';
        var imgHref = data.images[data.index].getAttribute("alt");
        onUtilityRespond = function(imageData)
        {
            data.images[data.index].setAttribute("xlink:href", "#img" + data.index + "." + ext);

            var binary = data.doc.createElement("binary");
            binary.setAttribute("id", "img" + data.index + "." + ext);
            binary.setAttribute("content-type", "image/" + ext);
            var binary_text = data.doc.createTextNode(splitData(imageData, 72));
            binary.appendChild(binary_text);
            data.doc.documentElement.appendChild(binary);

            data.index++;
            processImage(data);
        };
        utilityPort.postMessage({id: "image2base64", imageHref: imgHref});
    }
    else if (data.onfinish)
        data.onfinish();
}

Fb2Formatter.prototype = {
    getTransformParams: function(data)
    {
        var result = {};
        if (data.addComments)
        {
            result['body-comments'] = "on";
        }
        return result;
    },

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
