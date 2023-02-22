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

class SortAnimation {
    // 排序动画
    static sortCss(el, prop, val) {
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

    static sortAnimate(prevRect, target, timeout=300) {
        let currentRect = target.getBoundingClientRect()
        if (prevRect.nodeType === 1) {
            prevRect = prevRect.getBoundingClientRect()
        }
        SortAnimation.sortCss(target, 'transition', 'none')
        SortAnimation.sortCss(target, 'transform', 'translate3d(' +
            (prevRect.left - currentRect.left) + 'px,' +
            (prevRect.top - currentRect.top) + 'px,0)'
        );

        target.offsetWidth;

        SortAnimation.sortCss(target, 'transition', 'all ' + timeout + 'ms');
        SortAnimation.sortCss(target, 'transform', 'translate3d(0,0,0)');

        clearTimeout(target.animated);
        target.animated = setTimeout(function() {
            SortAnimation.sortCss(target, 'transition', '');
            SortAnimation.sortCss(target, 'transform', '');
            target.animated = false;
        }, timeout);
    }
}

class MessageAnimation {
    constructor(window, detail, type="info") {
        document.body.appendChild(window);

        this.window = window;
        this.detail = detail;

        const spanStep = this.detail["spanStep"] || 10;

        this.span = document.body.clientHeight / spanStep;
        this.opacity = 0;

        this.show_time = this.detail["ShowTime"] || 300;
        this.show_step = this.detail["ShowStep"] || 50;
        this.show_opacity_step = 1 / this.show_step;
        this.show_timeout = this.show_time / this.show_step;

        this.hide_time = this.detail["HideTime"] || 300;
        this.hide_step = this.detail["HideStep"] || 50;
        this.hide_opacity_step = 1 / this.hide_step;
        this.hide_timeout = this.hide_time / this.hide_step;

        let StartTop = this.span + (detail["offset"] || 0);
        const obj = this.getTopAndLeft(window);
        if (type === "info") {
            StartTop = obj.top + this.span + (this.detail["offset"] || 0);
            this.window.style.left = obj.left.toString() + "px";
        }
        this.window.style.top = StartTop.toString() + "px";

        this.top = StartTop;
        this.type = type;
    }

    getTopAndLeft() {
        // 获取居中定位
        let marginLeft = getComputedStyle(document.body).marginLeft;
        marginLeft = parseInt(marginLeft.slice(0, marginLeft.length - 2));
        const windowLeft = document.body.clientWidth - this.window.clientWidth;
        let marginTop = getComputedStyle(document.body).marginTop;
        marginTop = parseInt(marginTop.slice(0, marginTop.length - 2));
        const windowTop = document.body.clientHeight - this.window.clientHeight;
        return {left: windowLeft / 2 + marginLeft, top: windowTop / 2 + marginTop}
    }

    changeStyle(opacity_step, step, method_number) {
        // 改变样式
        this.opacity += opacity_step * method_number;
        this.top -= (this.span / step) * method_number;
        this.window.style.opacity = this.opacity.toString();
        this.window.style.top = this.top.toString() +"px";
    }

    async changeWindow(method="show") {
        // 改变窗口动画
        let timer = null;
        let method_number, timeout, step, opacity_step;

        if (method !== "show" && method !== "hide") {
            throw new Error("method is error");
        }

        opacity_step = (method === "show") ? this.show_opacity_step: this.hide_opacity_step;
        timeout = (method === "show") ? this.show_timeout: this.hide_timeout;
        step = (method === "show") ? this.show_step: this.hide_step;
        method_number = (method === "show") ? 1: -1;

        function change(self) {
            self.changeStyle(opacity_step, step, method_number)
            if (self.opacity >= 1 && method === "show") {
                clearTimeout(timer);
                return false;
            }

            if (self.opacity <= 0 && method === "hide") {
                clearTimeout(timer);
                if (self.type !== "info") {
                    self.window.close();
                }
                document.body.removeChild(self.window);
                return false;
            }
            timer = setTimeout(function() {
                change(self);
            }, timeout)
        }
        return change(this);
    }
}

async function waitButton(button, title, time) {
    // 等待按钮
    let wait_time = time || 0;
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
