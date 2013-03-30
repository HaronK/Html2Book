
var storage = chrome.storage.sync;
var Html2BookConfig = null;

// Restores select box state to saved value from localStorage.
function restoreOptions()
{
    storage.get('html2book_config', function(config){
        // TODO: check configuration is valid

        // TODO: generate sites/pages tab content

        // TODO: generate converters tab content

        // TODO: generate savers tab content

        Html2BookConfig = config;
    });
}

// Saves options to localStorage.
function saveOptions()
{
    alert("Save options");
    storage.set({'html2book_config': Html2BookConfig}, function()
    {
        // TODO: check errors
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save').addEventListener('click', saveOptions);

// Pages ----------------------------------------------------------------------
function changePage()
{
    alert("Page changed");
}

document.querySelector('#pageSelect').addEventListener('onchange', changePage);
