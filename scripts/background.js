chrome.tabs.onUpdated.addListener(function(id,info,tab){    //скрываем иконку 19 на левых вкладках
    if (info.url.indexOf('.wildberries.') < 0){
        chrome.browserAction.disable(id);
    } else {
        chrome.browserAction.enable(id);
    }
});