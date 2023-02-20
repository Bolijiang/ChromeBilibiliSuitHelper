function getQueryString(key) { 
    const param_text = window.location.search;
    if (!param_text) {
        return null;
    }
    const param = param_text.substring(1);
    let items = param.split("&");
    const content = {};
    for (let i = 0; i < items.length; i++) {
        const key = items[i].split("=")[0];
        content[key] = items[i].split("=")[1];
    }
    return content[key];
}

function sleepTime(time) {
    // 等待时间
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, time);
    });
}