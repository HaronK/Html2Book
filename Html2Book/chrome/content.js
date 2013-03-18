
chrome.extension.onMessage.addListener(function(message, sender, sendResponse)
{
    if (message.id == "data")
        sendResponse({location: document.location,
                      page: document.documentElement.outerHTML});
});
