// backgroundPage
// reqkey:
    // getAssetListRes: 获取 suit/asset/list 内容
    // getFannumListRes: 获取 user/fannum/list 内容


// contentPage:
// reqkey:
    // getCookies: 获取cookie type->obj
    // postListSort: 应用排序


(async function() {
    // 初始化 || 获取装扮列表[本地或网络]
    const load = await getChromeLoadContent();
    const user = await getUserSuitContent();
    if (user.code == -1) {
        alert(user.message);
        return
    };

    const exp1 = (user.uid == load.uid);
    const exp2 = (user.total == load.total);
    const exp3 = (Boolean(load.items));
    const exp4 = (user.total == load.items.length);

    if (exp1 && exp2 && exp3 && exp4) {
        console.log("本地存在");
        await setItem2Html(load.items, ItemClickHandle);
    } else {
        console.log("本地不存在/不正确, 开始从网络获取");
        await setChromeLocalContent({"total": user.total});
        await setChromeLocalContent({"uid": user.uid});
        setItem2HtmlNet(user.total, 20, ItemClickHandle);
    };
})();


function ItemClickHandle() {
    // 装扮卡片点击事件
    const box = this.getElementsByClassName("fan_card_image_box")[0];
    const item_id = JSON.parse(box.dataset["item"])["item_id"].toString();
    // document.getElementById("suit_content_box").innerHTML = "";

    Promise.all([{
        FannumListRes: backgroundPage("getFannumListRes", {item_id: item_id}),
    }]).then(async values => {
        var res = JSON.parse(await values[0].FannumListRes);
        if (res["code"] == 0) {
            createNumberBox(res["data"]["list"]);
        };
    });
};

document.getElementById("update_items_button").onclick = async function() {
    // 手动更新
    const user = await getUserSuitContent();
    if (user.code == -1) {
        alert(user.message);
        return
    };
    console.log("手动更新, 开始从网络获取");
    await setChromeLocalContent({"total": user.total});
    await setChromeLocalContent({"uid": user.uid});
    setItem2HtmlNet(user.total, 20, ItemClickHandle)
};

document.getElementById("sort_items_button").onclick = async function() {
    // 应用排序
    console.log("应用排序");

    const items = getItems();
    await setChromeLocalContent({"items": items});

    var ids = new Array();
    for (let i = 0; i < items.length; i++) {
        ids[i] = items[i]["item_id"].toString();
    };

    const tryNumber = 5;
    for (let i = 0; i < tryNumber; i++) {
        const res = await contentPage("postListSort", {ids: ids});
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
    return;
};


function sortList(mod, reverse) {
    var items = getItems();
    items.sort(function (a, b) {
        return parseInt(a[mod]) - parseInt(b[mod]);
    });
    if (reverse) {
        items.reverse();
    };
    return items;
};


var sortButoon = document.getElementById("suit_content_sort_button");
var button_list = sortButoon.getElementsByTagName("button");
for (let i = 0; i < button_list.length; i++) {
    button_list[i].onclick = async function() {
        const items = sortList(this.dataset["mod"], false);
        console.log(items);
        await setItem2Html(items, ItemClickHandle);
    };
};
