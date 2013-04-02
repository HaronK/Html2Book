
// Saver to filesystem

function FsSaver(mime)
{
    this.mime = mime;
}

FsSaver.prototype = {
    save : function(file_name, data)
    {
        if (data)
        {
            var Blob = window.Blob || window.WebKitBlob || window.MozBlob;
            saveAs(new Blob([data], { type : this.mime }), file_name);
        }
        else
            alert("Data is undefined");
    },
};