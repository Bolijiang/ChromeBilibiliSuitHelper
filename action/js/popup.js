(async function() {
    const config = await getLocalContent("config") || {"style": {}};
    const style = config["style"];
    
    document.body.style.backgroundColor = style["popup-background-color"];
})();

(async function() {
    // 初始化透明度选择条
    const root = document.getElementById(OpacityRange_Id);
    root.value = chooseBackgroundOpacity * 100;
})();

(function() {
    // 排序动画
    var root = document.getElementById(CardItemsListId);
    var draging = null;
	root.ondragstart = function(event) {
        if (event.target.className != CardImageClassName) { 
            return null;
        };
        draging = event.target.parentNode.parentNode;
    };
    root.ondragover = function(event) {
		event.preventDefault()
        if (event.target.className != CardImageClassName) {
            return null;
        }
        var target = event.target.parentNode.parentNode;
        if (target == draging || target.animated) {
            return null;
        };
        var targetRect = target.getBoundingClientRect();
        var dragingRect = draging.getBoundingClientRect();
        if (getIndex(draging) < getIndex(target)) {
            target.parentNode.insertBefore(draging, target.nextSibling);
        } else {
            target.parentNode.insertBefore(draging, target);
        };
        _animate(dragingRect, draging);
        _animate(targetRect, target);
	};
})();

(async function() {
    // 初始化粉丝卡片列表
    const load = await getLocalContent("cards") || {};
    load.items = load.items || new Array();
    const user = await getMySuitTotal();
    if (user.code == -1) {
        alert(user.message);
        return
    };

    var amount = document.getElementById(SuitAmountId);
    amount.innerText = `共${user.total}套`;

    const exp1 = (user.uid == load.uid);
    const exp2 = (user.total == load.total);
    const exp3 = (Boolean(load.items));
    const exp4 = (user.total == load.items.length);

    if (exp1 && exp2 && exp3 && exp4) {
        console.log("本地存在");
        await setCardsList(load.items);
    } else {
        console.log("本地不存在/不正确, 开始从网络获取");
        const items = await getCardsList(user.total);
        await setCardsList(items);
        console.log("更新本地 cards [uid, total, items]");
        await setLocalContent({"cards": {
            uid: user.uid, total: user.total, items: items,
        }});
    };

    const ul = document.getElementById(CardItemsListId);
    ul.getElementsByTagName("li")[0].click();
})();
