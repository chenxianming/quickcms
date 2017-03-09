var __dirname = __dirname.replace('/admin','');

var fs = require('fs');
var code = fs.readFileSync(__dirname+'/common.js','utf8');
eval(code);


module.exports = {
    panel:function(req, res, next) {
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ;( ()=> new Promise( (resolve,reject) => {

            try{
                infomations['versions'] = require(__dirname.replace('routes','package.json')).version;
                infomations['systemver'] = os.platform().replace(os.platform()[0],os.platform()[0].toUpperCase())+' '+os.release();
                infomations['date'] = parse(os.uptime());
                infomations['freemem'] = os.freemem();
                infomations['totalmem'] = os.totalmem();
                infomations['arch'] = os.arch();
                infomations['thread'] = os.cpus().length;
                infomations['cpus'] = os.cpus()[0];
                infomations['uptime'] = os.uptime();

            }catch(e){
                console.log(e);
            }

            console.log(infomations); //print infomations

            resolve();
        } ) )().then( () => new Promise( (resolve,reject) => {
            
            if(global.address){
                infomations['address'] = global.address;
                return resolve();
            }
            
            c.get(cityjson,function(d){
                try{
                    eval(d);
                    infomations['address'] = returnCitySN.cip;
                }catch(e){
                    infomations['address'] = '未能获取您的ip';
                }
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject)=>{
            if(global.news){
                infomations['news'] = global.news;
                return resolve();
            }
            
            c.post(`${configs.service}news/get`,{
                count:5
            },function(data){
                try{
                    infomations['news'] = eval(data);
                }catch(e){
                    infomations['news'] = [];
                }
                
                resolve();
            });
            
        } ) ).then( () => new Promise( (resolve,reject)=>{
            if(typeof infomations['news'] != 'object'){
                infomations['news'] = [];
            }
            res.render('admin',{title:'index',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) )

    }
}