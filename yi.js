//设置对象 __proto__
function setProto(obj,props){
    var _this = obj;
    function getProps(){
        var proto = {};
        for(var attr in props){
            proto[attr] = {
                value:props[attr]
            };
        }
        return proto;
    }

    Object.defineProperties(_this,getProps());
}

/* transform的matrix互转 */
var toMatrix = function(args) {
    var list = [];
    args.forEach(function (v) {
        list.push(v);
    });
    var matrixStr = list.length > 13 ? 'matrix3d' : 'matrix';
    return matrixStr + '(' + list.join(',') + ')';
};

/* 数组对象转网址参数 */
function arrToUrlParam(param, idx, key, encode) {
    if (param == null) return '';
    var paramStr = '';
    var t = typeof(param);
    if (t == 'string' || t == 'number' || t == 'boolean') {
        var one_is = idx < 3 ? '?' : '&';
        paramStr += one_is + key + '=' + (encode == null || encode ? encodeURIComponent(param) : param);
    } else {
        for (var i in param) {
            if (!param.hasOwnProperty(i)) {
                continue;
            }
            var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
            idx++;
            paramStr += arrToUrlParam(param[i], idx, k, encode);
        }
    }
    return paramStr;
}

var props = {
    each:function(fn){
        if(this.nodeType || this.location){
            fn.call(this,this,0)
            return this;
        }

        yiui.arrayFrom(this).forEach(function(item,index){
            fn.call(item,item,index)
        })
        return this;
    },
    $:function(selector) {
        var _this = this[0] || this;
        if (_this.querySelector) {
            return yiui(_this.querySelector(selector));
        }
    },
    $$:function(selector) {
        var list = {};
        var index = 0;
        this.each(function(){
            var tmpList = this.querySelectorAll(selector);
            yiui.arrayFrom(tmpList).forEach(function(item){
                list[index] = yiui(item);
                index++;
            })
        })
        list.length = yiui.arrayFrom(list).length;
        setProto(list,props);
        return list;
    },
    test:function(){
        console.log('YIUI JS!');
        return this;
    },
    show: function() {
        this.each(function (item) {
            var display = item._style_display;
            if (display) {
                item.style.display = display;
            } else {
                item.style.display = '';
            }
        });
        return this;
    },
    hide: function() {
        this.each(function (item) {
            if (!item._style_display) {
                item._style_display = item.style.display;
            }

            item.style.display = 'none';
        });
        return this;
    },
    attr: function(opts) {
        this.each(function (item) {
            for (var attr in opts) {
                item.setAttribute(attr, opts[attr]);
            }
        });
        return this;
    },
    css: function(opts) {
        this.each(function (item) {
            for (var attr in opts) {
                item.style[attr] = opts[attr];
            }
        });
        return this;
    },
    addClass: function(className) {
        var classes = className.split(' ');
        this.each(function (item) {
            classes.forEach(function (classItem) {
                if (classItem) {
                    item.classList.add(classItem);
                }
            });
        });
        return this;
    },
    removeClass: function(className) {
        var classes = className.split(' ');
        this.each(function (item) {
            classes.forEach(function (classItem) {
                if (classItem) {
                    item.classList.remove(classItem);
                }
            });
        });
        return this;
    },
    toggleClass: function(className) {
        var classes = className.split(' ');
        this.each(function (item) {
            classes.forEach(function (classItem) {
                if (classItem) {
                    item.classList.toggle(classItem);
                }
            });
        });
        return this;
    },
    append: function(selector) {
        this.each(function (item) {
            yiuiAll(selector).each(function () {
                item.appendChild(this);
            });
        });
        return this;
    },
    before: function(selector) {
        this.each(function (item) {
            var parent = item.parentNode;
            yiuiAll(selector).each(function () {
                parent.insertBefore(this, item);
            });
        });
        return this;
    },
    after: function(selector) {
        this.each(function (item) {
            var parent = item.parentNode;
            yiuiAll(selector).each(function () {
                parent.insertBefore(this, item.nextSibling);
            });
        });
        return this;
    },
    remove: function(selector) {
        this.each(function (item) {
            if (selector) {
                yiuiAll(selector).each(function () {
                    var parent = this.parentNode;
                    parent.removeChild(this);
                });
            } else {
                var parent = item.parentNode;
                if(parent){
                    parent.removeChild(item);
                }
            }
        });
        return this;
    },
    getStyle: function(attr) {
        var item = this[0] || this;
        var style = window.getComputedStyle(item);
        var attrs = attr.split(' ');
        var val = 0;
        attrs.forEach(function (v) {
            if (style[v].indexOf('px') > -1) {
                val += parseInt(style[v].replace('px', ''));
            } else {
                val = style[v];
                return val;
            }
        });
        return val;
    },
    setTranslate: function(x, y) {
        this.each(function (item) {
            var transform = item.getStyle('transform');

            if (!transform || transform == 'none') {
                transform = 'matrix(1, 0, 0, 1, 0, 0)';
            }

            var group = transform.match(/\(([^)]+)\)/)[1];
            var args = group.split(',');

            for (var index in args) {
                args[index] = parseInt(args[index]);
            }

            if (args.length > 13) {
                args[13] = x;
                args[14] = x;
            } else {
                args[4] = x;
                args[5] = y;
            }

            item.style.transform = toMatrix(args);
        });
        return this;
    },
    getTranslate: function() {
        var item = this[0]||this;
        var transform = item.getStyle('transform');

        if (transform == 'none') {
            return [0, 0];
        }

        var group = transform.match(/\(([^)]+)\)/)[1];
        var args = group.split(',');

        for (var index in args) {
            args[index] = parseInt(args[index]);
        }

        if (args.length > 13) {
            return [args[13], args[14]];
        } else {
            return [args[4], args[5]];
        }
    },
    setAniTimer: function(param, fn) {
        this.each(function (item) {
            var duration = typeof(param) == 'object' ? param.duration || 300 : param;
            var timingFunction = param.timingFunction || 'ease';
            var property = param.property || 'all';
            var delay = param.delay || 0;

            if (item.aniTimer) {
                item.style.transition = item._transition || null;
                clearTimeout(item.aniTimer);
            }

            if (item.style.transition && !item._transition) {
                item._transition = item._transition || item.style.transition;
            }

            item.style.transition = property + ' ' + duration / 1000 + 's ' + timingFunction + ' ' + delay + 's';
            item.aniTimer = setTimeout(function () {
                item.style.transition = item._transition || null;

                if (typeof fn == 'function') {
                    fn.call(item, item._ani_before_style);
                }
            }, duration);
        });
        return this;
    },
    stopAniTimer: function(fn) {
        this.each(function (item) {
            item.style.transition = 'none';
            clearTimeout(item.aniTimer);

            if (item._transition) {
                setTimeout(function () {
                    item.style.transition = item._transition;

                    if (typeof fn == 'function') {
                        fn.call(item);
                    }
                }, 30);
            } else {
                item.style.transition = null;
            }
        });
        return this;
    },

    /*
    $('.xxx').animate(
        {marginLeft:'20px'},//或者[]，如果数组则播放序列动画
        1000,
        function(oriStyle:动画前的style，用于复原){})
    */
    animate: function(css, duration, fn) {
        var index = 0;
        var _this = this;

        var sequence = function sequence(item) {
            var thisCss = css[index];
            var tmp = document.createElement('div');
            yiui(tmp).css(thisCss);
            var thisDuration = parseFloat(tmp.style.transitionDuration.replace('s', '')) * 1000;
            tmp = null;
            var aniDuration = 0;

            if (thisDuration) {
                aniDuration = thisDuration;
            } else {
                aniDuration = duration;
            }

            item.setAniTimer(aniDuration || 300);
            item.animate(thisCss, aniDuration);

            if (css.length > index) {
                setTimeout(function () {
                    index++;
                    sequence(item);
                }, aniDuration);
            } else {
                if (typeof fn == 'function') {
                    fn.call(item, item._ani_before_style);
                    index = 0;
                }
            }
        };

        this.each(function (item) {
            item._ani_before_style = typeof item._ani_before_style != 'undefined' ? item._ani_before_style : item.getAttribute('style') || '';
            if (Array.isArray(css)) {
                sequence(item);
            } else {
                item.setAniTimer(duration || 300, fn);
                item.css(css);
            }
        });
        return this;
    },
    on: function(ev, fn) {
        var customEvents = ['longpress', 'appear', 'wheel','disappear'];
        var events = ev.split(' ');
        this.each(function (item) {
            events.forEach(function (event) {
                event = event.trim();
                item.addEventListener(event, fn, false);

                if (customEvents.indexOf(event) > -1) {
                    item[event](fn);
                } else {
                    item.addEventListener(event, fn, false);
                    var tmpEvents = item._events || [];
                    tmpEvents.push({
                        event: event,
                        fn: fn
                    });
                }
            });
        });
        return this;
    },
    un: function(ev, fn) {
        var events = ev.split(' ');
        this.each(function (item) {
            events.forEach(function (event) {
                event = event.trim();

                if (item[event]) {
                    item._un = item._un || [];

                    item._un.forEach(function (cacheEvent) {
                        if (event == cacheEvent.event && (typeof fn == 'undefined' || fn.toString() == cacheEvent.fn.toString())) {
                            cacheEvent["do"]();
                        }
                    });
                }

                if (typeof fn == 'undefined') {
                    item._events = item._events || [];

                    item._events.forEach(function (cacheEvent, index) {
                        if (event == cacheEvent.event) {
                            item.removeEventListener(event, cacheEvent.fn);

                            item._events.splice(index, 1);
                        }
                    });
                } else {
                    item.removeEventListener(event, fn);
                }
            });
        });
        return this;
    },
    trigger: function(event) {
        this.each(function (item) {
            var evt = document.createEvent("Events");
            evt.initEvent(event, true, true);
            item.dispatchEvent(evt);
        });
        return this;
    },

    /* 拖动DOM 
    dom对象.setDrag({
        range:dom对象||boolean, //限制范围
        allowFrame:false //子元素iframe是否也能接受拖动，默认false,不支持跨域
        min:{y:0,x:0},//位移不能小于
        max:{y:0,x:0},//位移不能大于
        over:{ //拖动结束时
        duration:300,//自动回原位的动画长度，不设置，无过渡
        min:{y:100,x:100},//位移小于指定参数时，自动回原位
        max:{y:100,x:100},//位移大于指定参数时，自动回原位
        after:function(r){//r，返回位移像素，{x:0,y:0}
                //回调
        }
        }
        begin:function(){}
        move:function(){}
    });
    dom.stopDrag = true;//停止拖动
    */
    setDrag: function(opts) {
        opts = opts || {};

        function set(item) {
            var startX = null,
                startY = null;
            var moveX = null,
                moveY = null;
            var newX = null,
                newY = null;
            var oldX = 0,
                oldY = 0;
            var allow = opts.allow ? opts.allow : 'xy';
            /* 可拖动的方向,x,y,默认全部xy */

            var parent = typeof opts.range == 'boolean' ? yiui(item.parentNode) : opts.range;
            var isDraging = false;
            var methods = {
                begin: function begin(e) {
                    var ev = e.touches ? e.touches[0] : e;

                    if (ev.button != 0 && ev.button != undefined) {
                        return;
                    }

                    var translate = item.getTranslate();
                    isDraging = true;
                    startX = ev.screenX;
                    startY = ev.screenY;
                    oldX = translate[0];
                    oldY = translate[1];

                    if (typeof opts.begin == 'function') {
                        opts.begin.call(item, {
                            y: startX,
                            x: startY
                        }, e);
                    }

                    yiui.stop(e);
                },
                move: function move(e) {
                    if (!isDraging) {
                        return;
                    }

                    var ev = e.touches ? e.touches[0] : e;

                    if (startX != null && allow.indexOf('x') > -1) {
                        moveX = ev.screenX - startX;
                        newX = oldX + moveX;

                        if (opts.range) {
                            var minX = parent.getStyle('margin-left padding-left border-left-width') - item.offsetLeft + item.getStyle('margin-left');
                            var maxX = parent.offsetWidth - parent.getStyle('padding-right border-right-width') + parent.offsetLeft - (item.offsetWidth + item.getStyle('margin-right')) - item.offsetLeft;

                            if (newX < minX) {
                                newX = minX;
                            }
                            /*左边界*/

                            if (newX > maxX) {
                                newX = maxX;
                            }
                            /*右边界*/

                        }
                    }

                    if (startY != null && allow.indexOf('y') > -1) {
                        moveY = ev.screenY - startY;
                        newY = oldY + moveY;

                        if (opts.range) {
                            var minY = parent.getStyle('margin-top padding-top border-top-width') - item.offsetTop + item.getStyle('margin-top');
                            var maxY = parent.offsetHeight - parent.getStyle('padding-bottom border-bottom-width') + parent.offsetTop - (item.offsetHeight + item.getStyle('margin-bottom')) - item.offsetTop;

                            if (newY < minY) {
                                newY = minY;
                            }
                            /*上边界*/

                            if (newY > maxY) {
                                newY = maxY;
                            }
                            /*下边界*/

                        }
                    }
                    /* 不能小于原始位置多少 */


                    if (opts.min) {
                        if (typeof opts.min.y != 'undefined' && newY < opts.min.y) {
                            newY = opts.min.y;
                        }

                        if (typeof opts.min.x != 'undefined' && newX < opts.min.x) {
                            newX = opts.min.x;
                        }
                    }
                    /* 不能大于原始位置多少 */


                    if (opts.max) {
                        if (typeof opts.max.y != 'undefined' && newY > opts.max.y) {
                            newY = opts.max.y;
                        }

                        if (typeof opts.max.x != 'undefined' && newX > opts.max.x) {
                            newX = opts.max.x;
                        }
                    }

                    if (newX == null && oldX != null) {
                        newX = oldX;
                    }

                    if (newY == null && oldY != null) {
                        newY = oldY;
                    }

                    yiui(item).setTranslate(newX, newY);

                    if (typeof opts.move == 'function') {
                        var param = {
                            y: moveY,
                            x: moveX,
                            startX: startX,
                            event: e,
                            setX: function setX(v) {
                                item.setTranslate(v, newY || 0);
                                startX = ev.screenX;
                                oldX = v;
                            },
                            setY: function setY(v) {
                                item.setTranslate(newX || 0, v);
                                startY = ev.screenY;
                                oldY = v;
                            }
                        };
                        opts.move.call(item, param);
                    }
                },
                over: function over(e) {
                    if (opts.over && isDraging) {
                        if (typeof opts.over == 'function') {
                            opts.over.call(item);
                        } else {
                            if (opts.over.min) {
                                if (typeof opts.over.min.y != 'undefined' && newY < opts.over.min.y) {
                                    newY = originalY;
                                }

                                if (typeof opts.over.min.x != 'undefined' && newX < opts.over.min.X) {
                                    newX = originalX;
                                }
                            }

                            if (opts.over.max) {
                                if (typeof opts.over.max.y != 'undefined' && newY > opts.over.max.y) {
                                    newY = originalY;
                                }

                                if (typeof opts.over.max.x != 'undefined' && newX > opts.over.max.X) {
                                    newX = originalX;
                                }
                            }

                            if (opts.over.max || opts.over.min) {
                                if (opts.over.duration) {
                                    item.setAniTimer(opts.over.duration);
                                }

                                yiui(item).setTranslate(newX, newY);
                            }

                            if (typeof opts.over.after == 'function') {
                                opts.over.after.call(item, {
                                    y: moveY,
                                    x: moveX,
                                    startX: startX
                                }, e);
                            }
                        }
                    }

                    isDraging = false;

                    if (newX != null) {
                        oldX = newX;
                    }

                    if (newY != null) {
                        oldY = newY;
                    }

                    startX = startY = moveX = moveY = newX = newY = null;
                }
            };

            item._destroyDrag = function () {
                startX = startY = moveX = moveY = oldX = oldY = newX = newY = null;
                item.removeEventListener('mousedown', methods.begin);
                document.removeEventListener('mousemove', methods.move);
                document.removeEventListener('mouseup', methods.over);
                item.removeEventListener('touchstart', methods.begin);
                document.removeEventListener('touchmove', methods.move);
                document.removeEventListener('touchend', methods.over);

                if (opts.allowFrame == true) {
                    var frames = item.yiuiAll('iframe');
                    frames.forEach(function (frame) {
                        frame.contentDocument.removeEventListener('touchstart', methods.begin);
                        frame.contentDocument.removeEventListener('touchmove', methods.move);
                        frame.contentDocument.removeEventListener('touchend', methods.over);
                    });
                }
            };

            item._setDragStartY = function (setStartY) {
                startY = setStartY;
                isdrag = true;
            };

            item._setDragStartX = function (setStartX) {
                startX = setStartX;
                isdrag = true;
            };

            item._setOldX = function (v) {
                oldX = v;
            };

            item._setOldY = function (v) {
                oldY = v;
            };

            item.addEventListener('mousedown', methods.begin, false);
            document.addEventListener('mousemove', methods.move, false);
            document.addEventListener('mouseup', methods.over, false);
            item.addEventListener('touchstart', methods.begin, false);
            document.addEventListener('touchmove', methods.move, false);
            document.addEventListener('touchend', methods.over, false);

            if (opts.allowFrame == true) {
                var frames = item.yiuiAll('iframe');
                frames.forEach(function (frame) {
                    frame.addEventListener('load', function () {
                        frame.contentDocument.addEventListener('touchstart', methods.begin, false);
                        frame.contentDocument.addEventListener('touchmove', methods.move, false);
                        frame.contentDocument.addEventListener('touchend', methods.over, false);
                    });
                });
            }
        };

        this.each(function (item) {
            set(item);
        });
        return this;
    },
    destroyDrag: function() {
        // console.log(yiui.arrayFrom(this))
        this._destroyDrag ? this._destroyDrag() : this.each(function (item) {
            item._destroyDrag();
            // console.log(_this._destroyDrag)
        });
        return this;
    },
    setDragStartY: function() {
        this._setDragStartY ? this._setDragStartY() : this.each(function (item) {
            item._setDragStartY();
        });
        return this;
    },
    setOldX: function() {
        this._setOldX ? this._setOldX() : this.each(function (item) {
            item.setOldX();
        });
        return this;
    },
    setOldY: function() {
        this._setOldY ? this._setOldY() : this.each(function (item) {
            item.setOldY();
        });
        return this;
    },

    /* 长按事件 */
    longpress: function(fn) {
        this.each(function (item) {
            var timer = null;

            var mousedown = function mousedown() {
                timer = setTimeout(fn.bind(item), 500);
            };

            var mouseup = function mouseup() {
                clearTimeout(timer);
            };

            item.on('mousedown', mousedown);
            item.on('mouseup', mouseup);
            item._un = item._un ? item._un : [];

            item._un.push({
                event: 'longpress',
                fn: fn,
                "do": function _do() {
                    item.un('mousedown', mousedown);
                    item.un('mouseup', mouseup);
                }
            });
        });
        return this;
    },

    /* 滚轮事件 */
    wheel: function(fn) {
        this.each(function (item) {
            function _fn(ev) {
                var e = ev || event;
                var down = null;
                var isdown = e.wheelDelta ? down = e.wheelDelta < 0 : down = e.detail > 0;
                ev.isDown = isdown;
                fn.call(item, ev);
            }

            window.navigator.userAgent.indexOf('Firefox') != -1 ? item.on('DOMMouseScroll', _fn, false) : item.on('mousewheel', _fn);
            item._un = item._un ? item.un : [];

            item._un.push({
                event: 'wheel',
                fn: _fn,
                "do": function _do() {
                    item.removeEventListener('DOMMouseScroll', _fn);
                    item.removeEventListener('mousewheel', _fn);
                }
            });
        });
        return this;
    },

    /* 元素出现事件 */
    appear: function(fn) {
        var set = function set(item) {
            var scroller = [];
            /*遍历有滚动条的父节点*/

            var getScrollers = function getScrollers(dom) {
                var tmp = dom.parentNode;
                tmp = tmp ? tmp : document.body;

                if (tmp.getBoundingClientRect) {
                    if (yiui(tmp).getStyle('overflow').indexOf('auto') > -1) {
                        scroller.push(tmp);
                    }
                } else {
                    return;
                }

                getScrollers(tmp);
            };

            getScrollers(item);

            var isv = function isv() {
                var doc = scroller[scroller.length - 1];

                if (!doc) {
                    return true;
                }

                var r = item.getBoundingClientRect();
                var d = doc.getBoundingClientRect();
                var vy = r.top > d.top - r.height && r.top - d.top < d.height;
                var vx = r.left > d.left - r.width && r.left - d.left < d.width;
                var visible = vy && vx;
                return visible;
            };

            var iso = function iso() {
                var doc = document.documentElement;
                var r = item.getBoundingClientRect();
                var d = doc.getBoundingClientRect();
                var vy = r.top > 0 - r.height && r.top < doc.clientHeight;
                var vx = r.left > 0 - r.width && r.left < doc.clientWidth;
                var visible = vy && vx;
                return visible;
            };

            var compute = function compute() {
                if (isv() && iso()) {
                    if (!item._isAppear) {
                        item._isAppear = true;
                        fn.call(item);
                    }
                } else {
                    delete item._isAppear;
                }
            };

            scroller.forEach(function (item) {
                item.addEventListener('scroll', compute);
            });
            window.addEventListener('scroll', compute);
            item._un = item._un || [];

            item._un.push({
                event: 'appear',
                fn: fn,
                "do": function _do() {
                    window.removeEventListener('scroll', compute);
                    scroller.forEach(function (item) {
                        item.un('scroll', compute);
                    });
                }
            });
        };

        this.each(function (item) {
            set(item);
        });
        return this;
    },

    /* 元素消失事件 */
    disappear: function(fn) {
        this.each(function (item) {
            item.appear();

            var compute = function compute() {
                if (!item._isAppear) {
                    fn.call(item);
                }
            };

            window.addEventListener('scroll', compute);
            item._un = item._un || [];

            item._un.push({
                event: 'appear',
                fn: fn,
                "do": function _do() {
                    window.removeEventListener('scroll', compute);
                    item.un('appear');
                }
            });
        });
        return this;
    }
};



