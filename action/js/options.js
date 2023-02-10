document.getElementById(OpacityRange_Id).onchange = async function() {
    // 设置背景透明度
    const root = document.getElementById(ChooseItemBoxBg_Id);
    root.style.opacity = parseInt(this.value) / 100;
};

document.getElementById(MainBoxOption_Id).onchange = async function() {
    // 选择显示内容
    const index = this.options.selectedIndex;
	const value = this.options[index].value;

    const root = document.getElementById(ChooseItemBox_Id);
    const item = JSON.parse(root.dataset["item"]);
    

    if (value == "fanNumber"){
        await setfanNumber(item);
    };
};

document.getElementById(SuitReverseButton_Id).onclick = async function() {
    // 列表反向
    const items = getCardItems();
    items.reverse();
    await setCardsList(items);

    if (SuitListLocalAutoSave == true) {
        console.log("更新本地 cards [uid, total, items]");
        const load = await getLocalContent("cards") || {};
        load["items"] = items;
        await setLocalContent({"cards": load});
    };
};

document.getElementById(SuitSearchButton_Id).onclick = async function() {
    // 搜索并且定位
    const ul = document.getElementById(CardItemsListId);
    const lis = ul.getElementsByTagName("li");

    var searchName = prompt("输入关键词");

    for (let i = 0; i < lis.length; i++) {
        const item = getFanCardItemJson(lis[i]);
        if (item["name"].indexOf(searchName) != -1) {
            window.location.hash = `#suit-item-id-${item["item_id"]}`;
            return
        };
    };
    alert("无此装扮");
};


document.getElementById("update-suit-list").onclick = async function() {
    // 更新装扮列表
    console.log("手动更新, 开始从网络获取");

    const user = await getMySuitTotal();
    if (user.code == -1) {
        alert(user.message);
        return
    };

    var amount = document.getElementById(SuitAmountId);
    amount.innerText = `共${user.total}套`;

    const items = await getCardsList(user.total);
    await setCardsList(items);
    console.log("更新本地 cards [uid, total, items]");
    await setLocalContent({"cards": {
        uid: user.uid, total: user.total, items: items,
    }});
};

document.getElementById("apply-suit-list").onclick = async function() {
    // 应用排序
    const items = getCardItems();

    const load = await getLocalContent("cards") || {};
    load["items"] = items;
    await setLocalContent({"cards": load});

    var ids = new Array();
    for (let i = 0; i < items.length; i++) {
        ids[i] = items[i]["item_id"].toString();
    };

    for (let i = 0; i < sortTryNumber; i++) {
        const res = await contentPage("postMySuitListSortRes", {ids: ids});
        if (res["code"] == -101) {
            alert(res["message"]);
            return
        };
        if (res["code"] == 0) {
            alert("操作成功");
            return
        };
        console.log(i, res["message"]);
    };

    alert(`try [${tryNumber}] failed`);
    return
};

document.getElementById("suit-list-sort-option").onchange = async function() {
    // 排序方式
    const index = this.options.selectedIndex;
	const value = this.options[index].value;
    if (!value) {
        return
    };

    const items = getCardItems();
    items.sort(function (a, b) {
        return parseInt(a[value]) - parseInt(b[value]);
    });

    if (SuitListLocalAutoSave == true) {
        console.log("更新本地 cards [uid, total, items]");
        const load = await getLocalContent("cards") || {};
        load["items"] = items;
        await setLocalContent({"cards": load});
    }

    await setCardsList(items);
};


document.getElementById(GiveFanNumberUser_Id).onclick = async function() {
    // 粉丝编号赠送
    var choose_items = document.getElementsByClassName("fan-number-item-choose");
    if (choose_items.length == 0 || choose_items.length > 1) {
        alert("未选择编号 或 选择数量超过1个");
        return null;
    };

    if (choose_items[0].classList.contains(FanNumberItemNo_ClassName)) {
        alert("选择的编号为不可赠送编号");
        return null;
    };

    var to_mid = prompt("输入获赠人Uid");

    const item = JSON.parse(choose_items[0].dataset["item"]);
    item["to_mid"] = to_mid

    var msg = `确定把${item["item_id"]}的${item["fan_num"]}号送给${item["to_mid"]}吗?`

    if (!confirm(msg)){
        return null;
    };

    var res = await contentPage("postGiveFannumToUser", item);
    console.log(res);

    if (res["code"] == 0) {
        alert("赠送成功");
    } else {
        alert(res["message"]);
    };
};

document.getElementById(UpdateFanNumberList_Id).onclick = async function() {
    // 更新列表
    console.log("更新粉丝编号库存");
    const root = document.getElementById(ChooseItemBox_Id);
    const item = JSON.parse(root.dataset["item"]);
    await setfanNumber(item);
    if (updateAutoFanCard) {
        document.getElementById(UpdateSuitList_Id).click();
    };
};

document.getElementById(ShowFanNumber_Id).onclick = async function() {
    // 更换编号展示到卡面
    var choose_items = document.getElementsByClassName("fan-number-item-choose");
    if (choose_items.length == 0 || choose_items.length > 1) {
        alert("未选择编号 或 选择数量超过1个");
        return null;
    };
    const item = JSON.parse(choose_items[0].dataset["item"]);
    item["num"] = item["fan_num"];
    delete item["fan_num"];

    var res = await contentPage("postShowFanNumberRes", item);
    console.log(res);
    if (res["code"] == 0) {
        alert("展示到卡面成功");
    } else {
        alert(res["message"]);
    };
    document.getElementById(UpdateFanNumberList_Id).click();
};
