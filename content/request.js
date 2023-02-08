
function reqAsy(data) {
    // 请求
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(data.method, data.url, true);
        if (data.method == "POST") {
            xhr.setRequestHeader("Content-Type", data["type"] || "");
        };
        xhr.onload = function() {
            if (xhr.status == 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(Error(xhr.statusText));
            };
        };
        xhr.withCredentials = true;
        xhr.send(data["body"] || null);
    });
};

async function postListSort(data) {
    // 应用排序
    var cookies = await getCookies(null);
    var body = `ids=${data.ids.join(",")}&csrf=${cookies["bili_jct"]}`
    return await reqAsy({
        url: "https://api.bilibili.com/x/garb/user/suit/asset/list/sort",
        method: "POST", type: "application/x-www-form-urlencoded", body: body
    });
};
