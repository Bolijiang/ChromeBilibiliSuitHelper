(async function() {
    createLinkButton("fan-number-log", "log.html", {}, false);
})();

function SetFanNumberList(number_list, item_id) {
    function padNumber(num, len) {
        return (Array(len).join("0") + `${num}`).slice(-len);
    }
    const root = document.getElementById(FanNumberList_Id);
    root.innerHTML = "";
    for (let i = 0; i < number_list.length; i++) {
        const item = number_list[i];
        const tag = document.createElement("a");
        tag.innerText = padNumber(item["number"], 6);

        if (item["state"] === "equip") {
            tag.className = FanNumberStataShow_ClassName;
            root.append(tag);
            continue;
        }

        if (item["mid"] === item["buy_mid"]) {
            tag.className = FanNumberStataYes_ClassName;
        } else {
            tag.className = FanNumberStataNo_ClassName;
        }

        tag.dataset["item"] = JSON.stringify({
            "item_id": item_id, "fan_num": item["number"]
        });
        tag.onclick = updaterChooseFanNumber;
        root.append(tag);
    }
}

async function SetFanNumber2Page(item_id) {
    const res = await contentPage("GetMyFanNumInventory", {item_id: item_id});
    if (res["code"] !== 0) {
        await AlertMessage({message: res["message"]});
        return null;
    }
    const fanNumberList = res["data"]["list"] || [];
    SetFanNumberList(fanNumberList, item_id);
}

function updaterChooseFanNumber() {
    // 更新选中编号
    if (this.classList.contains(FanNumberStataChoose_ClassName)) {
        this.classList.remove(FanNumberStataChoose_ClassName);
        return null;
    }

    const choose = document.getElementsByClassName(FanNumberStataChoose_ClassName);
    for (let i = 0; i < choose.length; i++) {
        choose[i].classList.remove(FanNumberStataChoose_ClassName);
    }

    this.classList.add(FanNumberStataChoose_ClassName);
}

document.getElementById("show-fan-number").onclick = async function() {
    const choose = document.getElementsByClassName(FanNumberStataChoose_ClassName);
    if ((choose || []).length !== 1) {
        await AlertMessage({message: "未选择或选择多个"});
        return null
    }
    if (choose[0].classList.contains(FanNumberStataShow_ClassName)) {
        await AlertMessage({message: "不能选择正在展示的编号"});
        return null
    }
    const item = JSON.parse(choose[0].dataset["item"]);

    const res = await contentPage("ShowFanNumToCard", item);
    if (res["code"] !== 0) {
        await AlertMessage({message: res["message"]});
        return null;
    }
    document.getElementById("update-fan-cards").click();
    await AlertMessage({message: "展示编号更换成功"});
}

document.getElementById("update-fan-number").onclick = async function() {
    let item_id = document.getElementById("content-box").dataset["item_id"];
    if (!item_id) {
        const fanCardTags = GetFanCardsTag();
        if (fanCardTags.length === 0) {
            return null;
        }
        fanCardTags[0].click();
        item_id = document.getElementById("content-box").dataset["item_id"];
    }
    const res = await contentPage("GetMyFanNumInventory", {item_id: item_id});
    const fanNumberList = res["data"]["list"] || [];
    SetFanNumberList(fanNumberList, item_id);
}

document.getElementById("give-fan-number").onclick = async function() {
    const choose = document.getElementsByClassName(FanNumberStataChoose_ClassName);
    if ((choose || []).length !== 1) {
        await AlertMessage({message: "未选择或选择多个"});
        return null
    }
    if (choose[0].classList.contains(FanNumberStataShow_ClassName)) {
        await AlertMessage({message: "不能选择正在展示的编号"});
        return null
    }
    if (choose[0].classList.contains(FanNumberStataNo_ClassName)) {
        await AlertMessage({message: "不能选择已锁编号"});
        return null
    }
    const item = JSON.parse(choose[0].dataset["item"]);
    createLinkButton("give-fan-number", "give.html", item, false);
    document.getElementById("give-fan-number").click();
}