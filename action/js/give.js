async function GetChooseGiveUserId() {
    // 获取选中的用户id
    const user_list = document.getElementsByName("user");
    let mid = null;
    for (let i = 0; i < user_list.length; i++) {
        if (user_list[i].checked === true) {
            mid = user_list[i].previousElementSibling.dataset["uid"];
            break;
        }
    }

    if (mid === null) {
        await MessageInfo({message: "未选择用户"});
        return null;
    }

    return mid;
}

async function getUrlDateItem(auto_back=true) {
    // 获取url的data参数 [return obj or null]
    const item = ParseUrlQueryData() || {};
    if ((!item["item_id"] || !item["fan_num"]) && auto_back) {
        await MessageInfo({message: "url参数不正确, 将返回上一页"});
        document.getElementById("back").click();
        return null;
    }
    return item
}

async function verifyFanNumberInventory(item, auto_back=true) {
    // 验证库存是否存在此编号 [return bool]
    const res = await contentPage("GetMyFanNumInventory", item);
    const fanNumberList = res["data"]["list"] || [];

    const number = item["fan_num"].toString();
    let finish = false;

    for (let i = 0; i < fanNumberList.length; i++) {
        const item = fanNumberList[i];
        const exp1 = (item["buy_mid"] === item["mid"]);
        const exp2 = (item["state"] !== "equip");
        const exp3 = (item["number"].toString() === number);
        if (exp1 && exp2 && exp3) {
            finish = true;
        }
    }

    if (finish === false && auto_back) {
        await MessageInfo({message: `[${item["fan_num"]}]库存验证不通过, 将返回上一页`});
        document.getElementById("back").click();
        return null;
    }

    return finish;
}

async function getVerifySuitAssets(item, auto_back=true) {
    // 验证所选编号和装扮会话 [return null or obj]
    const suitAssetsPromise = contentPage("GetSuitAssets", item);
    await MessageInfo({message: "确认所选编号是否正确", WaitTime: 1000});
    const suitAssetsRes = await suitAssetsPromise;
    if (suitAssetsRes["code"] !== 0) {
        await MessageInfo({message: suitAssetsRes["message"]});
        return null;
    }
    if (!suitAssetsRes["data"] && auto_back) {
        await MessageInfo({message: "没有此装扮, 将返回上一页"});
        document.getElementById("back").click();
        return null;
    }
    return suitAssetsRes["data"]["item"] || {};
}

async function LoadUserList() {
    // 加载用户列表
    function SetUserTags2Page(followersList) {
        function createUserTag(item) {
            const content = document.createElement("li");
            content.className = "user";
            content.onclick = async function() {
                const radio = this.getElementsByTagName("input")[0];
                radio.checked = true;
            }
            const face = document.createElement("img");
            face.src = item["face"];
            const name = document.createElement("span");
            name.innerText = item["uname"] || item["name"];
            const info = document.createElement("a");
            info.dataset["uid"] = item["mid"].toString();
            info.innerText = "详情";
            info.onclick = async function() {
                const mid = this.dataset["uid"];
                const relationPromise = contentPage("GetUserRelation", {mid: mid});
                const othersInfoPromise = contentPage("GetOthersInfo", {mid: mid});
                const relationRes = await relationPromise;
                const othersInfoPes = await othersInfoPromise;
                const attribute = relationRes["data"]["be_relation"]["attribute"];
                const mtime = relationRes["data"]["be_relation"]["mtime"];
                const userPage = createUserInfoAsk(othersInfoPes["card"], attribute, mtime);
                await MessageTips({message: userPage, box: "dialog-user"});
            }
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "user";
            content.append(face);
            content.append(name);
            content.append(info);
            content.append(radio);
            return content
        }

        const root = document.getElementById("user-list");
        for (let i = 0; i < followersList.length; i++) {
            const tag = createUserTag(followersList[i]);
            root.append(tag);
        }
    }

    const ps = 20;
    let no_more = false;
    let pn = 0;

    async function appendFollowers() {
        pn += 1;
        const res = await contentPage("GetMyFollowers", {ps: ps, pn: pn});
        if (res["code"] !== 0) {
            await MessageInfo({message: res["message"]});
            return null;
        }
        if (res["data"]["list"]["length"] === 0) {
            no_more = true;
            return null;
        }
        const followersList = res["data"]["list"] || [];
        SetUserTags2Page(followersList);
    }

    await appendFollowers();

    document.getElementById("user-list-scroll").onscroll = async function() {
        if (!no_more) {
            const scrollHeight = this.scrollHeight;
            const scrollTop = this.scrollTop;
            const clientHeight = this.clientHeight;

            if (clientHeight + scrollTop >= scrollHeight) {
                await appendFollowers();
            }
        }
    }

    document.getElementById("user-search").onchange = async function() {
        const root = document.getElementById("user-list");
        if (!this.value) {
            root.innerHTML = "";
            no_more = false;
            pn = 0;
            await appendFollowers();
            return null;
        }

        if (!isNaN(this.value) && (this.value.indexOf(".") === -1)) {
            const res = await contentPage("GetOthersInfo", {mid: this.value});
            if (res["code"] !== 0) {
                await MessageInfo({message: res["message"]});
                return null;
            }
            root.innerHTML = "";
            SetUserTags2Page([res["card"]]);
        } else {
            await MessageInfo({message: "UID格式不正确"});
            return null;
        }
    }
}

