(function() {
    // 排序动画
    const root = document.getElementById(FanCardsList_Id);
    let drag = null;
	root.ondragstart = function(event) {
        const drag2 = event.target.parentNode.parentNode;
        if (drag2.nodeName === "LI") {
            drag = drag2;
        }
    };
    root.ondragover = function(event) {
		event.preventDefault();
        let target = event.target.parentNode.parentNode;
        if (target === drag || target.animated) {
            return null;
        }
        if (target.nodeName === "LI") {
            let targetRect = target.getBoundingClientRect();
            let dragRect = drag.getBoundingClientRect();
            if (getIndex(drag) < getIndex(target)) {
                target.parentNode.insertBefore(drag, target.nextSibling);
            } else {
                target.parentNode.insertBefore(drag, target);
            }
            _animate(dragRect, drag);
            _animate(targetRect, target);
        }
	};
})();

(async function() {
    updateBackButton("back", false);
    await BuildFanCards(null, false);
    updateTopButton();

    const options = document.getElementById("options-list");
    const buttons = options.getElementsByTagName("button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function() {
            const items = GetFanCardsItems();
            const key = buttons[i].dataset["key"];
            items.sort(function (a, b) {
                return parseInt(a[key]) - parseInt(b[key]);
            });
            SetFanCards2Page(items);
        }
    }
})();

function updateTopButton() {
    function createButton(topFunc, bottomFunc) {
        const div = document.createElement("div");
        div.className = "top-bottom-button";
        const topButton = document.createElement("button");
        const bottomButton = document.createElement("button");
        topButton.onclick = topFunc;
        bottomButton.onclick = bottomFunc;
        topButton.className = "top-fan-card";
        bottomButton.className = "bottom-fan-card";
        const topImg = document.createElement("img");
        const bottomImg = document.createElement("img");
        topImg.src = "/assets/icons/top.png";
        bottomImg.src = "/assets/icons/bottom.png";
        topButton.append(topImg);
        bottomButton.append(bottomImg);
        div.append(topButton);
        div.append(bottomButton);
        return div
    }
    function TopFunc(eve) {
        const drag = eve.target.parentNode.parentNode.parentNode;
        const fanCardsList = document.getElementById(FanCardsList_Id);
        const target = fanCardsList.childNodes[0];
        const targetRect = target.getBoundingClientRect();
        const dragRect = drag.getBoundingClientRect();
        target.parentNode.insertBefore(drag, target);
        _animate(dragRect, drag);
        _animate(targetRect, target);
    }
    function BottomFunc(eve) {
        const drag = eve.target.parentNode.parentNode.parentNode;
        const fanCardsList = document.getElementById(FanCardsList_Id);
        const target = fanCardsList.childNodes[fanCardsList.childNodes.length-1];
        const targetRect = target.getBoundingClientRect();
        const dragRect = drag.getBoundingClientRect();
        target.parentNode.insertBefore(drag, target);
        _animate(dragRect, drag);
        _animate(targetRect, target);
    }

    let cards = GetFanCardsTag();
    for (let i = 0; i < cards.length; i++) {
        const button = createButton(TopFunc, BottomFunc);
        cards[i].insertBefore(button, cards[i].firstChild);
    }
}

document.getElementById("reverse-button").onclick = function() {
    const items = GetFanCardsItems();
    items.reverse();
    SetFanCards2Page(items);
}

document.getElementById("refresh-button").onclick = async function() {
    console.log("手动更新")
    const user = await GetFanCardsTotal();
    if (user.code !== 0) {
        console.log(user["message"]);
        return null;
    }
    const items = await GetFanCardsList(user.total);
    SetFanCards2Page(items);
    updateTopButton();

    if (FanCardsListSaveLocal) {
        console.log("保存数据到本地");
        await SaveItems2Local(user.uid, user.total);
    }
    const fanCardTags = GetFanCardsTag();
    if (fanCardTags.length !== 0) {
        fanCardTags[0].click();
    }
}

// document.getElementById("sort-option").onchange = async function() {
//     const index = this.options.selectedIndex;
// 	const value = this.options[index].value;
//     if (!value) {
//         return
//     };

//     const fanCardsList = document.getElementById(FanCardsList_Id);
//     const fanCards = fanCardsList.getElementsByTagName("li");
//     var cards = new Array();
//     for (let i = 0; i < fanCards.length; i++) {
//         cards[i] = fanCards[i]
//     };
//     if (value == "reverse") {
//         cards.reverse();
//     } else {
//         cards.sort(function (a, b) {
//             const aItme = parseFanCard(a);
//             const bItme = parseFanCard(b);
//             return parseInt(aItme[value]) - parseInt(bItme[value]);
//         });
//     };
//     for (let i = 0; i < fanCards.length; i++) {
//         const draging = cards[i];
//         const target = fanCards[i];
//         var targetRect = target.getBoundingClientRect();
//         var dragingRect = draging.getBoundingClientRect();
//         if (getIndex(draging) < getIndex(target)) {
//             target.parentNode.insertBefore(draging, target.nextSibling);
//         } else {
//             target.parentNode.insertBefore(draging, target);
//         };
//         _animate(dragingRect, draging);
//         _animate(targetRect, target);
//     };
// };


// document.getElementById("fan-cards-sort").onclick = async function() {
//     const root = document.getElementById(FanCardsList_Id);
//     const fanCardsList = root.childNodes;

//     var ids = new Array();
//     for (let i = 0; i < fanCardsList.length; i++) {
//         const item = parseFanCard(fanCardsList[i]);
//         ids[i] = item["item_id"];
//     };

//     const res = await contentPage("ApplyMyFanCardsSort", {ids: ids});
//     if (res["code"] != 0) {
//         alert(res["message"]);
//         return
//     } else {
//         alert("应用排序成功");
//     };

//     if (res["code"] == 0 && FanCardsListSaveLoacl) {
//         console.log("保存数据到本地");
//         await SaveItems2Local(null, null);
//     };
// };

// document.getElementById("update-fan-cards").onclick = async function() {
//     const user = await GetFanCardsTotal();

//     if (user.code != 0) {
//         console.log(user["message"]);
//         return 
//     };

//     console.log("手动更新, 从网络更新到页面");
//     const items = await GetFanCardsList(user.total);
//     SetFardCards2Page(items);
//     UpdateFanCardOnDbClick(TopAnimate);

//     if (FanCardsListSaveLoacl) {
//         console.log("保存数据到本地");
//         await SaveItems2Local(null, null);
//     };
// };

// (async function() {
//     await StartLoadFanCards(TopAnimate, true);
// })();
