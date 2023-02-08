function cookieString2Object(cookies) {
    // 字符串cookie转object
    var cookie = {};
    if (!cookie) {
        return cookie;
    };
    var cookie_list = cookies.split("; ");
    for (let i = 0; i < cookie_list.length; i++) {
        var element = cookie_list[i].split("=");
        if (element.length < 2) {
            element = [element[0], ""];
        };
        cookie[element[0]] = element[1];
    };
    return cookie
};

async function getCookies(_) {
    // 获取cookies
    return cookieString2Object(document.cookie);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.key == "getCookies") {
        getCookies(message.value).then(sendResponse);
    };
    if (message.key == "postListSort") {
        postListSort(message.value).then(sendResponse);
    }
    return true;
});
