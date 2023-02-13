const FromLocalUpdateFanCards = true;
const UpdateFanCardsRequestCount = 20; 
const FanCardsListSaveLoacl = true;


const FanCardsCount_Id = "fan-cards-count";
const FanCardsList_Id = "fan-cards-list";
const FanCardsSearch_Id = "fan-cards-search";

async function GetFanCardsTotal() {
    // 获取用户装扮数量
    const cookies = await contentPage("GetCookies", {"type": "json"});
    if (!cookies["DedeUserID"]) {
        return {code: -1, message: "未登陆"}
    };
    var res = await contentPage("GetMyFanCards", {ps: 1, pn: 1});
    if (res["code"] != 0) {
        return {code: -1, message: json["message"]};
    } else {
        return {
            code: 0, uid: cookies["DedeUserID"],
            total: res["data"]["page"]["total"],
        };
    };
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

function GetFanCardsList(total) {
    // 获取粉丝卡片了表情[网络]
    return new Promise(async function(resolve, _) {
        const pns = Math.ceil(total / UpdateFanCardsRequestCount);
        let http_list = new Array();
        for (let i = 0; i < pns; i++) {
            http_list[i] = await contentPage("GetMyFanCards", {
                pn: i+1, ps: UpdateFanCardsRequestCount,
            });
        };
        Promise.all(http_list).then(async function(values) {
            let items = new Array();
            let ii = 0
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

function CreateFanCard(item) {
    function CreateFanCardText(class_name, text) {
        const span = document.createElement("span");
        span.className = class_name;
        span.innerText = text;
        return span
    };

    function CreateFanCardImage(src) {
        // 创建粉丝卡片图片
        const img = document.createElement("img");
        img.src = src;
        return img;
    };

    function padNumber(num, len) {
        // 数字补齐
        return (Array(len).join("0") + `${num}`).slice(-len);
    };

    const card = document.createElement("li");
    card.draggable = "true";
    card.id = item["item_id"];

    const content = document.createElement("div");

    content.append(CreateFanCardText("fan-card-name", item["name"]));
    content.append(CreateFanCardText("fan-card-number-text", "FANS NO."));
    content.append(CreateFanCardText("fan-card-number", padNumber(item["number"], 6)));
    content.append(CreateFanCardText("fan-card-date-text", "DATE"));
    content.append(CreateFanCardText("fan-card-date", item["date"]));
    content.append(CreateFanCardText("fan-card-own-num", padNumber(item["own_num"], 3)));
    content.append(CreateFanCardImage(item["fan_share_image"]));

    content.dataset["cover"] = item["image_cover"];
    item["date_number"] = new Date(item["date"]).valueOf();
    delete item["date"];
    delete item["image_cover"];
    delete item["fan_share_image"];

    content.dataset["item"] = JSON.stringify(item);

    card.append(content);
    return card;
};

function SetFardCards2Page(items) {
    // 设置粉丝卡片到页面
    const root = document.getElementById(FanCardsList_Id);
    root.innerHTML = "";
    for (let i = 0; i < items.length; i++) {
        root.append(CreateFanCard(items[i]));
    };
    return root;
};

function parseFanCard(li) {
    const root = li.childNodes[0];
    const item = JSON.parse(root.dataset["item"]);
    item["image_cover"] = root.dataset["cover"];

    const imgEl = root.getElementsByTagName("img");
    item["fan_share_image"] = imgEl[0].src;

    const dateEl = root.getElementsByClassName("fan-card-date");
    item["date"] = dateEl[0].innerText;
    return item;
};

async function SaveItems2Local(uid, total) {
    const root = document.getElementById(FanCardsList_Id);
    const fanCardsList = root.childNodes;

    const items = new Array();

    for (let i = 0; i < fanCardsList.length; i++) {
        items[i] = parseFanCard(fanCardsList[i]);
    };

    const locad = await getLocalContent("fan-cards") || {};
    locad["items"] = items;
    uid ? locad["uid"] = uid : null;
    total ? locad["total"] = total : null;

    await setLocalContent({"fan-cards": locad});
};

function UpdateFanCardOnClick(handle) {
    // 更新粉丝卡片点击事件
    const ul = document.getElementById(FanCardsList_Id);
    const items = ul.getElementsByTagName("li");
    for (let i = 0; i < items.length; i++) {
        items[i].onclick = handle;
    };
};

function UpdateFanCardOnDbClick(handle) {
    const ul = document.getElementById(FanCardsList_Id);
    const items = ul.getElementsByTagName("li");
    for (let i = 0; i < items.length; i++) {
        items[i].ondblclick = handle;
    };
};

async function StartLoadFanCards(handle, double=false) {
    const locad = await getLocalContent("fan-cards") || {};
    locad.items = locad.items || new Array();
    const user = await GetFanCardsTotal();

    var count = document.getElementById(FanCardsCount_Id);
    if (count) {
        count.innerText = `共${user.total}套`;
    };

    if (user.code != 0) {
        console.log(user["message"]);
        return 
    };

    const exp1 = (user.uid == locad.uid);
    const exp2 = (user.total == locad.total);
    const exp3 = (Boolean(locad.items));
    const exp4 = (user.total == locad.items.length);
    const expAll = (exp1 && exp2 && exp3 && exp4)

    if (FromLocalUpdateFanCards && expAll) {
        console.log("本地存在, 从本地更新到页面");
        SetFardCards2Page(locad.items);
    } else {
        console.log("本地不存在, 从网络更新到页面");
        const items = await GetFanCardsList(user.total);
        SetFardCards2Page(items);
    };

    if (!double) {
        UpdateFanCardOnClick(handle);
    } else {
        UpdateFanCardOnDbClick(handle);
    };

    if (FanCardsListSaveLoacl && !expAll) {
        console.log("保存数据到本地");
        await SaveItems2Local(user.uid, user.total);
    };
};

document.getElementById(FanCardsSearch_Id).onchange = async function() {
    // 搜索并且定位
    if (this.value == "") {
        return null;
    };

    const root = document.getElementById(FanCardsList_Id);
    const fanCardsList = root.childNodes;
    for (let i = 0; i < fanCardsList.length; i++) {
        const item = parseFanCard(fanCardsList[i]);
        if (item["name"].indexOf(this.value) != -1) {
            window.location.hash = `#${item["item_id"]}`;
            return null;
        };
    };
};
