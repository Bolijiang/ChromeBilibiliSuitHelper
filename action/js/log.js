function createOutTag(item, item_id) {
    function padNumber(num, len) {
        return (Array(len).join("0") + `${num}`).slice(-len);
    }

    const content = document.createElement("li");

    const text1 = document.createElement("span");
    text1.className = "text_1";
    text1.innerText = "送出";

    const fan_number = document.createElement("span");
    fan_number.className = "fan-number";
    fan_number.innerText = padNumber(item["fan_num"], 6);

    content.append(text1);
    content.append(fan_number);

    if (item["present_mid"] !== item["get_mid"]) {
        const get_time = document.createElement("span");
        get_time.className = "get-time";
        get_time.innerText = formatTime(item["get_time"], "Y-M-D h:m:s");

        const text2 = document.createElement("span");
        text2.className = "text_2";
        text2.innerText = "被领取";

        const text3 = document.createElement("span");
        text3.className = "text_3";
        text3.innerText = "领取者";

        const get_name = document.createElement("span");
        get_name.className = "get-name";
        get_name.innerText = item["get_name"];
        get_name.dataset["mid"] = item["get_mid"];
        get_name.onclick = async function() {
            const mid = this.dataset["mid"];
            const relationPromise = contentPage("GetUserRelation", {mid: mid});
            const othersInfoPromise = contentPage("GetOthersInfo", {mid: mid});
            const relationRes = await relationPromise;
            const othersInfoPes = await othersInfoPromise;
            const attribute = relationRes["data"]["be_relation"]["attribute"];
            const mtime = relationRes["data"]["be_relation"]["mtime"];
            const userPage = createUserInfoAsk(othersInfoPes["card"], attribute, mtime);
            await MessageTips({message: userPage, box: "dialog-user"});
        }
        content.append(get_time);
        content.append(text2);
        content.append(text3);
        content.append(get_name);
    }

    const give_link = document.createElement("a");
    give_link.innerText = "查看交易链接";
    give_link.onclick = async function() {
        const share_url = "https://www.bilibili.com/h5/mall/share/receive"
        let shareUrl = `${share_url}/${item_id}?${item["param"]}`;
        const shortRes = await contentPage("BuildShortLinkUrl", {url: shareUrl});
        if (shortRes["code"] !== 0) {
            await MessageInfo({message: shortRes["message"]});
        }
        if (shortRes["code"] === 0) {
            if (!shortRes["data"]["content"]) {
                await MessageInfo({message: `短链接生成失败`});
            }
            shareUrl = shortRes["data"]["content"];
        }
        await MessageTips({message: shareUrl});
    }

    const button = document.createElement("button");
    button.dataset["token"] = item["token"];
    if (item["present_mid"] === item["get_mid"]) {
        button.innerText = "撤回";
        button.disabled = false;
        button.style.cursor = "pointer";
    } else {
        button.innerText = "被领取";
        button.disabled = true;
    }
    button.onclick = async function() {
        const token = this.dataset["token"];
        const res = await contentPage("CancelOutFanNumber", {"token": token});
        if (res["code"] !== 0) {
            await MessageInfo({message: res["message"]});
        } else {
            await MessageInfo({message: "撤回赠送成功"});
        }
    }
    content.append(give_link);
    content.append(button);
    return content;
}

async function LoadLogList(item_id) {
    const ps = 20;
    let type = "out";
    let no_more = true;
    let pn = 0;

    async function getOutFanNumberList() {
        const res = await contentPage("GetOutFanNumberList", {"item_id": item_id});

        if (res["code"] !== 0) {
            await MessageInfo({message: res["message"]});
            return [];
        }

        const return_list = [];
        let ii = 0

        const content_list = res["data"]["list"] || [];
        for (let i = 0; i < content_list.length; i++) {
            const list = content_list[i]["list"] || [];
            const token = content_list[i]["present_token"];
            const param = content_list[i]["share_param"];
            for (let i = 0; i < list.length; i++) {
                list[i]["token"] = token;
                list[i]["param"] = param;
                return_list[ii] = list[i];
                ii += 1
            }
        }
        return return_list
    }

    async function appendLogs() {
        let res

        if (type === "out") {
            res = await getOutFanNumberList();
        } else {
            res = await getOutFanNumberList();
        }

        const root = document.getElementById("log-list");
        for (let i = 0; i < res.length; i++) {
            root.append(createOutTag(res[i], item_id));
        }
    }

    await appendLogs();

    document.getElementById("log-list-scroll").onscroll = async function() {
        if (!no_more) {
            const scrollHeight = this.scrollHeight;
            const scrollTop = this.scrollTop;
            const clientHeight = this.clientHeight;

            if (clientHeight + scrollTop >= scrollHeight) {
                await appendLogs();
            }
        }
    }

    document.getElementById("replace").onclick = async function() {
        if (this.dataset["type"] === "out") {
            this.dataset["type"] = "get";
            type = "get";
        } else {
            this.dataset["type"] = "out";
            type = "out";
        }
        document.getElementById("log-list").innerHTML = "";
        await appendLogs();
    }
}

(async function() {
    const item = ParseUrlQueryData("data") || {};
    if (!item || !item["item_id"]) {
        await MessageInfo({message: "url参数不正确, 将返回上一页"});
        location.replace(`popup.html`);
        return null;
    }

    createBackButton("back", item, false);

    const suitRes = await contentPage("GetSuitAssets", item);
    if (suitRes["code"] !== 0) {
        await MessageInfo({message: `[${suitRes["message"]}], 将返回上一页`});
        document.getElementById("back").click();
    }
    if (!suitRes["data"]) {
        await MessageInfo({message: "没有此装扮, 将返回上一页"});
        document.getElementById("back").click();
        return null;
    }

    const properties = suitRes["data"]["item"]["properties"];

    document.getElementById("background").src = properties["image_cover"];

    await LoadLogList(item["item_id"]);
})();
