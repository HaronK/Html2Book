
function FsSaver(file_name)
{
	this.file_name = file_name;
}

FsSaver.prototype = {
	save: function(data) {
		saveAs(new Blob(data, {type: "text/plain;charset=" + document.characterSet}), this.file_name);
	},
};