
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

function createLinkButton(ElementId, go_url, double=false) {
    const root = document.getElementById(ElementId);
    if (!root) {
        return false
    }
    root[double ? "ondblclick": "onclick"] = function() {
        const path_list = window.location.pathname.split("/");
        const from_url = getQueryString("from") || "popup.html";
        const index_url = path_list[path_list.length-1];
        location.replace(`${go_url}?from=${from_url},${index_url}`);
    }
    return true
}