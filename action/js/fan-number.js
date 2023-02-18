
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
        alert(res["message"]);
        return null;
    }

    // const test = [];
    // let t = 0
    //
    const fanNumberList = res["data"]["list"] || [];
    //
    // for (let i = 0; i < fanNumberList.length; i++) {
    //     test[t] = fanNumberList[i]
    //     t += 1
    // }
    // for (let i = 0; i < fanNumberList.length; i++) {
    //     test[t] = fanNumberList[i]
    //     t += 1
    // }

    SetFanNumberList(fanNumberList, item_id);
    // SetFanNumberList(test, item_id)
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
        console.log("未选择或选择多个")
        return null
    }
    if (choose[0].classList.contains(FanNumberStataShow_ClassName)) {
        console.log("不能选择正在展示的编号")
        return null
    }
    const item = JSON.parse(choose[0].dataset["item"]);

    const value = {"item_id": item["item_id"], "num": item["fan_num"]};
    const res = await contentPage("ShowFanNumToCard", value);
    if (res["code"] !== 0) {
        alert(res["message"]);
        return null;
    }

    // 这里写更新库存
}