function CountCenterTopAndLeft(window) {
    let marginLeft = getComputedStyle(document.body).marginLeft;
    marginLeft = parseInt(marginLeft.slice(0, marginLeft.length - 2));
    const windowLeft = document.body.clientWidth - window.clientWidth;
    let marginTop = getComputedStyle(document.body).marginTop;
    marginTop = parseInt(marginTop.slice(0, marginTop.length - 2));
    const windowTop = document.body.clientHeight - window.clientHeight;
    return {left: windowLeft / 2 + marginLeft, top: windowTop / 2 + marginTop}
}

async function waitButton(button, title, detail) {
    let wait_time = detail["wait_time"] || 0;
    let timer = null;
    let i = Math.floor(wait_time / 1000);
    function change() {
        button.innerText = i.toString();
        button.disabled = true;

        if (i <= 0) {
            clearTimeout(timer);
            button.disabled = false;
            button.innerText = title;
            button.style.cursor = "pointer";
            return false;
        }
        timer = setTimeout(function() {
            change();
        }, 1000);
        i -= 1;
    }
    return change();
}

async function showWindow(window, detail, obj, type="info") {
    const show_time = detail["ShowTime"] || 300;
    const show_step = detail["ShowStep"] || 50;

    const opacity_step = 1 / show_step;
    const timeout = show_time / show_step;

    const spanStep = detail["spanStep"] || 10;
    const span = document.body.clientHeight / spanStep;

    let StartTop = span + (detail["offset"] || 0);

    if (type === "info") {
        StartTop = obj.top + span + (detail["offset"] || 0);
        window.style.left = obj.left.toString() + "px";
    }

    window.style.top = StartTop.toString() + "px";

    let opacity = 0;
    let timer = null;
    function change() {
        opacity += opacity_step;
        StartTop -= span / show_step;
        window.style.opacity = opacity.toString();
        window.style.top = StartTop.toString() +"px";
        if (opacity >= 1) {
            clearTimeout(timer);
            return false;
        }
        timer = setTimeout(function() {
            change();
        }, timeout)
    }
    return change();
}

async function hideWindow(window, detail, obj, type="info") {
    const hide_time = detail["HideTime"] || 300;
    const hide_step = detail["HideStep"] || 50;

    const opacity_step = 1 / hide_step;
    const timeout = hide_time / hide_step;

    const spanStep = detail["spanStep"] || 10;
    const span = document.body.clientHeight / spanStep;

    let StartTop = 0;

    if (type === "info") {
        StartTop = obj.top + (detail["offset"] || 0);
    }

    let opacity = 1;
    let timer = null;
    function change() {
        opacity -= opacity_step;
        StartTop += span / hide_step;
        window.style.opacity = opacity.toString();
        window.style.top = StartTop.toString() +"px";
        if (opacity <= 0) {
            clearTimeout(timer);
            if (type !== "info") {
                window.close();
            }
            document.body.removeChild(window);
            return false;
        }
        timer = setTimeout(function() {
            change();
        }, timeout)
    }
    return change();
}

// ------------------------------------------------------------------------------

function createBackButton(ElementId, data={}, double=false) {
    // 更新返回按钮
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

function createSuitFanNumberInfoPage(info, fan_num) {
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

function createUserInfoPage(info, attribute, mtime) {
    // 生成用户确认
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

async function MessageInfo(detail={}, className=null) {
    const window = document.createElement("div");
    window.classList.add(className || "defaultMessageInfo");

    window.innerText = detail.message;
    document.body.appendChild(window);

    const CountObj = CountCenterTopAndLeft(window);

    await showWindow(window, detail, CountObj, "info");
    await sleepTime(detail["WaitTime"] || 1000);
    await hideWindow(window, detail, CountObj, "info");
}

async function MessageTips(detail={}, className=null) {
    const window = document.createElement("dialog");
    window.classList.add("MessageDialog");
    window.classList.add(className || "defaultMessageDialog");

    const content = document.createElement("div");
    content.className = detail.box || "dialog-user";
    content.innerHTML = detail.message;

    const button = document.createElement("button");
    button.style.cursor = "default";
    button.disabled = true;

    window.append(content);
    window.append(button);
    document.body.appendChild(window);

    window.showModal();

    const CountObj = CountCenterTopAndLeft(window);
    button.onclick = async function() {
        await hideWindow(window, detail, CountObj, "tips");
    }

    await showWindow(window, detail, CountObj, "tips");

    await waitButton(button, "确认", detail);

    return new Promise(async function(resolve, _) {
        window.onclose = function() {
            resolve(true);
        }
    });
}

async function MessageJudge(detail={}, className=null) {
    const window = document.createElement("dialog");
    window.classList.add("MessageDialog");
    window.classList.add(className || "defaultMessageDialog");

    const content = document.createElement("div");
    content.className = detail.box || "dialog-user";
    content.innerHTML = detail.message;

    const NoButton = document.createElement("button");
    NoButton.innerText = "取消";

    const YesButton = document.createElement("button");
    YesButton.style.cursor = "default";
    YesButton.disabled = true;

    window.append(content);
    window.append(YesButton);
    window.append(NoButton);
    document.body.appendChild(window);

    window.showModal();

    let return_bool = null;

    const CountObj = CountCenterTopAndLeft(window);
    YesButton.onclick = async function() {
        await hideWindow(window, detail, CountObj, "tips");
        window.close();
        document.body.removeChild(window);
        return_bool = true;
    }
    NoButton.onclick = async function() {
        await hideWindow(window, detail, CountObj, "tips");
        window.close();
        document.body.removeChild(window);
        return_bool = false;
    }

    await showWindow(window, detail, CountObj, "tips");

    await waitButton(YesButton, "确认", detail);

    return new Promise(async function(resolve, _) {
        window.onclose = function() {
            resolve(return_bool);
        }
    });
}
