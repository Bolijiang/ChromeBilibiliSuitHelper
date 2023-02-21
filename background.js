
chrome.runtime.onInstalled.addListener(async function() {
    chrome.contextMenus.create({
        id: "main",
        title: "1701735549",
        type: "normal",
        visible: true
    });

    chrome.contextMenus.create({
        id: "github",
        title: "github",
        type: "normal",
        visible: true,
        parentId: "main"
    });

    chrome.contextMenus.create({
        id: "bilibili",
        title: "bilibili",
        type: "normal",
        visible: true,
        parentId: "main",
    });

    const Api = {
        github: function() {
            chrome.tabs.create({url: "https://github.com/lllk140/ChromeBilibiliSuitHelper"});
        },
        bilibili: function() {
            chrome.tabs.create({url: "https://space.bilibili.com/1701735549"});
        },
    }

    chrome.contextMenus.onClicked.addListener(function(info, tab) {
        const func = Api[info.menuItemId] ? Api[info.menuItemId] : function() {return null};
        func();
    })
})
