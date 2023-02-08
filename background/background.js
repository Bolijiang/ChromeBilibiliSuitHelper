function addParams(_url, params) {
    // 往url添加Params
    if (!params) {
        return _url;
    }
    var url = _url + "?"
    for(let key in params) {
        url += `${key}=${params[key]}&`
    };
    return url.slice(0, url.length-1);
};

function httpRequest(data) {
    const url = addParams(data.url, data["params"]);
    return new Promise(function (resolve, reject) {
        fetch(url, {
            method: data.method,
            credentials: "include",
            mode:'cors',
            headers: {
                "Content-Type": data["content_type"],
            },
            body: data["body"],
        }).then(function(response) {
            return response.text();
        }).then(function(body) {
            resolve(body);
        }).catch(function(error) {
            reject(error);
        });
    });
};

async function getAssetListRes(data) {
    // 获取 suit/asset/list 内容
    const url = "https://api.bilibili.com/x/garb/user/suit/asset/list";
    const res_text = await httpRequest({method: "GET", url: url, params: {
        "part": "suit", "state": "active", "is_fans": "true", 
        "ps": data.ps, "pn": data.pn
    }});
    return res_text;
};

async function getFannumListRes(data) {
    // 获取 user/fannum/list 内容
    const url = "https://api.bilibili.com/x/garb/user/fannum/list";
    const res_text = await httpRequest({method: "GET", url: url, params: {
        "item_id": data.item_id
    }});
    return res_text
}

 
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.key == "getAssetListRes") {
        getAssetListRes(message.value).then(sendResponse);
    };
    if (message.key == "getFannumListRes") {
        getFannumListRes(message.value).then(sendResponse);
    };
    return true;
});
