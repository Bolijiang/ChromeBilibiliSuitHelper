const FromLocalUpdateFanCards = true;
const UpdateFanCardsRequestCount = 20; 
const FanCardsListSaveLocal = true;

const FanCardsList_Id = "fan-cards-list";
const FanCardsSearch_Id = "fan-cards-search";
const FanCardsSort_Id = "fan-cards-sort";

const FanCardName_ClassName = "fan-card-name";
const FanCardNumberText_ClassName  = "fan-card-number-text";
const FanCardNumber_ClassName = "fan-card-number";
const FanCardDateText_ClassName = "fan-card-date-text";
const FanCardDate_ClassName = "fan-card-date";
const FanCardOwnNum_ClassName = "fan-card-own-num";

const FanCard_ClassName = "fan-card";


function ParseFanCardTag(li) {
    // 解析粉丝卡片内容[li标签]
    const root = li.getElementsByClassName("fan-card-content")[0];
    const item = JSON.parse(root.dataset["item"]);
    item["image_cover"] = root.dataset["cover"];

    const imgEl = root.getElementsByTagName("img");
    item["fan_share_image"] = imgEl[0].src;

    const dateEl = root.getElementsByClassName(FanCardDate_ClassName);
    item["date"] = dateEl[0].innerText;
    return item;
}

function GetFanCardsTag() {
    // 获取粉丝卡片 Element list
    return Array.from(document.getElementsByClassName(FanCard_ClassName));
}

function GetFanCardsItems() {
    // 获取粉丝卡片data-item
    const cards = GetFanCardsTag();
    const cardsItems = [];
    for (let i = 0; i < cards.length; i++) {
        cardsItems[i] = ParseFanCardTag(cards[i]);
    }
    return cardsItems;
}

async function GetFanCardsTotal() {
    // 获取用户装扮数量
    const cookies = await contentPage("GetCookies", {"type": "json"});
    let res = await contentPage("GetMyFanCards", {ps: 1, pn: 1});
    if (res["code"] !== 0) {
        return {code: -1, message: res["message"]};
    } else {
        const total = res["data"]["page"]["total"] || 0;
        return {code: 0, uid: cookies["DedeUserID"], total: total};
    }
}

function GetFanCardsList(total) {
    // 获取粉丝卡片了表情[网络]
    function parseItem(item) {
        // 解析粉丝卡片item
        const properties = item["item"]["properties"];
        return {
            "name": item["item"]["name"],
            "item_id": item["item"]["item_id"],
            "number": item["fan"]["number"],
            "date": item["fan"]["date"],
            "own_num": item["own_num"],
            "time_begin": parseInt(properties["sale_time_begin"]) || -1,
            "fan_share_image": properties["fan_share_image"],
            "image_cover": properties["image_cover"],
        };
    }

    return new Promise(async function(resolve, _) {
        const pns = Math.ceil(total / UpdateFanCardsRequestCount);
        let http_list = [];
        for (let i = 0; i < pns; i++) {
            http_list[i] = await contentPage("GetMyFanCards", {
                pn: i+1, ps: UpdateFanCardsRequestCount,
            });
        }
        Promise.all(http_list).then(async function(response_array) {
            let items = [];
            let n = 0;
            for (let i = 0; i < response_array.length; i++) {
                const array = response_array[i]["data"]["list"] || [];
                for (let i = 0; i < array.length; i++) {
                    items[n] = parseItem(array[i]);
                    n += 1;
                }
            }
            resolve(items);
        });
    });
}

function CreateFanCard(item) {
    function CreateFanCardText(class_name, text) {
        // 创建文本内容
        const span = document.createElement("span");
        span.className = class_name;
        span.innerText = text;
        return span
    }

    function CreateFanCardImage(src) {
        // 创建粉丝卡片图片
        const img = document.createElement("img");
        img.src = src;
        return img;
    }

    function padNumber(num, len, s="0") {
        // 数字补齐
        return (Array(len).join(s) + `${num}`).slice(-len);
    }

    const card = document.createElement("li");
    card.draggable = true;
    card.className = FanCard_ClassName;
    card.id = item["item_id"];

    const content = document.createElement("div");
    content.className = "fan-card-content";

    const fanCardNumber = padNumber(item["number"], 6);
    const fanCardOwnNum = padNumber(item["own_num"], 3);

    content.append(CreateFanCardText(FanCardName_ClassName, item["name"]));
    content.append(CreateFanCardText(FanCardNumberText_ClassName, "FANS NO."));
    content.append(CreateFanCardText(FanCardNumber_ClassName, fanCardNumber));
    content.append(CreateFanCardText(FanCardDateText_ClassName, "DATE"));
    content.append(CreateFanCardText(FanCardDate_ClassName, item["date"]));
    content.append(CreateFanCardText(FanCardOwnNum_ClassName, fanCardOwnNum));
    content.append(CreateFanCardImage(item["fan_share_image"]));

    content.dataset["cover"] = item["image_cover"];
    item["date_number"] = new Date(item["date"]).valueOf();

    delete item["date"];
    delete item["image_cover"];
    delete item["fan_share_image"];

    content.dataset["item"] = JSON.stringify(item);

    card.append(content);
    return card;
}

function SetFanCards2Page(items) {
    // 设置粉丝卡片到页面
    const root = document.getElementById(FanCardsList_Id);
    root.innerHTML = "";
    for (let i = 0; i < items.length; i++) {
        root.append(CreateFanCard(items[i]));
    }
    return root;
}

async function SaveItems2Local(uid, total) {
    // 保存粉丝卡片数据到本地
    const local = await getLocalContent("fan-cards") || {};
    local["items"] = GetFanCardsItems();
    uid ? local["uid"] = uid : null;
    total ? local["total"] = total : null;
    await setLocalContent({"fan-cards": local});
}

async function BuildFanCards(handle=null, double=false) {
    const local = await getLocalContent("fan-cards", {});
    const user = await GetFanCardsTotal();

    local.items = local.items || [];
    if (user.code !== 0) {
        console.log(user["message"]);
        return 
    }

    const exp1 = (user.uid === local.uid);
    const exp2 = (user.total === local.total);
    const exp3 = (Boolean(local.items));
    const exp4 = (user.total === local.items.length);
    const expAll = (exp1 && exp2 && exp3 && exp4)

    if (FromLocalUpdateFanCards && expAll) {
        console.log("本地存在, 从本地更新到页面");
        SetFanCards2Page(local.items);
    } else {
        console.log("本地不存在, 从网络更新到页面");
        const items = await GetFanCardsList(user.total);
        SetFanCards2Page(items);
    }

    const tags = GetFanCardsTag();
    for (let i = 0; i < tags.length; i++) {
        tags[i][double ? "ondblclick": "onclick"] = handle;
    }

    if (FanCardsListSaveLocal && !expAll) {
        console.log("保存数据到本地");
        await SaveItems2Local(user.uid, user.total);
    }
}

document.getElementById(FanCardsSearch_Id).onchange = async function() {
    // 搜索并且定位
    if (this.value === "") {
        return null;
    }

    const root = document.getElementById(FanCardsList_Id);
    const fanCardsList = root.childNodes;
    for (let i = 0; i < fanCardsList.length; i++) {
        const item = ParseFanCardTag(fanCardsList[i]);
        if (item["name"].indexOf(this.value) !== -1) {
            window.location.hash = `#${item["item_id"]}`;
            return null;
        }
    }
};
