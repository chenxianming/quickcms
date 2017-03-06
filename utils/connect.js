var mysql = require('mysql');

var configs = require(__dirname.replace('utils','configs.js'));

var con = function(settings,fn){
    
    var args = arguments;
    
    var obj = (typeof settings=='object') ? settings : {
        host:configs.sqlhost,
        port:configs.sqlport,
        user:configs.user,
        password:configs.password,
        database:configs.database,
        multipleStatements:true
    };
    
    var connection = mysql.createConnection(obj);
    connection.connect(function(errs){
        if(errs){
            throw errs;
        }
        (typeof args[args.length-1] == 'function') && args[args.length-1](connection);
    });
}

module.exports = con;