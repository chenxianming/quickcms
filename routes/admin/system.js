var __dirname = __dirname.replace('/admin','');

var fs = require('fs');
var code = fs.readFileSync(__dirname+'/common.js','utf8');
eval(code);

module.exports = {
    system:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var path = __dirname.replace('routes',''),
            ps = fs.readdirSync(path+'/views');

        ( () => new Promise( (resolve,reject) => { //get site configs

            var queryStr = `select * from ${configs.pre}configs where id = 1`;

            connect(function(con){
                con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','读取网站配置出错');
                        return res.redirect('/panel/system');
                    }

                    resolve();

                    infomations['datas'] = data[0];
                });
            });
        } ) )().then( () => new Promise( (resolve,reject) => { // get styles

            var styles = [];

            ps.forEach(function(d){
                if(d!='.DS_Store') styles.push({
                    path:d
                });
            });

            infomations['styles'] = styles;

            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {

            var task = new asyncArr(infomations['styles']);
            task.each( (style) => new Promise( (rev,rej) => {
                var a = fs.readFileSync(`${path}views/${style.path}/configs.json`,'utf-8'),
                    styleConfig = eval(`[${a}]`);

                style.configs = styleConfig[0];

                rev();
            } ) ).then( () => {
                resolve();
            } );

        } ) ).then( () => new Promise( (resolve,reject) => {

            c.get(cityjson,function(d){
                try{
                    eval(d);
                    infomations['address'] = returnCitySN.cip;
                    resolve();
                }catch(e){
                    infomations['address'] = '未能获取您的ip';
                    resolve();
                }
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            try{
                
                var testNginx = execSync('sudo nginx -t');
                if(testNginx.indexOf('is successful')>-1){
                    infomations['nginx'] = true;
                }

            }catch(e){
                console.log(e);
                infomations['nginx'] = false;
            }

            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {

            console.log(infomations); //print stystem settings

            res.render('system',{title:'system',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) )
    },
    systemPost:function(req, res, next){
        var obj = req.body;
        var chunk = '';
        var arr = [];
        for(var key in obj){
            arr.push(key + '=' + (obj[key] ? ('"'+obj[key]+'"') : '""') );
        }

        if(arr<1){
            return res.json({
                msg:'关键字不能为空'
            });
        }

        chunk = arr.join(',');

        ;( () => new Promise( (resolve,reject) => {
            var queryStr = `update ${configs.pre}configs set ${chunk} where id = 1`;

            connect(function(con){
                con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });
        } ) )().then( () => new Promise( (resolve,reject) => {
            updateconfigs({port:obj.port});
            setTimeout(function(){
                try{
                    if(global.restartTask){
                        return ;
                    }
                    
                    global.restartTask = execSync(`forever restart ${__dirname.replace('routes','bin/www')}`);
                    
                    setTimeout(function(){
                        gloabal.restartTask = null;
                    },2000);
                    
                }catch(e){
                    console.log(e);
                }
            },1000);

            resolve();
        } ) ).then( () => new Promise( (resolve,reject) => {
            req.flash('error','保存成功');
            res.redirect('/panel/system');
        } ) )
    }
}