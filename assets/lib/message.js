async function MessageInfo(detail={}, className=null) {
    // 创建一个自动关闭的提示窗口
    const window = document.createElement("div");
    window.classList.add(className || "defaultMessageInfo");
    window.innerText = detail.message;

    const message = new Message(window, detail, "info");
    await message.showWindow();
    await sleepTime(detail["WaitTime"] || 1000);
    await message.hideWindow();
}

async function MessageTips(detail={}, className=null) {
    // 创建一个需用户关闭的提示窗口
    const window = document.createElement("dialog");
    window.classList.add("MessageDialog");
    window.classList.add(className || "defaultMessageDialog");
    const content = document.createElement("div");
    content.className = detail.box || "";
    content.innerHTML = detail.message;
    const button = document.createElement("button");
    button.style.cursor = "default";
    button.disabled = true;
    window.append(content);
    window.append(button);

    const message = new Message(window, detail, "tips");

    message.window.showModal();

    button.onclick = async function() {
        await message.hideWindow();
    }
    await message.showWindow();

    await waitButton(button, detail["ButtonTitle"] || "确认", detail["wait_time"]);
    return new Promise(async function(resolve, _) {
        message.window.onclose = function() {
            resolve(true);
        }
    });
}

async function MessageJudge(detail={}, className=null) {
    // 创建一个询问会话
    const window = document.createElement("dialog");
    window.classList.add("MessageDialog");
    window.classList.add(className || "defaultMessageDialog");
    const content = document.createElement("div");
    content.className = detail.box || "";
    content.innerHTML = detail.message;
    const NoButton = document.createElement("button");
    NoButton.innerText = detail["NoButtonTitle"] || "取消";
    const YesButton = document.createElement("button");
    YesButton.style.cursor = "default";
    YesButton.disabled = true;
    window.append(content);
    window.append(YesButton);
    window.append(NoButton);

    const message = new Message(window, detail, "tips");

    message.window.showModal();
    let return_bool = null;
    YesButton.onclick = async function() {
        await message.hideWindow();
        return_bool = true;
    }
    NoButton.onclick = async function() {
        await message.hideWindow();
        return_bool = false;
    }
    await message.showWindow();

    await waitButton(YesButton, detail["YesButtonTitle"] || "确认", detail["wait_time"]);
    return new Promise(async function(resolve, _) {
        message.window.onclose = function() {
            resolve(return_bool);
        }
    });
}
