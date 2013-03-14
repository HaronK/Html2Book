
function FsSaver(file_name)
{
    this.file_name = file_name;
}

FsSaver.prototype = {
    save : function(data, mime)
    {
        saveAs(new Blob(data, { type : mime }), this.file_name);
    },
};