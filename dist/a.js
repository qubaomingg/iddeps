/**
 * nsky router
 * @author: qubaoming@didichuxing.com
 * @date: 2015/11/27
 */

define("/dist/a",["director","/dist/common/ui-common"],function(require, exports, module){
    var daijiaPage, entryPage, expressPage;
    var Director = require('director');
    var uiUtil = require('./common/ui-common');

    var routerHelp = {
            navigate: function(hash) {
                if(!hash) {
                    return false;
                }
                window.location.hash = hash;
            },
            hideAll: function() {
                entryPage && entryPage.hide();
                daijiaPage && daijiaPage.hide();
                expressPage && expressPage.hide();
            },
            loadPageAsync: function(url, type) {
                var dtd = $.Deferred();
                require.async(url, function(Page) {
                    var currentPage = eval(type + 'Page');
                    if(!currentPage) {
                        currentPage = new Page({
                            parentNode: '.nsky-container'
                        });
                    }
                    currentPage.refresh();
                    dtd.resolve(currentPage);
                });
                return dtd;
            },
            loadPage: function(url, type) {
                this.hideAll();
                $.when(this.loadPageAsync(url, type))
                .done(function(page) {
                    if(url.indexOf('entry') != -1) {
                        entryPage = page;
                    } else if(url.indexOf('express') != -1) {
                        expressPage = page;
                    } else if(url.indexOf('daijia') != -1) {
                        daijiaPage = page;
                    }
                });
            }
        };

    module.exports = {
        routes: {
            '/': function() {
                routerHelp.loadPage('/dist/pages/entry/entry', 'entry');
            },
            '/express': function() {
                routerHelp.loadPage('/dist/pages/express/express', 'express');
            },
            '/daijia': function() {
                routerHelp.loadPage('/dist/pages/daijia/daijia', 'daijia');
            }
        },
        // router init option.
        options: {
            on: function() {},
            before: function() {
                uiUtil.renderCss3Loading();
                routerHelp.hideAll();
            },
            notfound: function() {
                routerHelp.navigate('/');
            }
        },
        ensureURL: function() {
            if(String(window.location.href).indexOf('#') == -1) {
                this.navigate('/');
            }
        },
        // 导航到某个hash值，navigate('/express');
        navigate: function(hash) {
            window.location.hash = hash;
        },

        init: function() {
            var router = Director.Router(this.routes).configure(this.options);
            router.init();

            // 这句需要放在最后，不然会触发两次
            this.ensureURL();
        }
    };
});
