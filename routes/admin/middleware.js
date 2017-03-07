var __dirname = __dirname.replace('/admin','');

var fs = require('fs');
var code = fs.readFileSync(__dirname+'/common.js','utf8');
eval(code);

var updaterouter = require(`${__dirname.replace('routes','utils')}/updaterouter`);

module.exports = {
    login:function(req,res,next){
        if(!req.session.userData){
            return res.redirect('/panel/login');
        }
        next();
    },
    roles:function(req,res,next){
        var groups = req.session.userData.groups;
        var infomations = {};
        var urls = req.originalUrl.split('/');

        ;( () => new Promise( (resolve,reject) => {
            var queryStr = `select * from ${configs.pre}groups where guid = "${groups}"`;

            connect(function(con){
                con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','读取网站配置出错');
                        return res.redirect('/panel');
                    }

                    resolve();

                    infomations['roles'] = eval(data[0].roles);

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            configs.roles.forEach(function(d,i){
                d.forEach(function(g,j){
                    var permisision = infomations['roles'][i][j];
                    //console.log(g.key+' '+urls[urls.length-1]);
                    if(g.key == urls[urls.length-1]){
                        if(permisision!=1){
                            req.flash('error','该用户无访问权限');
                            return res.redirect('/panel');
                        }
                    }
                });
            });

            next();
        } ) )
    },
    updateDymicRoutes:function(req,res,next){
        //update dynamicRouter
        
        var isUpdate = false;
        var urls = req.originalUrl.split('/');
        var keywords = ['categories','update','model','collections'];
        var method = req.method;
        
        urls.forEach(function(d){
            if(keywords.indexOf(d)>-1 && method=='POST'){
                isUpdate = true;
            }
        });
        
        if(isUpdate){
            updaterouter();
            
            var www = __dirname.indexOf('utils') > -1 ? __dirname.replace('utils','bin/www') : __dirname.replace('routes','bin/www');
            
            setTimeout(function(){
                try{
                    console.log('forever restart');
                    if(global.restartTask){
                        return ;
                    }
                    
                    gloabal.restartTask = execSync(`forever restart ${www}`);
                    
                    setTimeout(function(){
                        gloabal.restartTask = null;
                    },2000);
                }catch(e){
                    console.log('重启forever失败');
                }
            },10000);
        }
        
        next();
    }
}