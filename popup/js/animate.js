// https://oyzq.github.io/drag_sort/%E6%8B%96%E6%8B%BD%E6%8E%92%E5%BA%8F.html
// https://github.com/OYZQ/drag_sort

function sortAnimate(prevRect, target) {
    function sortCss(el, prop, val) {
        var style = el && el.style;
        if (style) {
            if (val === void 0) {
                if (document.defaultView && document.defaultView.getComputedStyle) {
                    val = document.defaultView.getComputedStyle(el, '');
                } else if (el.currentStyle) {
                    val = el.currentStyle;
                }
                return prop === void 0 ? val : val[prop];
            } else {
                if (!(prop in style)) {
                    prop = '-webkit-' + prop;
                }
                style[prop] = val + (typeof val === 'string' ? '' : 'px');
            };
        };
    };
    
    var ms = 300;
    if (ms) {
        var currentRect = target.getBoundingClientRect()
        if (prevRect.nodeType === 1) {
            prevRect = prevRect.getBoundingClientRect();
        };
        sortCss(target, 'transition', 'none');
        sortCss(target, 'transform', 'translate3d(' +
            (prevRect.left - currentRect.left) + 'px,' +
            (prevRect.top - currentRect.top) + 'px,0)'
        );

        target.offsetWidth; // 触发重绘

        sortCss(target, 'transition', 'all ' + ms + 'ms');
        sortCss(target, 'transform', 'translate3d(0,0,0)');
        clearTimeout(target.animated);
        target.animated = setTimeout(function() {
            sortCss(target, 'transition', '');
            sortCss(target, 'transform', '');
            target.animated = false;
        }, ms);
    };
};

(function() {
    // 排序 / 动画
    var root = document.getElementById("fan_card_list");
    var draging = null;
    root.ondragover = function (event) {
        event.preventDefault();
    };
    root.ondragstart  = function (event) {
        draging = event.target;
        if (event.target.parentNode.className == "fan_card_image_box") {
            draging = event.target.parentNode.parentNode;
        };
    };
    root.ondrop = function (event) {
        var target = event.target;

        if (target.parentNode.className == "fan_card_image_box") {
            target = target.parentNode.parentNode;
        };

        if (target.nodeName === "LI" && target !== draging) { 
            var targetRect = target.getBoundingClientRect();
            var dragingRect = draging.getBoundingClientRect();
            if (getIndex(draging) < getIndex(target)) {
                target.parentNode.insertBefore(draging, target.nextSibling);
            } else {
                target.parentNode.insertBefore(draging, target);
            };
            sortAnimate(dragingRect, draging);
            sortAnimate(targetRect, target);
        };
    };
    function getIndex(el) {
        var index = 0;
        if (!el || !el.parentNode) {
          return -1;
        };
        while (el = el.previousElementSibling) {
          index++;
        };
        return index;
    };
})();
