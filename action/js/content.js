async function selectChange(value, item) {
    // 选择显示内容
    if (value == "fanNumber"){
        await setfanNumber(item);
    };
};

function updateContentBackground(cover) {
    // 更新背景图片
    const image = document.getElementById(ChooseItemBoxBg_Id);
    image.style.opacity = chooseBackgroundOpacity.toString();
    image.src = cover;
};

async function onClickFanCardHandle(eve) {
    // 粉丝卡片点击事件
    var item = getFanCardItemJson(eve);
    updateContentBackground(item["image_cover"]);
    delete item["fan_share_image"];
    delete item["image_cover"];

    const root = document.getElementById(ChooseItemBox_Id);
    root.dataset["item"] = JSON.stringify(item);

    var option = document.getElementById(MainBoxOption_Id);
    await selectChange(option.options[0].value, item);
};
