var configs = require(`${__dirname.replace('utils','')}configs`);
var connect = require(`${__dirname}/connect`);
var routerArr = require(`${__dirname}/routerarr`);
var routerStr = require(`${__dirname}/routerstr`);

var asyncArr = require('async-arr');
var fs = require('fs');
var os = require('os');
var base64 = require('base64-coder-node')();

module.exports = function(){
    var date = new Date().getTime();
    
    ( () => new Promise( (resolve,reject) => {
        
        var queryStr = `select * from ${configs.pre}extensions`;
        
        connect(function(con){
            con.query(queryStr,function(err,data){
                if(err){
                    throw err;
                }
                
                con.end();
                
                if(!data[0]){
                    return ;
                }
                
                resolve(data);
                
            });
        });
        
    } ) )().then( (datas) => new Promise( () => {
        
        var task = new asyncArr(datas);
        task.each( (item) => new Promise( (rev1,rej1) => {
            if(!item.actions){
                return rev1();
            }
            
            var actions = base64.decode(item.actions);
            if(actions.panelStack) actions.panelStack(function(){
                rev1();
            });
            
        } ) ).then( () => {
            console.log(`done ===> ${new Date().getTime() - date} (ms) `);
        } )
        
    } ) )
}