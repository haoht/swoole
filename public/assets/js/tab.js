/** tab.js By Beginner Emain:zheng_jinfan@126.com HomePage:http://www.zhengjinfan.cn */
layui.define(['element', 'common'], function (exports) {
    "use strict";
    var mod_name = 'tab',
        $ = layui.jquery,
        element = layui.element(),
        commo = layui.common,
        globalTabIdIndex = 0,
        layer = layui.layer,
        Tab = function () {
            this.config = {
                elem: undefined,
                closed: true, //是否包含删除按钮
                autoRefresh: false,
                contextMenu: false,
                onSwitch: undefined,
                openWait: true
            };
        };
    var ELEM = {};
    //版本号
    Tab.prototype.v = '0.1.6';
	/**
	 * 参数设置
	 * @param {Object} options
	 */
    Tab.prototype.set = function (options) {
        var that = this;
        $.extend(true, that.config, options);
        return that;
    };
	/**
	 * 初始化
	 */
    Tab.prototype.init = function () {
        var that = this;
        var _config = that.config;
        if (typeof (_config.elem) !== 'string' && typeof (_config.elem) !== 'object') {
            common.throwError('Tab error: elem参数未定义或设置出错，具体设置格式请参考文档API.');
        }
        var $container;
        if (typeof (_config.elem) === 'string') {
            $container = $('' + _config.elem + '');
        }
        if (typeof (_config.elem) === 'object') {
            $container = _config.elem;
        }
        if ($container.length === 0) {
            common.throwError('Tab error:找不到elem参数配置的容器，请检查.');
        }
        var filter = $container.attr('lay-filter');
        if (filter === undefined || filter === '') {
            common.throwError('Tab error:请为elem容器设置一个lay-filter过滤器');
        }
        _config.elem = $container;
        ELEM.titleBox = $container.children('ul.layui-tab-title');
        ELEM.contentBox = $container.children('div.layui-tab-content');
        ELEM.tabFilter = filter;
        return that;
    };
	/**
	 * 查询tab是否存在，如果存在则返回索引值，不存在返回-1
	 * @param {String} 标题
	 */
    Tab.prototype.exists = function (title) {
        var that = ELEM.titleBox === undefined ? this.init() : this,
            tabIndex = -1;
        ELEM.titleBox.find('li').each(function (i, e) {
            var $cite = $(this).children('cite');
            if ($cite.text() === title) {
                tabIndex = i;
            };
        });
        return tabIndex;
    };
	/**
	 * 获取tabid
	 * @param {String} 标题
	 */
    Tab.prototype.getTabId = function (title) {
        var that = ELEM.titleBox === undefined ? this.init() : this,
            tabId = -1;
        ELEM.titleBox.find('li').each(function (i, e) {
            var $cite = $(this).children('cite');
            if ($cite.text() === title) {
                tabId = $(this).attr('lay-id');
            };
        });
        return tabId;
    };
	/**
	 * 添加选择卡，如果选择卡存在则获取焦点
	 * @param {Object} data
	 */
    Tab.prototype.tabAdd = function (data) {
    /**
     * 获取本对象
     * */
    var that = this;
    /**
     * 获取页面内容(并渲染)
     * */
     $.get(data.href,{globalTabIdIndex:globalTabIdIndex},function(content){
        var _config = that.config;
        var tabIndex = that.exists(data.title);
        var waitLoadIndex;
         /**
          * 判断tab 是否已经添加过了
          */
        if (tabIndex === -1) {
            if (_config.openWait) {
                waitLoadIndex = layer.load(2);
            }
            /**
             * 判断是否超出打开的窗口数量限制
             * */
            if (_config.maxSetting !== undefined || _config.maxSetting !== 'undefined') {
                var currentTabCount = _config.elem.children('ul.layui-tab-title').children('li').length;
                if (typeof _config.maxSetting === 'number') {
                    if (currentTabCount === _config.maxSetting) {
                        layer.msg('为了系统的流畅度，只能同时打开' + _config.maxSetting + '个选项卡。');
                        return;
                    }
                }
                if (typeof _config.maxSetting === 'object') {
                    var max = _config.maxSetting.max || 8;
                    var msg = _config.maxSetting.tipMsg || '为了系统的流畅度，只能同时打开' + max + '个选项卡。';
                    if (currentTabCount === max) {
                        layer.msg(msg);
                        return;
                    }
                }
            }
            /**
             * 全局索引自增
             */
            globalTabIdIndex++;
            /**
             * 定义页面标题
             * */
            var title = '';
            /**
             * 判断图标是否定义
             * */
            if (data.icon !== undefined) {
                if (data.icon.indexOf('fa-') !== -1) {
                    title += '<i class="fa ' + data.icon + '" aria-hidden="true"></i>';
                } else {
                    title += '<i class="layui-icon">' + data.icon + '</i>';
                }
            }
            title += '<cite>' + data.title + '</cite>';
            if (_config.closed) {
                title += '<i class="layui-icon layui-unselect layui-tab-close" data-id="' + globalTabIdIndex + '">&#x1006;</i>';
            }
            /**
             * 获取随机的TabId
             * @type {number}
             */
            var tabId = new Date().getTime();
            /**
             * 添加tab
             */
            element.tabAdd(ELEM.tabFilter, {
                title: title,
                content: content,
                id: tabId
            });
            /**
             * content 自适应
             */
            ELEM.contentBox.find('content[data-id=' + globalTabIdIndex + ']').each(function () {
                $(this).height(ELEM.contentBox.height());
            });
            /**
             * 判断是否存在关闭按钮
             */
            if (_config.closed) {
                /**
                 * 监听关闭事件
                 */
                ELEM.titleBox.find('li').children('i.layui-tab-close[data-id=' + globalTabIdIndex + ']').on('click', function () {
                    /**
                     * 在关闭前触发
                     */
                    if (_config.closeBefore) {
                        var flag = _config.closeBefore({
                            title: data.title,
                            url: data.href,
                            id: globalTabIdIndex,
                            tabId: tabId
                        });
                        if (flag) {
                            element.tabDelete(ELEM.tabFilter, $(this).parent('li').attr('lay-id')).init();
                            if (_config.contextMenu) {
                                $(document).find('div.uiba-contextmenu').remove(); //移除右键菜单dom
                            }
                        }
                    } else {
                        element.tabDelete(ELEM.tabFilter, $(this).parent('li').attr('lay-id')).init();
                        if (_config.contextMenu) {
                            $(document).find('div.uiba-contextmenu').remove(); //移除右键菜单dom
                        }
                    }
                });
            }
            /**
             * 切换到当前打开的选项卡
             */
            element.tabChange(ELEM.tabFilter, that.getTabId(data.title));
            /**
             * 调试
             */
            ELEM.contentBox.find('content[data-id=' + globalTabIdIndex + ']').on('load', function () {
                //debugger;
            });

        } else {
            /**
             * 绑定修改事件
             */
            element.tabChange(ELEM.tabFilter, that.getTabId(data.title));
            /**
             * 自动刷新
             */
            if (_config.autoRefresh) {
                _config.elem.find('div.layui-tab-content > div').eq(tabIndex).children('content')[0].contentWindow.location.reload();
            }
        }

         /**
          * 判断菜单是否启用的 标签栏
          */
        if (_config.contextMenu) {
            element.on('tab(' + ELEM.tabFilter + ')', function (data) {
                $(document).find('div.admin-contextmenu').remove();
            });

            ELEM.titleBox.find('li').on('contextmenu', function (e) {
                var $that = $(e.target);
                e.preventDefault();
                e.stopPropagation();

                var $target = e.target.nodeName === 'LI' ? e.target : e.target.parentElement;
                //判断，如果存在右键菜单的div，则移除，保存页面上只存在一个
                if ($(document).find('div.admin-contextmenu').length > 0) {
                    $(document).find('div.admin-contextmenu').remove();
                }
                //创建一个div
                var div = document.createElement('div');
                /**
                 * 设置一些属性
                 * @type {string}
                 */
                div.className = 'admin-contextmenu';
                div.style.width = '130px';
                div.style.backgroundColor = 'white';
                /**
                 * 定义右键菜单栏
                 * @type {string}
                 */
                var ul = '<ul>';
                ul += '<li data-target="refresh" title="刷新当前选项卡">' +
                    '<i class="fa fa-refresh" aria-hidden="true"></i> 刷新</li>';
                ul += '<li data-target="closeCurrent" title="关闭当前选项卡">' +
                    '<i class="fa fa-close" aria-hidden="true"></i> 关闭当前</li>';
                ul += '<li data-target="closeOther" title="关闭其他选项卡">' +
                    '<i class="fa fa-window-close-o" aria-hidden="true"></i> 关闭其他</li>';
                ul += '<li data-target="closeAll" title="关闭全部选项卡">' +
                    '<i class="fa fa-window-close-o" aria-hidden="true"></i> 全部关闭</li>';
                ul += '</ul>';
                div.innerHTML = ul;
                div.style.top = e.pageY + 'px';
                div.style.left = e.pageX + 'px';
                /**
                 * 将dom添加到body的末尾
                 */
                document.getElementsByTagName('body')[0].appendChild(div);

                /**
                 * 获取当前点击选项卡的id值
                 */
                var id = $($target).find('i.layui-tab-close').data('id');
                /**
                 * 获取当前点击选项卡的索引值
                 */
                var clickIndex = $($target).attr('lay-id');
                var $context = $(document).find('div.admin-contextmenu');
                if ($context.length > 0) {
                    $context.eq(0).children('ul').children('li').each(function () {
                        var $that = $(this);
                        //绑定菜单的点击事件
                        $that.on('click', function () {
                            //获取点击的target值
                            var target = $that.data('target');
                            //
                            switch (target) {
                                case 'refresh': //刷新当前
                                    var src = $('content[data-id=' + (id-1) + ']').attr('data-url');
                                    $.get(src,{globalTabIdIndex:id},function(content){
                                        $(ELEM.contentBox.find('content[data-id=' + id + ']')[0]).html(content);
                                    });
                                    break;
                                case 'closeCurrent': //关闭当前
                                    if (clickIndex !== 0) {
                                        element.tabDelete(ELEM.tabFilter, clickIndex);
                                    }
                                    break;
                                case 'closeOther': //关闭其他
                                    ELEM.titleBox.children('li').each(function () {
                                        var $t = $(this);
                                        var id1 = $t.find('i.layui-tab-close').data('id');
                                        if (id1 != id && id1 !== undefined) {
                                            element.tabDelete(ELEM.tabFilter, $t.attr('lay-id'));
                                        }
                                    });
                                    break;
                                case 'closeAll': //全部关闭
                                    ELEM.titleBox.children('li').each(function () {
                                        var $t = $(this);
                                        if ($t.index() !== 0) {
                                            element.tabDelete(ELEM.tabFilter, $t.attr('lay-id'));
                                        }
                                    });
                                    break;
                            }
                            //处理完后移除右键菜单的dom
                            $context.remove();
                        });
                    });

                    $(document).on('click', function () {
                        $context.remove();
                    });
                }
                return false;
            });
        }

        if (_config.onSwitch) {
            element.on('tab(' + ELEM.tabFilter + ')', function (data) {
                _config.onSwitch({
                    index: data.index,
                    elem: data.elem,
                    id: ELEM.titleBox.children('li').eq(data.index).attr('lay-id')
                });
            });
        }
         /**
          * 关闭调试框
          */
        layer.close(waitLoadIndex);

     });
    };


    /**
	 * 获取当前获得焦点的tabid
	 */
    Tab.prototype.getCurrentTabId = function () {
        var that = this;
        var _config = that.config;
        return $(_config.elem).find('ul.layui-tab-title').children('li.layui-this').attr('lay-id');
    }
    /**
	 * 删除指定的tab选项卡
	 * @param {String} id
	 */
    Tab.prototype.deleteTab = function (id) {
        var that = this;
        element.tabDelete(ELEM.tabFilter, id);
        return that;
    }

    var tab = new Tab();
    exports(mod_name, function (options) {
        return tab.set(options);
    });
});
