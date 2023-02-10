function updateContentBackground(cover) {
    // 更新背景图片
    const image = document.getElementById(ChooseItemBoxBg_Id);
    image.opacity = chooseBackgroundOpacity;
    image.src = cover;
};

async function onClickFanCardHandle(eve) {
    const cover = eve.childNodes[0].dataset["cover"];
    const item = getFanCardItemJson(eve);

    updateContentBackground(cover);

    console.log(item);
};
