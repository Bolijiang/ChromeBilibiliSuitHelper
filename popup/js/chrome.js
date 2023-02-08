async function backgroundPage(reqkey, value) {
    // 和background.js 交互
    return await chrome.runtime.sendMessage({key: reqkey, value: value});
};

async function contentPage(reqkey, value) {
    // 和content.js 交互
    const [tab] = await chrome.tabs.query({currentWindow: true, active: true});
    return await chrome.tabs.sendMessage(tab.id, {key: reqkey, value: value});
};

async function setChromeLocalContent(content) {
    // 保存数据到本地
    await chrome.storage.local.set(content);
    return content
};

async function getChromeLocalContent(key) {
    // 获取本地数据
    const value = await chrome.storage.local.get([key]);
    return value[key];
};

async function DeleteAll() {
    // test 删除数据
    await setChromeLocalContent({"total": null});
    await setChromeLocalContent({"items": null});
    await setChromeLocalContent({"uid": null});
    return "ok";
};
