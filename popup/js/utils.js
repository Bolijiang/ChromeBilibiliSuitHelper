function getUrlFileExt(url) {
    // 获取url文件后缀
    var url_ = url;
    if (url.indexOf("?")) {
        url_ = url.split("?")[0];
    };
    var url_list = url_.split(".");
    return url_list[url_list.length - 1]
};

function addParams(_url, params) {
    // 往url添加Params
    var url = _url + "?"
    for(let key in params) {
        url += `${key}=${params[key]}&`
    };
    return url.slice(0, url.length-1);
};

function padNumber(num, len) {
    // 数字补齐
    return (Array(len).join("0") + `${num}`).slice(-len);
}


function getItems() {
    // 获取上方装扮items
    // 排序用的
    var boxs = document.getElementsByClassName("fan_card_image_box");
    var items = new Array();
    for (let i = 0; i < boxs.length; i++) {
        items[i] = JSON.parse(boxs[i].dataset["item"]);
    };
    return items;
};


function parseItem(params) {
    // 提取item
    return {
        "name": params["item"]["name"],
        "item_id": params["item"]["item_id"],
        "number": params["fan"]["number"],
        "date": params["fan"]["date"],
        "own_num": params["own_num"],
        "time_begin": parseInt(params["item"]["properties"]["sale_time_begin"]),
        "fan_share_image": params["item"]["properties"]["fan_share_image"],
    };
};
