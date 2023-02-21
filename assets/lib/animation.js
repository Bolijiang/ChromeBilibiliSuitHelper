// https://oyzq.github.io/drag_sort/%E6%8B%96%E6%8B%BD%E6%8E%92%E5%BA%8F.html
// https://github.com/OYZQ/drag_sort


function getIndex(el) {
    // 获取标签位置
    let index = 0
    if (!el || !el.parentNode) {
        return -1
    }
    while (el && (el = el.previousElementSibling)) {
        index++
    }
    return index
}

function sortCss(el, prop, val) {
    let style = el && el.style;

    if (style) {
        if (val === void 0) {
            if (document.defaultView && document.defaultView.getComputedStyle) {
                val = document.defaultView.getComputedStyle(el, '');
            } else if (el["currentStyle"]) {
                val = el["currentStyle"];
            }
            return prop === void 0 ? val : val[prop];
        } else {
            if (!(prop in style)) {
                prop = '-webkit-' + prop;
            }
            style[prop] = val + (typeof val === 'string' ? '' : 'px')
        }
    }
}

function sortAnimate(prevRect, target, timeout=300) {
    let currentRect = target.getBoundingClientRect()
    if (prevRect.nodeType === 1) {
        prevRect = prevRect.getBoundingClientRect()
    }
    sortCss(target, 'transition', 'none')
    sortCss(target, 'transform', 'translate3d(' +
        (prevRect.left - currentRect.left) + 'px,' +
        (prevRect.top - currentRect.top) + 'px,0)'
    );

    target.offsetWidth;

    sortCss(target, 'transition', 'all ' + timeout + 'ms');
    sortCss(target, 'transform', 'translate3d(0,0,0)');

    clearTimeout(target.animated);
    target.animated = setTimeout(function() {
        sortCss(target, 'transition', '');
        sortCss(target, 'transform', '');
        target.animated = false;
    }, timeout);
}

function getTopAndLeft(window) {
    let marginLeft = getComputedStyle(document.body).marginLeft;
    marginLeft = parseInt(marginLeft.slice(0, marginLeft.length - 2));
    const windowLeft = document.body.clientWidth - window.clientWidth;
    let marginTop = getComputedStyle(document.body).marginTop;
    marginTop = parseInt(marginTop.slice(0, marginTop.length - 2));
    const windowTop = document.body.clientHeight - window.clientHeight;
    return {left: windowLeft / 2 + marginLeft, top: windowTop / 2 + marginTop}
}

async function waitButton(button, title, detail) {
    let wait_time = detail["wait_time"] || 0;
    let timer = null;
    let i = Math.floor(wait_time / 1000);
    function change() {
        button.innerText = i.toString();
        button.disabled = true;

        if (i <= 0) {
            clearTimeout(timer);
            button.disabled = false;
            button.innerText = title;
            button.style.cursor = "pointer";
            return false;
        }
        timer = setTimeout(function() {
            change();
        }, 1000);
        i -= 1;
    }
    return change();
}

async function showWindow(window, detail, type="info") {
    const show_time = detail["ShowTime"] || 300;
    const show_step = detail["ShowStep"] || 50;

    const opacity_step = 1 / show_step;
    const timeout = show_time / show_step;

    const spanStep = detail["spanStep"] || 10;
    const span = document.body.clientHeight / spanStep;

    let StartTop = span + (detail["offset"] || 0);

    const obj = getTopAndLeft(window);

    if (type === "info") {
        StartTop = obj.top + span + (detail["offset"] || 0);
        window.style.left = obj.left.toString() + "px";
    }

    window.style.top = StartTop.toString() + "px";

    let opacity = 0;
    let timer = null;
    function change() {
        opacity += opacity_step;
        StartTop -= span / show_step;
        window.style.opacity = opacity.toString();
        window.style.top = StartTop.toString() +"px";
        if (opacity >= 1) {
            clearTimeout(timer);
            return false;
        }
        timer = setTimeout(function() {
            change();
        }, timeout)
    }
    return change();
}

async function hideWindow(window, detail, type="info") {
    const hide_time = detail["HideTime"] || 300;
    const hide_step = detail["HideStep"] || 50;

    const opacity_step = 1 / hide_step;
    const timeout = hide_time / hide_step;

    const spanStep = detail["spanStep"] || 10;
    const span = document.body.clientHeight / spanStep;

    let StartTop = 0;

    const obj = getTopAndLeft(window);

    if (type === "info") {
        StartTop = obj.top + (detail["offset"] || 0);
    }

    let opacity = 1;
    let timer = null;
    function change() {
        opacity -= opacity_step;
        StartTop += span / hide_step;
        window.style.opacity = opacity.toString();
        window.style.top = StartTop.toString() +"px";
        if (opacity <= 0) {
            clearTimeout(timer);
            if (type !== "info") {
                window.close();
            }
            document.body.removeChild(window);
            return false;
        }
        timer = setTimeout(function() {
            change();
        }, timeout)
    }
    return change();
}
