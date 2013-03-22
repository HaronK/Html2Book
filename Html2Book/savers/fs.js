
function FsSaver(file_name)
{
    this.file_name = file_name;
}

FsSaver.prototype = {
    save : function(data, mime)
    {
        if (data)
        {
            var Blob = window.Blob || window.WebKitBlob || window.MozBlob;
            saveAs(new Blob([data], { type : mime }), this.file_name);
        }
        else
            alert("Data is undefined");
    },
};