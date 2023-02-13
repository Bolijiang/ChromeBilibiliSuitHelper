function contentPage(reqkey, value) {
    // 和content.js 交互
    return new Promise(function (resolve, _) {
        const con = {currentWindow: true, active: true};
        chrome.tabs.query(con, function(tabs) {
            const data = {key: reqkey, value: value};
            chrome.tabs.sendMessage(tabs[0].id, data, function(res) {
                resolve(res);
            });
        });
    });
};

function setLocalContent(content) {
    // 保存数据到本地
    return new Promise(function (resolve, _) {
        chrome.storage.local.set(content, function() {
            resolve(content);
        });
    });
};

function getLocalContent(key) {
    // 获取本地数据
    return new Promise(function (resolve, _) {
        chrome.storage.local.get([key], function(value) {
            resolve(value[key]);
        });
    });
};
