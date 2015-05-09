/*
 * mloader.js     Very tiny script Loader;
 * Author     human (huang jun hua)
 * Company    Alibaba inc
 * WebSite    http://loadjs.cn
 * Email      halfthink@163.com
 */
(function() {

    // ###tiny asyn script Loader.
    //```
    // m.load('a.js', 'b.js', function(){});
    //```
    var doc       = document,
        win       = window,
        readyList = [],
        isDomReady;

    var api = function(){
        api.ready.apply(null,arguments);
    };


    // ---------- Tool ---------- start#
    function noop(){}

    function each(arr, callback){
        if(!arr) return ;

        for ( var i=0; i<arr.length; i++ ) {
            callback.call( arr, arr[i], i );
        }
    }

    function is(type, obj){
        return obj != null && Object.prototype.toString.call(obj).slice(8,-1) == type ;
    }

    function isFunction(obj){
        return is('Function', obj);
    }

    function isArray(obj){
        return is('Array', obj);
    }

    function one(callback) {
        if(callback._done){
            return ;
        }
        callback._done = 1;
        callback();
    }
    // ---------- Tool ---------- end#


    // ---------- Load ---------- start#
    function getFileName(path) {
        /* return test.js */
        var items = path.split('/'),
            name  = items[items.length - 1],
            i     = name.indexOf('?');

        return i == -1 ? name : substring(0, i);
    }

    function getAsset(path) {

        var isExist = false, existIndex;

        var asset = {
            name: getFileName(path),
            url:  path,
            state:false
        };

        var existing = assets[asset.name];

        if (existing) {
            each(existing, function(item, i) {
                if(item.url == asset.url) {
                    isExist = true;
                    existIndex = i;
                }
            });
        }else {
            assets[asset.name] = [];
        }


        if (isExist) {
            return existing[existIndex];
        } else {
            assets[asset.name].push(asset);
        }

        return asset;
    }

    function isAllLoaded(items) {
        items = items || assets;

        for(var item in items) {
            if(items.hasOwnProperty(item) && items[item].state != LOADED) {
                return false;
            }
        }

        return true;
    }

    /*
    function writeScript(src) {
        document.write('<scr'+'ipt type="text/javascript" src="'+ src +'"></scr'+'ipt>');
    }
    */

    var LOADING = 3,
        LOADED  = 4;

    var assets = {},
        handlers = {};

    function loads() {

        var args     = arguments,
            callback = args[args.length - 1],
            items    = {};

        //syn
        if (!isFunction(callback)) {
            alert('no callback fn');
/*
            callback = noop;

            if(isArray(args[0])){
                arguments.callee.apply(null, args[0]);
                return ;
            }

            each(args, function(src) {
                writeScript(src);
            });
 */
            return ;
        }

        if (isArray(args[0])) {
            args[0].push(callback);
            arguments.callee.apply(null, args[0]);
            return;
        }

        // store
        each(args, function(item) {
            if (item != callback) {
                item = getAsset(item);
                items[item.name] = item;
            }
        });

        // begin
        each(args, function(item) {
            if (item != callback) {
                item = getAsset(item);
                load(item, function() {
                    if (isAllLoaded(items)) {
                        one(callback);
                    }
                });
            }
        });
    }

    function load(asset, callback) {

        if (asset.state == LOADED) {
            callback();
            return ;
        }

        if (asset.state == LOADING) {
            handlers[asset.name] || (handlers[asset.name] = []);
            handlers[asset.name].push(callback);
            return ;
        }

        asset.state = LOADING;

        loadScript(asset, function() {

            asset.state = LOADED;

            callback();

            each(handlers[asset.name], function(callback) {
                one(callback);
            });
        });
    }

    function loadScript(asset, callback) {
        callback = callback || noop;

        console.info('request:' + asset.url);

        function error() {
        }

        function process(event) {
            if (event.type === "load" || (/loaded|complete/.test(ele.readyState) && (!doc.documentMode || doc.documentMode < 9))) {
                clearTimeout(asset.errorTimeout);
                ele.onload = ele.onreadystatechange = ele.onerror = null;

                callback();

            }
        }

        var ele;

        ele = doc.createElement('script');
        ele.type = 'text/javascript';
        ele.src = asset.url;

        ele.onload = ele.onreadystatechange = process;
        ele.onerror = error;

        ele.async = false;
        ele.defer = false;

        // 7 second
        asset.errorTimeout = setTimeout(function() {
            error({type:'timeout'});
        }, 7e3);

        var head = doc.head || doc.getElementsByTagName('head')[0];
        head.insertBefore(ele, head.lastChild);

    }


    // ---------- Load ---------- end#


    // ---------- DomReady ---------- start#
    function domContentLoaded() {
        if (doc.addEventListener) {
            doc.removeEventListener('DOMContentLoaded', domContentLoaded, false);
            domReady();
        }
    }

    function domReady() {
        if (!doc.body) {
            clearTimeout(api.readyTimeout);
            api.readyTimeout = setTimeout(domReady, 50);
            return;
        }

        if(!isDomReady) {
            isDomReady = true;
            domReadyStart();
        }

    }

    function domReadyStart() {
        each(readyList, function(callback) {
            one(callback);
        });

    }

    if (doc.readyState == 'complete') {
        domReady();
    }else if (doc.addEventListener) {
        doc.addEventListener('DOMContentLoaded', domContentLoaded, false);
        win.addEventListener('load', domReady, false);
    }
    // ---------- DomReady ---------- end#



    // ---------- Exports ---------- start#
    api.load = loads;


    api.ready = function(callback){
            if(isDomReady){
                callback();
            }else{
                readyList[readyList.length] = callback;
            }
    };

    window.m = api;
    // ---------- Exports ---------- end#

})();