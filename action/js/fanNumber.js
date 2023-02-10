async function setfanNumber(item) {
    // 设置所有库存编号
    var res = await contentPage("getMyFannumListRes", {item_id: item["item_id"]});
    console.log(res);
    if (res["code"] == 0) {
        setFanNumberOption(res["data"]["list"] || new Array(), item["item_id"]);
    } else {
        alert(res["message"]);
    };
};

function updaterChooseFanNumber() {
    // 更新选中编号
    if (this.classList.contains(FanNumberItemChoose_ClassName)) {
        this.classList.remove(FanNumberItemChoose_ClassName);
    } else {
        this.classList.add(FanNumberItemChoose_ClassName);
    };
};

function setFanNumberOption(number_list, item_id) {
    // 设置单个编号
    const root = document.getElementById(FanNumberItem_Id);
    root.innerHTML = "";

    for (let i = 0; i < number_list.length; i++) {
        const item = number_list[i];
        var tag = document.createElement("a");
        tag.innerText = padNumber(item["number"], 6);

        if (item["state"] == "equip") {
            tag.className = FanNumberItemShow_ClassName;
            // tag.classList.add(FanNumberItemShow_ClassName);
            root.append(tag);
            continue;
        };

        if (item["mid"] == item["buy_mid"]) {
            tag.className = FanNumberItemYes_ClassName;
            // tag.classList.add(FanNumberItemYes_ClassName);
        } else {
            tag.className = FanNumberItemNo_ClassName;
            // tag.classList.add(FanNumberItemNo_ClassName);
        };

        item["item_id"] = item_id;
        item["fan_num"] = item["number"];
        delete item["source"];
        delete item["state"];
        delete item["buy_mid"];
        delete item["mid"];
        delete item["number"];

        tag.dataset["item"] = JSON.stringify(item);
        tag.onclick = updaterChooseFanNumber;
        root.append(tag);
    };
};