function yiuiAll(selector){
    var toEle = function toEle(html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var nodes = tmp.children;
        return nodes.length > 1 ? nodes : nodes[0];
    };
    function compile(){
        var els = null;
        if(typeof selector == 'object'){
            els = selector;
        }
        if(typeof selector == 'string'){
            if(/<.+?>/.test(selector)){
                els = toEle(selector);
            }else{
                els = document.querySelectorAll(selector);
            }
            
        }
        if(typeof selector == 'function'){
            yiui(document).on('DOMContentLoaded',function(){
                selector();
                yiui(document).un('DOMContentLoaded',arguments.callee,false);
            })
            return;
        }
        return els;
    }

    var els = compile();
    if(!els){return;}

    

    if(selector.console){
        setProto(els,{
            on:props.on,
            un:props.un,
            trigger:props.trigger,
            each:props.each
        });
        return els;
    }

    setProto(els,props);

    

    if(els.length){
        yiui.arrayFrom(els).forEach(function(item){
            if(item.nodeName){
                setProto(item,props);
            }
            if(els.fuck){
                console.log(els,'-xxxxxxxxx')
            }
        })
    }
    return els;
}


function yiui(selector){
    var els = yiuiAll(selector);
    if(!els) {return;}
    var el = els[0] || els;
    
    return el;
}


