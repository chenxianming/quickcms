var request = require('request');
var querystring = require('querystring');
var fs = require('fs');

var FileCookieStore = require('tough-cookie-filestore');
var j = request.jar(new FileCookieStore(__dirname+'/cookies.json'));
request = request.defaults({ jar : j });

module.exports = {
    get:function(url,obj,cb){
        var url = url + '?' + querystring.stringify(obj);
        var args = arguments;
        request({
            url:url,
            method:'get',
            jar:j
        },function(err,data){
            if(err){
                return (typeof args[args.length-1] == 'function') && args[args.length-1](err);
            }
            (typeof args[args.length-1] == 'function') && args[args.length-1](data.body);
        });
    },
    post:function(url,obj,cb){
        var args = arguments;
        request({
            url:url,
            method:'post',
            form:obj,
            jar:j
        },function(err,data){
            if(err){
                return (typeof args[args.length-1] == 'function') && args[args.length-1](err);
            }
            (typeof args[args.length-1] == 'function') && args[args.length-1](data.body);
        });
    },
    postData:function(url,obj,cb){
        var args = arguments;
        request({
            url:url,
            method:'post',
            formData:obj,
            jar:j
        },function(err,data){
            if(err){
                return (typeof args[args.length-1] == 'function') && args[args.length-1](err);
            }
            (typeof args[args.length-1] == 'function') && args[args.length-1](data.body);
        });
    },
    download:function(url,obj,cb){
        var args = arguments;
        request.get(url).on('error',function(err){
            console.log(err);
        }).on('response',function(){
            
            (typeof args[args.length-1] == 'function') && args[args.length-1](obj.dest);
            
        }).pipe( fs.createWriteStream( obj.dest ) );
    }
}
