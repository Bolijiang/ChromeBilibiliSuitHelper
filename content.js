
const requestUtils = {
    urlAddParams: function(url, params) {
        let UrlReturn = url + "?";
        for(let key in params || {}) {
            UrlReturn += `${key}=${params[key]}&`;
        }
        return UrlReturn
    },
    buildDataBody: function(form_data) {
        let body_data = "";
        for(let key in form_data || {}) {
            const _key = key;
            const _value = form_data[key];
            body_data += `${_key}=${_value}&`
        }
        return body_data.slice(0, body_data.length-1);
    }
}

function request(detail={}, body={}, setting={}) {
    const defaultDataType = "application/x-www-form-urlencoded";
    const defaultJsonType = "application/json";

    const type = detail.type || [];
    const params = detail.params || {};

    type.push(body.data ? defaultDataType : defaultJsonType);
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(detail.method, requestUtils.urlAddParams(detail.url, params), true);
        xhr.setRequestHeader("Content-Type", type.join("; "));
        xhr.withCredentials = setting.withCredentials === undefined;
        xhr.onload = function() {
            if (this.status === 200) {
                resolve(JSON.parse(this.responseText));
            } else {
                reject(new Error(xhr.statusText));
            }
        };
        if (body.data) {
            xhr.send(requestUtils.buildDataBody(body.data));
        } else {
            xhr.send(JSON.stringify(body.json));
        }
    })
}

const biliApi = {
    GetCookies: async function(message={type: "json"}) {
        // 获取cookies -> type[dict]
        if (message.type !== "json") {
            return document.cookie;
        }
        let cookie = {};
        if (!document.cookie) {
            return cookie;
        }
        let cookie_list = document.cookie.split("; ");
        for (let i = 0; i < cookie_list.length; i++) {
            let element = cookie_list[i].split("=");
            if (element.length < 2) {
                element = [element[0], ""];
            }
            cookie[element[0]] = element[1];
        }
        return cookie
    },

    GetMyFanCards: async function(message) {
        // 获取自己拥有的装扮 
        const url = "https://api.bilibili.com/x/garb/user/suit/asset/list";
        const params = {
            "part": "suit", "state": "active", "is_fans": "true",
            "ps": message.ps || 1, "pn": message.pn || 1,
        };
        return await request(
            {method: "GET", url: url, params: params}
        );
    },

    GetMyFanNumInventory: async function(message) {
        // 获取自己指定装扮的库存
        const url = "https://api.bilibili.com/x/garb/user/fannum/list";
        const params = {"item_id": message.item_id || ""};
        return await request(
            {method: "GET", url: url, params: params}
        );
    },
    GetSuitAssets: async function(message) {
        // 获取装扮的内容
        const url = "https://api.bilibili.com/x/garb/user/suit/asset";
        const params = {"item_id": message.item_id, "part": "suit", "trial": "0"};
        return await request(
            {method: "GET", url: url, params: params}
        );
    },
    GetSuitOrderList: async function(message) {
        // 获取订单
        const url = "https://api.live.bilibili.com/xlive/revenue/v1/order/getMainOrderList";
        const params = {
            "page": message.pn || "1", "status": message.type,
            "page_size": message.ps || "10", "biz_type": "1",
        };
        return await request(
            {method: "GET", url: url, params: params}
        );
    },

    // GetMyPreviewAssets: async function(message) {
    //     // 获取自己装扮类所有信息
    //     return await request("GET", "https://api.bilibili.com/x/garb/user/preview/asset/list");
    // },
    //
    // GetOthersInfo: async function(message) {
    //     // 获取其他人基础信息
    //     const url = "https://account.bilibili.com/api/member/getCardByMid";
    //     const params = {"mid": message.mid || ""};
    //     return await request("GET", url, params);
    // },
    //
    // GetMyInfo: async function(message) {
    //     // 获取自己的信息
    //     return await request("GET", "https://api.bilibili.com/x/web-interface/nav");
    // },
    //
    // GetPreviewPrivileges: async function(message) {
    //     // 获取特权
    //     return await request("GET", "https://api.bilibili.com/x/garb/user/preview/privileges");
    // },

    ApplyMyFanCardsSort: async function(message) {
        // 应用装扮排序
        const url = "https://api.bilibili.com/x/garb/user/suit/asset/list/sort";
        const cookies = await biliApi.GetCookies({type: "json"});
        const formData = {"ids": message.ids.join(","), "csrf": cookies["bili_jct"]};
        return await request(
            {method: "POST", url: url},
            {data: formData}
        );
    },

    GiveFanNumToOthers: async function(message) {
        // 赠送装扮
        const url = "https://api.bilibili.com/x/garb/user/fannum/present/v2";
        const cookies = await biliApi.GetCookies({type: "json"});
        const formData = {
            "item_id": message["item_id"], "fan_num": message["fan_num"],
            "to_mid": message["to_mid"], "csrf": cookies["bili_jct"],
        };
        return await request(
            {method: "POST", url: url},
            {data: formData}
        );
    },

    ShowFanNumToCard: async function(message) {
        // 展示粉丝编号到卡面
        const url = "https://api.bilibili.com/x/garb/user/fannum/change";
        const cookies = await biliApi.GetCookies({type: "json"});
        const formData = {
            "item_id": message["item_id"], "num": message["fan_num"],
            "csrf": cookies["bili_jct"],
        };
        return await request(
            {method: "POST", url: url},
            {data: formData}
        );
    },

    BuildFanNumberShareUrl: async function(message) {
        //  生成共享链接
        const url = "https://api.bilibili.com/x/garb/user/fannum/present/share";
        const cookies = await biliApi.GetCookies({type: "json"});
        const formData = {
            "item_id": message["item_id"], "fan_nums": message["fan_num"],
            "csrf": cookies["bili_jct"],
        };
        return await request(
            {method: "POST", url: url},
            {data: formData}
        );
    },

    BuildShortLinkUrl: async function(message) {
        // 生成短链接
        const url = "https://api.bilibili.com/x/share/click";
        const GoUrl = decodeURI(encodeURIComponent(message["url"]));
        const formData = {
            "build": 6700300, "buvid": 0, "oid": GoUrl,
            "platform": "windows", "share_channel": "COPY",
            "share_id": "public.webview.0.0.pv", "share_mode": 3,
        };
        return await request(
            {method: "POST", url: url},
            {data: formData},
            {withCredentials: false}
        );
    }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let func = biliApi[message.key] || async function(_) {return null};
    func(message.value).then(sendResponse);
    return true;
});
