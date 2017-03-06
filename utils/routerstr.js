var configs = require(`${__dirname.replace('utils','')}/configs`);
var connect = require(`${__dirname}/connect`);
var routerArr = require(`${__dirname}/routerarr`);

module.exports = function(categories,router){
    var routerString = new routerArr();
    routerString.getRouter('/',categories,'',0);
    
    return routerString;
}