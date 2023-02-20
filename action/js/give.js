

document.getElementById("give-share-fan-number").onclick = async function() {
    const item = JSON.parse(decodeURIComponent(getQueryString("data")));

    const res = await contentPage("BuildFanNumberShareUrl", item);
    if (res["code"] !== 0) {
        await AlertMessage({message: res["message"]});
        return null;
    }
    const share_param = res["data"]["share_param"];
    const url = "https://www.bilibili.com/h5/mall/share/receive"
    let shareUrl = `${url}/${item["item_id"]}?${share_param}`;

    const res1 = await contentPage("BuildShortLinkUrl", {url: shareUrl});
    if (res1["code"] === 0) {
        await AlertMessage({message: `无法生成短链接\n${res1["message"]}`});
    }
    if (!res1["data"]["content"]) {
        await AlertMessage({message: `无法生成短链接\n${res1["message"]}`});
    }
    shareUrl = res1["data"]["content"];
    navigator.clipboard.writeText(shareUrl).then(
        async function() {
            await AlertMessage({message: "链接已复制到剪贴板"});
        },
        async function() {
            await AlertMessage({message: `无法复制到剪贴板\n交易链接:\n${shareUrl}`});
        }
    );
}
