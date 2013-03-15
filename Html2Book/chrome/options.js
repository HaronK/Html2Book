
var storage = chrome.storage.sync;
var Html2BookConfig;

// Saves options to localStorage.
function save_options() {
    storage.set({'html2book_config': Html2BookConfig}, function(){
        // TODO: check errors

    });
//    var select = document.getElementById("color");
//    var color = select.children[select.selectedIndex].value;
//    localStorage["favorite_color"] = color;
//
//    // Update status to let user know options were saved.
//    var status = document.getElementById("status");
//    status.innerHTML = "Options Saved.";
//    setTimeout(function() {
//        status.innerHTML = "";
//    }, 750);
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
//    var favorite = localStorage["html2book_config"];
//    if (!favorite) {
//        return;
//    }
//    var select = document.getElementById("color");
//    for ( var i = 0; i < select.children.length; i++) {
//        var child = select.children[i];
//        if (child.value == favorite) {
//            child.selected = "true";
//            break;
//        }
//    }
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);