
function updateBackButton(ElementId, double=false) {
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
