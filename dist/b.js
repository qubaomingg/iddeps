define("/dist/b",["jquery/jquery/1.10.1/jquery.js","/dist/common/browser-detect","/dist/common/handlebar-helper","/dist/pages/express/mock/mock","/dist/router"],function(require, exports, module){
    var $ = require('$');
    window.$ = $; // for debug

    var browserDetect = require('./common/browser-detect');

    if(browserDetect()) {
        require('./common/handlebar-helper');
        // require('./pages/express/mock/mock');
        var router = require('./router');
        router.init();
    }
});
