
var storage = chrome.storage.sync;
var Html2BookConfig;

// Saves options to localStorage.
function save_options() {
    storage.set({'html2book_config': Html2BookConfig}, function(){
        // TODO: check errors

    });
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    storage.get('html2book_config', function(config){
        // TODO: check configuration is valid

        // TODO: generate sites/pages tab content

        // TODO: generate converters tab content

        // TODO: generate savers tab content

        Html2BookConfig = config;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);