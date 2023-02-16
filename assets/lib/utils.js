function getQueryString(key) { 
    const param_text = window.location.search;
    if (!param_text) {
        return null;
    };
    const param = param_text.substring(1);
    var items = param.split("&");
    const content = {};
    for (let i = 0; i < items.length; i++) {
        const key = items[i].split("=")[0];
        const value = items[i].split("=")[1];
        content[key] = value;
    }
    return content[key];
};
