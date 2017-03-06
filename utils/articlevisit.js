var configs = require(`${__dirname.replace('utils','')}/configs`);
var connect = require(`${__dirname}/connect`);
module.exports = function(model,id,callback){
    if(!model || !id){
        return '缺少必要参数'
    }
    
    var queryStr = `update ${configs.pre}content_${model} set views = views+1 where id = ${id}`;

    connect(function(con){
        var queryFn = con.query(queryStr,function(err,data){
            if(err){
                throw err;
            }

            con.end();

            callback && callback(queryFn);
        });
    });
}