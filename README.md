## iddeps

A tool which can complete seajs module in ids and deps.

### Install

    npm install iddeps -g

### Usage

    iddeps -p <your file dir>

    iddeps -p dist/

### Example

    +assets
     -a.js
     -b.js


    // a.js
    define(function(require, exports, module){
        var b = require('b');
        console.log('a');
    });

` iddeps -p ./assets `

    // a.js
    define('a', ['b'], function(require, exports, module){
        var b = require('b');
        console.log('a');
    });
