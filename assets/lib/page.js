
function createBackButton(ElementId, double=false) {
    // 更新返回按钮
    const root = document.getElementById(ElementId);
    if (!root) {
        return false
    }
    root[double ? "ondblclick": "onclick"] = function() {
        const from = getQueryString("from") || "popup.html";
        const from_list = from.split(",");

        const go_url = from_list[from_list.length-1];
        const from_url = from_list.slice(0,-1).join(",");

        console.log(`${go_url}?from=${from_url}`);
        location.replace(`${go_url}?from=${from_url}`);
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

async function AlertMessage(detail={}, style={}) {
    const window = document.createElement("div");
    window.style.position = "absolute";
    window.style.textAlign = "center";
    window.style.opacity = "0";
    window.innerText = detail.message;

    window.style.fontSize = style.fontSize || "16px";
    window.style.fontWeight = style.fontWeight || "bold";

    window.style.background = style.background || "#202020";
    window.style.color = style.color || "#ffffff";

    window.style.top = style.top || "50%";
    window.style.maxWidth = style.maxWidth || "200px";

    document.body.appendChild(window);

    let marginLeft = getComputedStyle(document.body).marginLeft;
    marginLeft = parseInt(marginLeft.slice(0, marginLeft.length - 2));
    const windowLeft = document.body.clientWidth - window.clientWidth
    window.style.left = (windowLeft / 2 + marginLeft).toString() + "px";

    // 显示
    async function showMessage(timeout) {
        let i = 0;
        let timer = null;
        function change() {
            i += 1;
            window.style.opacity = (i / 100).toString();
            if (i >= 100) {
                clearTimeout(timer);
                return false;
            }
            timer = setTimeout(function() {
                change();
            }, timeout)
        }
        return change();
    }

    async function removeMessage(timeout) {
        let i = 100;
        let timer = null;
        function change() {
            i -= 1;
            window.style.opacity = (i / 100).toString();
            if (i <= 0) {
                clearTimeout(timer);
                document.body.removeChild(window);
                return false;
            }
            timer = setTimeout(function() {
                change();
            }, timeout)
        }
        return change();
    }

    await showMessage(detail["ShowStep"] || 0.1);
    await sleepTime(detail["ShowTime"] || 2000);
    await removeMessage(detail["RemoveStep"] || 1);
}
