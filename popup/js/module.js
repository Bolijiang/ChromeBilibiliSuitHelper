async function setItem2Html(items, handle) {
    // 本地数据加载列表
    var ul_tag = document.getElementById("fan_card_list");
    ul_tag.innerHTML = "";
    for (let i = 0; i < items.length; i++) {
        const li = createLiTag(items[i], handle);
        ul_tag.append(li);
    };
    await setChromeLocalContent({"items": items});
};

function setItem2HtmlNet(total, ps, handle) {
    // 网络异步加载列表
    const pns = Math.ceil(total / ps);
    console.log(pns);
    var http_list = new Array();
    for (let i = 0; i < pns; i++) {
        http_list[i] = backgroundPage("getAssetListRes", {
            pn: i+1, ps: ps
        });
    };
    PromiseRes(http_list, handle);
};

function PromiseRes(http_list, handle) {
    // 处理请求
    Promise.all(http_list).then(async values => {
        var items = new Array();
        var ii = 0;

        for (let i = 0; i < values.length; i++) {
            const res = JSON.parse(values[i]);
            const array = res["data"]["list"] || null;
            console.log(array);
            if (!array) {
                console.log(i, res["message"]);
                continue;
            };
            for (let i = 0; i < array.length; i++) {
                items[ii] = parseItem(array[i]);
                ii += 1;
            };
        };
        await setItem2Html(items, handle);
    });
};

async function getChromeLoadContent() {
    // 获取本地保存数据 type->obj
    return {
        items: await getChromeLocalContent("items") || new Array(),
        uid: await getChromeLocalContent("uid"),
        total: await getChromeLocalContent("total"),
    };
}

async function getUserSuitContent() {
    // 获取 uid 和 装扮总数
    const cookies = await contentPage("getCookies", null);
    if (!cookies["DedeUserID"]) {
        return {code: -1, message: "未登陆"}
    };
    var total_res = await backgroundPage("getAssetListRes", {ps: 1, pn: 1});
    var json = JSON.parse(total_res);

    if (json["code"] != 0) {
        return {code: -1, message: json["message"]};
    };

    return {
        code: 0,
        cookies: cookies,
        uid: cookies["DedeUserID"],
        total: json["data"]["page"]["total"],
    };
};