setProto(yiui,{
    version:'2.0.0',
    // 对象强制转数组
    arrayFrom:function(obj){
        var arr = []
        for(var index in obj){
            if(/[0-9]+/.test(index) && obj.hasOwnProperty(index) ){
                arr.push(obj[index]);
            }
        }
        return arr;
    },
    /*
    $.get(url,function(){}}) 
    或
    $.get(url).then(function(){}).catch(function(){})
    */
    get: function get(url, fn, dataType) {
        var thenList = [];
        var catchList = [];
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            var _this = this;

            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                var res = xhr.responseText;

                if (dataType == 'json') {
                    res = JSON.parse(res);
                }

                if (fn) {
                    fn.call(this, res, xhr.status, xhr);
                }

                thenList.forEach(function (fn) {
                    if (typeof fn == 'function') {
                        fn.call(_this, res, xhr.status, xhr);
                    }
                });
            } else if (xhr.readyState == 4) {
                catchList.forEach(function (fn) {
                    if (typeof fn == 'function') {
                        fn.call(_this, xhr.status, xhr);
                    }
                });
            }
        };

        xhr.send();

        if (fn) {
            return xhr;
        } else {
            var returns = {
                then: function then(fn) {
                    thenList.push(fn);
                    return returns;
                },
                "catch": function _catch(fn) {
                    catchList.push(fn);
                    return returns;
                },
                abort: function abort() {
                    xhr.abort();
                }
            };
            return returns;
        }
    },
    /*
    $.post(url,可选:{data:{},function(){}}) 
    或
    $.post(url).then(function(){}).catch(function(){})
    */
    post: function post(url, data, fn, dataType) {
        var thenList = [];
        var catchList = [];
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = function () {
            var _this2 = this;

            if (xhr.readyState == 4) {
                if (xhr.status == 200 || xhr.status == 304) {
                    var res = xhr.responseText;

                    if (dataType == 'json') {
                        res = JSON.parse(res);
                    }

                    if (fn) {
                        fn.call(this, res, xhr.status, xhr);
                    }

                    thenList.forEach(function (fn) {
                        if (typeof fn == 'function') {
                            fn.call(_this2, res, xhr.status, xhr);
                        }
                    });
                } else {
                    catchList.forEach(function (fn) {
                        if (typeof fn == 'function') {
                            fn.call(_this2, xhr.status, xhr);
                        }
                    });
                }
            }
        };

        xhr.send(arrToUrlParam(data));

        if (fn) {
            return xhr;
        } else {
            var returns = {
                then: function then(fn) {
                    thenList.push(fn);
                    return returns;
                },
                "catch": function _catch(fn) {
                    catchList.push(fn);
                    return returns;
                },
                abort: function abort() {
                    xhr.abort();
                }
            };
            return returns;
        }
    },

    /*
    未完善
    $.jsonp(url,可选:{data:{},success:function(){}}) 
    或
    $.jsonp(url).then(function(){}).catch(function(){})
    */
    jsonp: function jsonp(url, opts) {
        var callbackName = "fn" + Math.random().toString().split("\.")[1];
        var scriptObj = document.createElement("script");
        var thenList = [];
        var catchList = [];
        opts = opts || {};
        opts.data = opts.data || '';

        if (typeof(opts.data) == 'object') {
            var arr = new Array();

            for (var key in opts.data) {
                arr.push(key + '=' + opts.data[key]);
            }

            opts.data = arr.join('&');
        }

        scriptObj.src = url + (url.indexOf('?') > -1 ? '&' : '?') + 'callback=' + callbackName + '&' + opts.data;
        document.getElementsByTagName('head')[0].appendChild(scriptObj);

        window[callbackName] = function (res) {
            var onload = function onload() {
                if (opts.success) {
                    opts.success(res);
                }

                thenList.forEach(function (fn) {
                    if (typeof fn == 'function') {
                        fn(res);
                    }
                });
                scriptObj.removeEventListener('load', onload);
            };

            var onerror = function onerror() {
                catchList.forEach(function (fn) {
                    if (typeof fn == 'function') {
                        fn(res);
                    }
                });
                scriptObj.removeEventListener('error', onerror);
            };

            scriptObj.addEventListener('load', onload);
            scriptObj.addEventListener('error', onerror);
            delete window.callbackName;
            document.getElementsByTagName('head')[0].removeChild(scriptObj);
        };

        var returns = {
            then: function then(fn) {
                thenList.push(fn);
                return returns;
            },
            "catch": function _catch(fn) {
                catchList.push(fn);
                return returns;
            },
            abort: function abort() { }
        };
        return returns;
    },
    stop: function stop(event) {
        if (event != null && event.stopPropagation) {
            event.stopPropagation();
        } else if (window.event) {
            window.event.cancelBubble = true;
        }
    },
    lockScroll: function lockScroll() {
        var docEle = document.documentElement;
        docEle.style.marginRight = window.innerWidth - docEle.offsetWidth + 'px';
        docEle.style.overflow = 'hidden';
    },
    unLockScroll: function unLockScroll() {
        document.documentElement.removeAttribute('style');
    },
    loadScript: function loadScript() {
        function _load_script_() {
            var args = arguments;
            var opts = typeof args[0] == 'string' ? {
                src: args[0]
            } : args[0];
            var scriptsList = window.loadedScripts;

            if (typeof(scriptsList) == 'object' && scriptsList.indexOf(opts.src) > -1) {
                return;
            }

            var script = document.createElement('script');
            script.type = opts.type || 'text/javascript';
            script.src = opts.src;
            document.querySelector('head').appendChild(script);
            scriptsList = typeof(scriptsList) == 'object' ? scriptsList : [];
            scriptsList.push(opts.src);
            window.loadedScripts = scriptsList;

            if (opts.loaded) {
                yiui(script).on('load', function () {
                    opts.loaded.call(script);
                });
            }
        }

        if (typeof(arguments[0]) == 'object') {
            if (Array.isArray(arguments[0])) {
                [].forEach.call(arguments[0], function (item) {
                    _load_script_(item);
                });
            } else {
                _load_script_(arguments[0]);
            }
        } else {
            _load_script_(arguments[0]);
        }
    }
});

window.$ = yiui;
window.$$ = yiuiAll;


yiui(function(){
    yiui(window).trigger('scroll').trigger('resize').on('resize', function () {
        yiui(window).trigger('scroll');
    }); 
})

// console.dir(yiui.version)