(async function() {
    const item = await getUrlDateItem(true);

    createBackButton("back", item, false);
    await verifyFanNumberInventory(item, true);
    await LoadUserList();
})()


document.getElementById("give-share-fan-number").onclick = async function() {
    // * 常规验证 [url参数是否正确, 编号是否正确]
    const item = await getUrlDateItem(true);
    await verifyFanNumberInventory(item, true);

    // * 弹出装扮,编号信息验证会话
    const suit = await getVerifySuitAssets(item, true);
    if (!suit) {
        return null;
    }

    // * 弹出装扮,粉丝编号 验证会话
    const verifyFanNumberAsk = createFanNumberAsk(suit, item["fan_num"]);
    const suit_judge = await MessageJudge({message: verifyFanNumberAsk, wait_time: 3000, box: "dialog-suit"});
    if (!suit_judge) {
        return null;
    }

    // * 生成分享share_param
    const shareRes = await contentPage("BuildFanNumberShareUrl", item);
    if (shareRes["code"] !== 0) {
        await MessageInfo({message: shareRes["message"]});
        return null;
    }

    // * 拼接领取链接[长链接]
    const share_url = "https://www.bilibili.com/h5/mall/share/receive"
    const share_param = shareRes["data"]["share_param"];
    let shareUrl = `${share_url}/${item["item_id"]}?${share_param}`;

    // * 尝试长链接转短链接
    const shortRes = await contentPage("BuildShortLinkUrl", {url: shareUrl});
    if (shortRes["code"] !== 0) {
        await MessageInfo({message: `无法生成短链接`});
    }
    if (!shortRes["data"]["content"]) {
        await MessageInfo({message: `短链接生成失败`});
    }
    shareUrl = shortRes["data"]["content"];

    // * 尝试写入剪贴板
    await navigator.clipboard.writeText(shareUrl).then(
        async function() {
            await MessageInfo({message: "链接已复制到剪贴板"});
        },
        async function() {
            // 不急慢慢来, 等会改
            await MessageTips({message: `无法复制到剪贴板\n交易链接:\n${shareUrl}`});
        }
    );

    // * 自动返回
    await MessageInfo({message: "将自动返回上一页"});
    document.getElementById("back").click();
}

document.getElementById("give-others-fan-number").onclick = async function() {
    // * 常规验证 [url参数是否正确, 编号是否正确]
    const item = await getUrlDateItem(true);
    await verifyFanNumberInventory(item, true);

    // * 获取选择的用户id
    const mid = await GetChooseGiveUserId();
    if (!mid) {
        return null;
    }
    item["to_mid"] = mid;

    // * 关系验证
    const relationRes = await contentPage("GetUserRelation", {mid: mid});
    if (relationRes["code"] !== 0) {
        await MessageInfo({message: relationRes["message"]});
        return null;
    }

    // 对你的状态
    // 对方关注你的时间
    const attribute = relationRes["data"]["be_relation"]["attribute"];
    const mtime = relationRes["data"]["be_relation"]["mtime"];

    if (attribute !== 1 && attribute !== 2 && attribute !== 6) {
        // 验证选择用户是否关注你
        await MessageInfo({message: "选择的用户未关注你"});
        return null;
    }

    // * 弹出用户信息验证会话
    const othersInfoPes = await contentPage("GetOthersInfo", {mid: mid});
    if (othersInfoPes["code"] !== 0) {
        await MessageInfo({message: othersInfoPes["message"]});
        return null;
    }

    await MessageInfo({message: "确认所选用户是否正确", WaitTime: 1000});

    const userPage = createUserInfoAsk(othersInfoPes["card"], attribute, mtime)
    const user_judge = await MessageJudge(
        {message: userPage, wait_time: 3000, box: "dialog-user"}
    );
    if (!user_judge) {
        return null;
    }

    // * 弹出装扮,粉丝编号 验证会话
    const suit = await getVerifySuitAssets(item, true);
    if (!suit) {
        return null;
    }
    const verifyFanNumberAsk = createFanNumberAsk(suit, item["fan_num"]);
    const suit_judge = await MessageJudge(
        {message: verifyFanNumberAsk, wait_time: 5000, box: "dialog-suit"}
    );
    if (!suit_judge) {
        return null;
    }

    // * 赠送装扮给指定用户
    const giveRes = await contentPage("GiveFanNumToOthers", item);
    if (giveRes["code"] !== 0) {
        // 赠送失败或者其他错误不会自动返回
        await MessageInfo({message: giveRes["message"]});
        return null;
    }
    // 赠送成功自动返回
    await MessageInfo({message: "赠送编号成功"});
    await MessageInfo({message: "赠送编号成功"});
    await MessageInfo({message: "将自动返回上一页"});
    document.getElementById("back").click();
}
