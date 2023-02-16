function updaterChooseFanNumber() {
    // 更新选中编号
    if (this.classList.contains(FanNumberStataChoose_ClassName)) {
        this.classList.remove(FanNumberStataChoose_ClassName);
    } else {
        this.classList.add(FanNumberStataChoose_ClassName);
    }
}

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

async function SetContent2Page(item_id) {
    // 设置内容到页面

    return Promise.all([
        contentPage("GetMyFanNumInventory", {item_id: item_id}),
    ]).then(function(values) {
        const GetMyFanNumInventoryRes = values[0];
        if (GetMyFanNumInventoryRes["code"] !== 0) {
            alert(GetMyFanNumInventoryRes["message"]);
            return
        }
        const fan_number_list = GetMyFanNumInventoryRes["data"]["list"] || [];
        SetFanNumberList(fan_number_list, item_id);
    });
}
