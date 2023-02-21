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
    return content[key] || "";
}

function sleepTime(time) {
    // 等待时间
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, time);
    });
}

function formatTime(time, format) {
    // 格式化时间
    const date = new Date(time * 1000);

    const YY = date.getFullYear();
    const MM = (date.getMonth() + 1 < 10 ? '0'+(date.getMonth() + 1) : date.getMonth() + 1);
    const DD = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate());
    const hh = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours());
    const mm = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes());
    const ss = (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds());
    format = format.replace("Y", YY.toString());
    format = format.replace("M", MM.toString());
    format = format.replace("D", DD.toString());
    format = format.replace("h", hh.toString());
    format = format.replace("m", mm.toString());
    format = format.replace("s", ss.toString());
    return format
}

function ParseUrlQueryData() {
    const data = getQueryString("data");
    const deData = decodeURIComponent(data);
    try {
        return JSON.parse(deData);
    } catch (err) {
        return null;
    }
}
