var configs = require(`${__dirname.replace('routes','')}/configs`);
var connect = require(`${__dirname.replace('routes','')}/utils/connect`);
var md5 = require('md5');
var isMd5 = require('is-md5');
var parse = require('parse-seconds');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({
    uploadDir:`${__dirname.replace('routes','')}/public/upload`
});

var multipartMiddlewareTemp = multipart({
    uploadDir:`${__dirname.replace('routes','')}/temp`
});

var multipartMiddlewareAvatar = multipart({
    uploadDir:`${__dirname.replace('routes','')}/public/upload/avatar`
});

var os = require('os');
var fs = require('fs');

var asyncArr = require('async-arr');
var base64 = require('base64-coder-node')();

var strFilter = require(`${__dirname.replace('routes','')}/utils/strfilter`);

var cityjson = 'http://pv.sohu.com/cityjson?ie=utf-8';

var c = require(`${__dirname.replace('routes','')}/utils/request`);
var request = require('request');

var execSync = require('child_process').execSync;

var mysqlDump = require('mysqldump');

var updateconfigs = require(`${__dirname.replace('routes','')}/utils/updateconfigs`);

var fse = require('fs-extra');

var archiver = require('archiver');

var extract = require('extract-zip')

var download = require('my-wget');