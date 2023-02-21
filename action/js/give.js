const VerifyFanNumber = false;

async function verifyFanNumber(item) {
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

    return finish;
}

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
        const uid = this.dataset["uid"];
        await MessageInfo({message: `[${uid}]`});
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
function SetUserTags2Page(followersList) {
    const root = document.getElementById("user-list");
    for (let i = 0; i < followersList.length; i++) {
        const tag = createUserTag(followersList[i]);
        root.append(tag);
    }
}

async function LoadScrollHandler() {
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
            root.append(createUserTag(res["card"]));
        } else {
            await MessageInfo({message: "UID格式不正确"});
            return null;
        }
    }
}

(async function() {
    await LoadScrollHandler();

    const item = JSON.parse(decodeURIComponent(getQueryString("data")));
    createBackButton("back", item, false);

    if (VerifyFanNumber) {
        const verify = verifyFanNumber(item);
        if (await verify === false) {
            await MessageInfo({message: "验证不通过, 将返回上一页"});
            document.getElementById("back").click();
            return null
        }
    }
})()


document.getElementById("give-share-fan-number").onclick = async function() {
    const item = JSON.parse(decodeURIComponent(getQueryString("data")));
    const res = await contentPage("BuildFanNumberShareUrl", item);
    if (res["code"] !== 0) {
        await MessageInfo({message: res["message"]});
        return null;
    }

    const share_param = res["data"]["share_param"];
    const url = "https://www.bilibili.com/h5/mall/share/receive"
    let shareUrl = `${url}/${item["item_id"]}?${share_param}`;

    const res1 = await contentPage("BuildShortLinkUrl", {url: shareUrl});
    if (res1["code"] === 0) {
        await MessageInfo({message: `无法生成短链接\n${res1["message"]}`});
    }
    if (!res1["data"]["content"]) {
        await MessageInfo({message: `无法生成短链接\n${res1["message"]}`});
    }
    shareUrl = res1["data"]["content"];
    navigator.clipboard.writeText(shareUrl).then(
        async function() {
            await MessageInfo({message: "链接已复制到剪贴板"});
        },
        async function() {
            await MessageInfo({message: `无法复制到剪贴板\n交易链接:\n${shareUrl}`});
        }
    );
}

document.getElementById("give-others-fan-number").onclick = async function() {
    await MessageInfo({message: "此方法无法撤回"});
}
