async function onClickCard() {
    // 粉丝卡片点击事件
    // await onClickFanCardHandle(this);
    
    // const item_div = this.getElementsByTagName("div")[0];
    // const item = JSON.parse(item_div.dataset["item"]);

    // const root = document.getElementById("choose-item-box");
    // root.dataset["item"] = item_div.dataset["item"];
    
    // var image = document.getElementById("choose-item-box-bg");
    // image.src = item["image_cover"];
    // image.opacity = chooseBackgroundOpacity;

    // await fanNumberOption(item);
}

function updateFanCardOnClick(handle) {
    // 更新粉丝卡片点击事件
    const ul = document.getElementById(CardItemsListId);
    const items = ul.getElementsByTagName("li");
    for (let i = 0; i < items.length; i++) {
        items[i].onclick = handle;
    };
};

function getCardItems() {
    // 获取 items
    const ul = document.getElementById(CardItemsListId);
    const items = ul.getElementsByTagName("li");

    var content = new Array();
    for (let i = 0; i < items.length; i++) {
        content[i] = getFanCardItemJson(items[i]);
    };
    return content;
};

async function getMySuitTotal() {
    // 获取用户装扮数量
    const cookies = await contentPage("getCookies", {});
    if (!cookies["DedeUserID"]) {
        return {code: -1, message: "未登陆"}
    };
    var res = await contentPage("getMySuitListRes", {ps: 1, pn: 1});
    if (res["code"] != 0) {
        return {code: -1, message: json["message"]};
    } else {
        return {
            code: 0, uid: cookies["DedeUserID"],
            total: res["data"]["page"]["total"],
        };
    };
};

function createCardText(class_name, text) {
    // 创建<span>标签[card]
    var span = document.createElement("span");
    span.className = class_name;
    span.innerText = text;
    return span
};

function createCardImage(src) {
    // 创建粉丝卡片图片
    var img = document.createElement("img");
    img.className = CardImageClassName;
    img.src = src;
    return img;
};

function createCard(item) {
    // 创建粉丝卡片
    var li = document.createElement("li");
    li.draggable = "true";
    li.id = `suit-item-id-${item["item_id"]}`;

    var div = document.createElement("div");
    div.dataset["item"] = JSON.stringify(item);

    div.append(createCardText("fan_card_name", item["name"]));
    div.append(createCardText("fan_card_number_text", "FANS NO."));
    div.append(createCardText("fan_card_number", padNumber(item["number"], 6)));
    div.append(createCardText("fan_card_date_text", "DATE"));
    div.append(createCardText("fan_card_date", item["date"]));
    div.append(createCardText("fan_card_own_num", padNumber(item["own_num"], 3)));
    div.append(createCardImage(item["fan_share_image"]));
    li.append(div);
    return li;
}

async function setCardsList(items) {
    // 粉丝卡片列表应用到页面
    var ul = document.getElementById(CardItemsListId);
    ul.innerHTML = "";
    for (let i = 0; i < items.length; i++) {
        ul.append(createCard(items[i]));
    };
    updateFanCardOnClick(async function() {
        await onClickFanCardHandle(this);
    });
};

function parseItem(item) {
    // 解析粉丝卡片item
    return {
        "name": item["item"]["name"],
        "item_id": item["item"]["item_id"],
        "number": item["fan"]["number"],
        "date": item["fan"]["date"],
        "own_num": item["own_num"],
        "time_begin": parseInt(item["item"]["properties"]["sale_time_begin"]) || -1,
        "fan_share_image": item["item"]["properties"]["fan_share_image"],
        "image_cover": item["item"]["properties"]["image_cover"],
    };
};

function getCardsList(total) {
    // 获取粉丝卡片了表情[网络]
    return new Promise(async function(resolve, _) {
        const pns = Math.ceil(total / reqPsNumber);
        var http_list = new Array();
        for (let i = 0; i < pns; i++) {
            http_list[i] = await contentPage("getMySuitListRes", {
                pn: i+1, ps: reqPsNumber,
            });
        };

        Promise.all(http_list).then(async function(values) {
            var items = new Array();
            var ii = 0;

            for (let i = 0; i < values.length; i++) {
                const array = values[i]["data"]["list"] || new Array();
                for (let li = 0; li < array.length; li++) {
                    items[ii] = parseItem(array[li]);
                    ii += 1;
                };
            };

            resolve(items);
        });
    });
};
