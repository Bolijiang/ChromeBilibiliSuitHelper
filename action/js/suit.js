const ContentItemBoxBg_Id = "content-item-box-bg"
const ContentBox_Id = "content-box";

const FanNumberList_Id = "fan-number-list";

const BackgroundImageOpacity = 0.6;

const FanNumberStataShow_ClassName = "fan-number-state-show";
const FanNumberStataNo_ClassName = "fan-number-state-no";
const FanNumberStataYes_ClassName = "fan-number-state-yes";
const FanNumberStataChoose_ClassName = "fan-number-state-choose";


function UpdateBackgroundImage(image_url) {
    // 更新背景
    const img = document.getElementById(ContentItemBoxBg_Id);
    img.src = image_url;
    img.style.opacity = BackgroundImageOpacity;
};


function updaterChooseFanNumber() {
    // 更新选中编号
    if (this.classList.contains(FanNumberStataChoose_ClassName)) {
        this.classList.remove(FanNumberStataChoose_ClassName);
    } else {
        this.classList.add(FanNumberStataChoose_ClassName);
    };
};


function SetFanNumberList(number_list, item_id) {
    function padNumber(num, len) {
        return (Array(len).join("0") + `${num}`).slice(-len);
    };
    const root = document.getElementById(FanNumberList_Id);
    root.innerHTML = "";
    for (let i = 0; i < number_list.length; i++) {
        const item = number_list[i];
        var tag = document.createElement("a");
        tag.innerText = padNumber(item["number"], 6);

        if (item["state"] == "equip") {
            tag.className = FanNumberStataShow_ClassName;
            root.append(tag);
            continue;
        };

        if (item["mid"] == item["buy_mid"]) {
            tag.className = FanNumberStataYes_ClassName;
        } else {
            tag.className = FanNumberStataNo_ClassName;
        };

        tag.dataset["item"] = JSON.stringify({
            "item_id": item_id, "fan_num": item["number"]
        });
        tag.onclick = updaterChooseFanNumber;
        root.append(tag);
    };
};

async function SetContent2Page(item_id) {
    // 设置内容到页面
    return Promise.all([
        contentPage("GetMyFanNumInventory", {item_id: item_id}),
    ]).then(function(values) {
        const GetMyFanNumInventoryRes = values[0];
        if (GetMyFanNumInventoryRes["code"] != 0) {
            alert(GetMyFanNumInventoryRes["message"]);
            return
        };
        const fan_number_list = GetMyFanNumInventoryRes["data"]["list"] || new Array();
        SetFanNumberList(fan_number_list, item_id);
    });
};

(async function() {
    await StartLoadFanCards(async function() {
        const item = parseFanCard(this);
        await SetContent2Page(item["item_id"]);

        UpdateBackgroundImage(item["image_cover"]);
        delete item["fan_share_image"];
        delete item["image_cover"];
        const root = document.getElementById(ContentBox_Id);
        root.dataset["item_id"] = item["item_id"];
    });

    var lis = document.getElementById(FanCardsList_Id).childNodes;
    if (lis.length != 0) {
        lis[0].click();
    };
})();
