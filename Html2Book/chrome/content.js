
chrome.extension.onMessage.addListener(function(message, sender, sendResponse)
{
    if (message.id == "location")
        sendResponse({location: document.location});
});
