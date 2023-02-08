function createSpanTag(class_name, text) {
    // 创建<span>标签
    var span = document.createElement("span");
    span.className = class_name;
    span.innerText = text;
    return span
};

function createLiTag(item, handle) {
    // 创建<li class="fan_card">标签
    var li = document.createElement("li");
    li.className = "fan_card";
    li.draggable = "true";
    li.onclick = handle;

    var img = document.createElement("img");
    img.src = item["fan_share_image"];

    var div = document.createElement("div");
    div.className = "fan_card_image_box";
    div.dataset["item"] = JSON.stringify(item);

    div.append(createSpanTag("fan_card_name", item["name"]));
    div.append(createSpanTag("fan_card_number_text", "FANS NO."));
    div.append(createSpanTag("fan_card_number", padNumber(item["number"], 6)));
    div.append(createSpanTag("fan_card_date_text", "DATE"));
    div.append(createSpanTag("fan_card_date", item["date"]));
    div.append(createSpanTag("fan_card_own_num", padNumber(item["own_num"], 3)));
    div.append(img);
    li.append(div);

    return li;
};


function createNumberA(class_name, number) {
    // 创建<a>标签
    var a = document.createElement("a");
    a.className = class_name;
    a.innerText = padNumber(number, 6);
    return a
};

function createNumberBox(number_list) {
    // 创建库存编号盒子
    var root = document.getElementById("suit_content_buy_number");
    root.innerHTML = "";

    for (let i = 0; i < number_list.length; i++) {
        const item = number_list[i];
        if (item["source"] == "kuji_2") {
            var tag = createNumberA("suit_content_buy_number_no", item["number"]);
        } else {
            var tag = createNumberA("suit_content_buy_number_yes", item["number"]);
        };
        tag.dataset["buy_mid"] = item["buy_mid"].toString();
        root.append(tag);
    };
};
