#!/usr/bin/env node

/**
* Module dependencies.
*/

var fs = require('fs');
var path = require('path');
var async = require('async');
var colors = require('colors');

var program = require('commander');
var requireReg = /require\(([^)]+)\)/g;
var WORD_FROM_QUOTE = /\(\'(.*)\'\)|\(\"(.*)\"\)/;

// 不需要解析依赖的
var NO_DEPS = ['seajs-text', 'mockjax', 'datetimepicker'];
var basePath = process.cwd();
var ALIAS = {
  '$': 'jquery/jquery/1.10.1/jquery.js',
  'widget': 'arale/widget/widget.js',
  'base': 'arale/base/base.js',
  'events': 'arale/events/events.js',
  'class': 'arale/class/class.js',
  'templatable': 'arale/templatable/templatable.js',
  'overlay': 'arale/overlay/overlay.js',
  'calendar': 'arale/calendar/calendar.js',
  'popup': 'arale/popup/popup.js',
  'moment': 'moment/moment.js',
  'position': 'arale/position/position.js',
  'iframe-shim': 'arale/iframe-shim/iframe-shim.js',
  'mockjax': 'mockjax/jquery.mockjax.js'
};

program
    .allowUnknownOption()
    .option('-p, --path <long>', 'path for process')
    .parse(process.argv);

if(!program.path) {
    console.log('请输入正确的文件夹地址'.red);
    return false;
}

var files = scanFolder(path.resolve(process.cwd(), program.path));
readFiles(files);

function readFiles(files) {
    async.eachSeries(files, function iterator(item, callback) {
        fs.readFile(item, function(err, data) {
            if(err) {
                throw err;
            }
            rewriteIdAndDeps(item, data.toString(), callback)
        });
    });
}
function rewriteIdAndDeps (file, data, callback) {
    // 非 .js 文件不处理
    if(path.extname(file) != '.js') {
        callback();
        return false;
    }
    console.log('正在处理：' + file);
    var deps = [], id = '';
    var currentDir = path.dirname(file);

    id = '/' + getRelative(file, basePath);

    var depsRaw = data.match(requireReg);

    if(depsRaw && depsRaw.length && notInArr(NO_DEPS, file)) {
        depsRaw.forEach(function(val, key) {
            var depsPath, depsFullPath;

            if(val.match(WORD_FROM_QUOTE)) {
                depsPath = val.match(WORD_FROM_QUOTE)[1];
            } else {
                return false;
            }
            // 在Alias Map中
            if(ALIAS && ALIAS[depsPath]) {
                depsPath = ALIAS[depsPath];
            }
            // // 以.开头
            if(/^\./.test(depsPath)){
                depsFullPath = path.resolve(currentDir, depsPath);
                depsPath = '/' + getRelative(depsFullPath, basePath);
            }
            deps.push(depsPath);
        });
    }

    // 兼容  define(function(require, exports) {
    // 和  define(function(require, exports, module) {
    data = data.replace(/(define\()(function\(require,[\s]*exports(,[\s]*module)?\)[\s]*\{)/, function(m, p1, p2, p3) {
        var result = p1 + '"' + id + '",';
        if(deps && deps.length) {
            result += arrToString(deps);
            result += ',';
        }
        return result + p2;
    });

    fs.writeFile(file, data, {encoding: 'utf-8'}, function(err, code){
        if(err) {
            console.log('处理失败: ' + file.red);
        }
        console.log('处理完成: ' + file.magenta);
        callback();
    });

}


// arr ['seajs-text']
// value /Users/qubaoming/nsky/seajs-text.js
function notInArr(arr, value) {
    var result = true;
    arr.forEach(function(val, key) {
        if(String(value).indexOf(val) != -1) {
            result = false;
        }
    });
    return result;
}
// 数组 ['a','b','c'] 转换成 "['a','b','c']"
function arrToString(arr){
    var str = '';
    if(!arr.length) {
        return str;
    }
    str += '[';
    arr.forEach(function(val, key) {
        str += '"' + val + '"';
        if(key != arr.length -1) {
            str += ',';
        }
    });
    str += ']';
    return str;
}

function getRelative(src, basePath) {
    return path.relative(basePath, src).replace(/\.js$/, '');
}
function scanFolder(path){
    var fileList = [],
        folderList = [],
        walk = function(path, fileList, folderList){
            var stats = fs.statSync(path);

            if(stats.isDirectory()) {
                files = fs.readdirSync(path);
                files.forEach(function(item) {
                    var tmpPath = path + '/' + item,
                        stats = fs.statSync(tmpPath);

                    if (stats.isDirectory()) {
                        walk(tmpPath, fileList, folderList);
                        folderList.push(tmpPath);
                    } else {
                        fileList.push(tmpPath);
                    }
                });
            } else {
                console.log('请输入正确的目录'.red);
            }

        };

    walk(path, fileList, folderList);

    console.log('扫描' + path +'成功\n结果如下：\n');
    console.log(fileList);
    return fileList;
}