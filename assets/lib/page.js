function createBackButton(ElementId, data={}, double=false) {
    // 创建返回按钮
    const root = document.getElementById(ElementId);
    if (!root) {
        return false
    }
    const content = encodeURIComponent(JSON.stringify(data));
    root[double ? "ondblclick": "onclick"] = function() {
        const from = getQueryString("from") || "popup.html";
        const from_list = from.split(",");
        const go_url = from_list[from_list.length-1];
        const from_url = from_list.slice(0,-1).join(",");
        location.replace(`${go_url}?from=${from_url}&data=${content}`);
    }
    return true
}

function createLinkButton(ElementId, go_url, data={}, double=false) {
    // 创建连接按钮
    const root = document.getElementById(ElementId);
    if (!root) {
        return false
    }
    const content = encodeURIComponent(JSON.stringify(data));
    root[double ? "ondblclick": "onclick"] = function() {
        const path_list = window.location.pathname.split("/");
        const from_url = getQueryString("from") || "popup.html";
        const index_url = path_list[path_list.length-1];
        location.replace(`${go_url}?from=${from_url},${index_url}&data=${content}`);
    }
    return true
}

function createFanNumberAsk(info, fan_num) {
    // 创建粉丝编号确认会话
    const content = document.createElement("div");

    const cover = document.createElement("img");
    cover.className = "suit-dialog-cover";
    cover.src = info["properties"]["image_cover"];
    const name = document.createElement("a");
    name.className = "suit-dialog-name";
    name.title = info["name"];
    name.innerText = info["name"];
    const item_id = document.createElement("a");
    item_id.className = "suit-dialog-item_id";
    item_id.innerText = `ID: ${info["item_id"]}`;
    const fan_number = document.createElement("a");
    fan_number.className = "suit-dialog-fan_number";
    const fan_number_text = (Array(6).join("0") + `${fan_num}`).slice(-6);
    fan_number.innerText = `编号: ${fan_number_text}`;
    const message = document.createElement("a");
    message.className = "suit-dialog-message";
    message.innerText = "请仔细核对后再点确认";
    content.append(cover);
    content.append(name);
    content.append(item_id);
    content.append(fan_number);
    content.append(message)
    return content.innerHTML;
}

function createUserInfoAsk(info, attribute, mtime) {
    // 创建用户确认会话
    const content = document.createElement("div");
    const face = document.createElement("img");
    face.className = "user-dialog-face";
    face.src = info["face"];
    const name = document.createElement("a");
    name.className = "user-dialog-name";
    name.innerText = info["name"];
    name.title = info["name"];
    const uid = document.createElement("a");
    uid.className = "user-dialog-uid";
    uid.innerText = `UID: ${info["mid"]}`
    const sex = document.createElement("a");
    sex.className = "user-dialog-sex";
    sex.innerText = `性别: ${info["sex"]}`;
    const birthday = document.createElement("a");
    birthday.className = "user-dialog-birthday";
    birthday.innerText = `生日: ${info["birthday"]}`;
    const relational = document.createElement("a");
    relational.className = "user-dialog-relational";
    relational.innerText = "状态: 对方未关注你";
    if (attribute === 1 || attribute === 2) {
        relational.innerText = "状态: 粉丝";
    }
    if (attribute === 6) {
        relational.innerText = "状态: 互相关注";
    }
    if (attribute === 128) {
        relational.innerText = "状态: 已被对方拉黑";
    }
    const follow = document.createElement("a");
    follow.className = "user-dialog-follow";
    if (mtime < info["regtime"]) {
        follow.innerText = "关注时间: 无";
    } else {
        const mtime_Text = formatTime(mtime, "Y-M-D h:m:s");
        follow.innerText = `关注时间: ${mtime_Text}`;
    }
    const registration = document.createElement("a");
    registration.className = "user-dialog-registration";
    const rtime_Text = formatTime(info["regtime"], "Y-M-D h:m:s");
    registration.innerText = `注册时间: ${rtime_Text}`;
    const sign = document.createElement("a");
    sign.className = "user-dialog-sign";
    sign.innerText = `签名: ${info["sign"].replace("\n", "; ")}`;
    sign.title = info["sign"];
    content.append(face);
    content.append(name);
    content.append(uid);
    content.append(sex);
    content.append(birthday);
    content.append(relational);
    content.append(follow);
    content.append(registration);
    content.append(sign);
    return content.innerHTML;
}
