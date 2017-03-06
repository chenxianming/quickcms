var __dirname = __dirname.replace('/admin','');

var fs = require('fs');
var code = fs.readFileSync(__dirname+'/common.js','utf8');
eval(code);

module.exports = {
    styles:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var path = __dirname.replace('routes',''),
            ps = fs.readdirSync(path+'/views');

        ( () => new Promise( (resolve,reject) => {

            var styles = [];

            ps.forEach(function(d){
                if(d!='.DS_Store') styles.push({
                    path:d
                });
            });

            infomations['styles'] = styles;

            resolve();

        } ) )().then( () => new Promise( (resolve,reject) => {

            var task = new asyncArr(infomations['styles']);
            task.each( (style) => new Promise( (rev,rej) => {
                //string to json
                var a = fs.readFileSync(`${path}views/${style.path}/configs.json`,'utf-8'),
                    styleConfig = eval(`[${a}]`);

                style.configs = styleConfig[0];

                rev();
            } ) ).then( () => {
                resolve();
            } );

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}configs where id = 1`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','读取系统配置错误');
                        return res.redirect('/panel');
                    }

                    infomations['defaultStyle'] = data[0].style;

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            console.log(infomations); //
            res.render('styles',{title:'styles',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

        } ) )

    },
    setdefault:function(req, res, next){
        var guid = req.query.guid || null;

        if(!guid){
            req.flash('error','guid不能为空');
            return res.redirect('/panel/styles');
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `update ${configs.pre}configs set style = "${guid}" where id = 1`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();


                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {
            req.flash('error','设置成功');
            return res.redirect('/panel/styles');
        } ) )

    },
    canceldefault:function(req, res, next){
        var guid = req.query.guid || null;

        if(!guid){
            req.flash('error','guid不能为空');
            return res.redirect('/panel/styles');
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `update ${configs.pre}configs set style = "" where id = 1`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();


                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {
            req.flash('error','设置成功');
            return res.redirect('/panel/styles');
        } ) )

    },
    new:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        res.render('styles_new',{title:'styles - new',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
    },
    post:function(req, res, next){
        var configs = {};

        for(var key in req.body){
            req.body[key] = strFilter(req.body[key]);
            configs[key] = req.body[key];
        }

        var name = req.body.name || null,
            guid = req.body.guid || null,
            entry = req.body.entry || null,
            author = req.body.author || null,
            screenshot = req.body.screenshot || null;

        if(!name || !guid || !entry || !author){
            return res.json({
                msg:'缺少必要参数'
            });
        }

        var parttern = /[0-9a-z\-]+$/;
        if(!parttern.test(guid)){
            return res.json({
                msg:'标识只能由小写字母数字以及-横线组成'
            });
        }

        const basicFiles = `${__dirname.replace('routes','')}utils/templates/`
        var dirName = __dirname.replace('routes','')+'views/' + guid;

        var fsArr = [];

        var bf = fs.readdirSync(basicFiles);
        bf.forEach(function(d){
            if(d!='.DS_Store') fsArr.push(d);
        });

        ( () => new Promise( (resolve,reject) => { //check path
            var isExist = fs.existsSync(dirName);

            if(isExist){
                return res.json({
                    msg:'样式已存在'
                });
            }

            fs.mkdir(dirName,function(result){
                resolve();
            });

        } ) )().then( () => new Promise( (resolve,reject) => { //copy basic files

            var task = new asyncArr(fsArr);
            task.each( (fileName) => new Promise( (rev1,rej1) => {
                var a = fs.readFileSync(basicFiles + fileName,'utf-8');

                fs.writeFile(dirName+'/'+fileName,a,function(){
                    rev1();
                });
            } ) ).then( () => {
                resolve();
            } )

        } ) ).then( () => new Promise( (resolve,reject) => { //write configs file

            fs.writeFile(`${dirName}/configs.json`,JSON.stringify(configs),function(){
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject) => { //done.

            req.flash('error','设置成功');
            req.flash('guid',guid);

            return res.json({
                result:'done.'
            });

        } ) )

    },
    complete:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var arr = req.flash('guid');

        if(!arr[0]){
            req.flash('error','不能直接访问该页面');
            return res.redirect('/panel/styles');
        }

        infomations['guid'] = arr[0];

        res.render('styles_compelte',{title:'styles - compelte',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
    },
    edit:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var guid = req.query.guid || null;

        ( () => new Promise( (resolve,reject) => {
            var path = __dirname.replace('routes',''),
                exist = fs.existsSync(path+'/views/'+guid);

            if(!exist){
                req.flash('error','该样式不存在');
                return res.redirect('/panel/styles');
            }

            //string to json
            var a = fs.readFileSync(`${path}views/${guid}/configs.json`,'utf-8'),
                styleConfig = eval(`[${a}]`);

            infomations['configs'] = styleConfig[0];

            resolve();

        } ) )().then( () => new Promise( (resolve,reject) => {
            res.render('styles_edit',{title:'styles - edit',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) )
    },
    editPost:function(req, res, next){
        for(var key in req.body){
            req.body[key] = strFilter(req.body[key]);
        }

        var guid = req.body.guid || null,
            name  = req.body.name || null,
            entry  = req.body.entry || null,
            author  = req.body.author || null,
            screenShot  = req.body.screenShot || null;

        if(!guid || !name || !entry || !author){
            return res.json({
                msg:'缺少必填字段'
            });
        }

        ( () => new Promise( (resolve,reject) => {
            var path = __dirname.replace('routes',''),
                exist = fs.existsSync(path+'/views/'+guid);

            if(!exist){
                return res.json({
                    msg:'该样式不存在'
                });
            }

            fs.writeFile(`${path}views/${guid}/configs.json`,`${JSON.stringify(req.body)}`,function(){
                resolve();
            });

        } ))().then( () => new Promise( (resolve,reject) => {

            req.flash('error','修改成功');

            res.json({
                result:'done.'
            });
        } ) )
    },
    remove:function(req, res, next){
        for(var key in req.body){
            req.body[key] = strFilter(req.body[key]);
        }

        var guid = req.body.guid || null;

        ( () => new Promise( (resolve,reject) => {
            var path = __dirname.replace('routes',''),
                exist = fs.existsSync(path+'views/'+guid);

            if(!exist){
                return res.json({
                    msg:'该样式不存在'
                });
            }

            fse.removeSync(path+'views/'+guid);

            var views = fs.existsSync(path+'public/views/'+guid);

            if(views){
                fse.removeSync(path+'public/views/'+guid);
            }

            resolve();

        } ))().then( () => new Promise( (resolve,reject) => {

            req.flash('error','删除成功');

            res.json({
                result:'done.'
            });
        } ) )
    },
    share:function(req, res, next){
        var guid = req.query.guid || null;
        
        var infomations = {};
        
        if(!guid){
            req.flash('error','请填写guid');
            return res.redirect('/panel/styles');
        }
        
        var id,
            file;
        
        ( () => new Promise( (resolve,reject) => {
            var path = __dirname.replace('routes',''),
                exist = fs.existsSync(path+'/views/'+guid);

            if(!exist){
                req.flash('error','该样式不存在');
                return res.redirect('/panel/styles');
            }

            //string to json
            var a = fs.readFileSync(`${path}views/${guid}/configs.json`,'utf-8'),
                styleConfig = eval(`[${a}]`);

            infomations['configs'] = styleConfig[0];

            resolve();

        } ) )().then( () => new Promise( (resolve,reject) => {
            
            c.post(`${configs.service}styles/share`,{
                guid:guid,
                name:infomations['configs'].name,
                author:infomations['configs'].author,
                screenShot:infomations['configs'].screenShot
            },function(data){
                try{
                    var data = JSON.parse(data);
                }catch(e){
                    return res.json('分享失败');
                }
                
                if(data.msg){
                    return res.json(data.msg);
                }
                
                
                id = data.result;
                
                resolve();
            });
            
        } ) ).then( () => new Promise( (resolve,reject) => { //zip the style views and assets
            
            var viewsPath = `${__dirname.replace('routes','views')}/${guid}`,
                assetsPath = `${__dirname.replace('routes','public')}/views/${guid}`;
            
            var output = fs.createWriteStream(`${__dirname.replace('routes','temp')}/${guid}.zip`);
            var archive = archiver('zip',{
                store: true
            });

            archive.on('error', function(err) {
              throw err;
            });

            archive.pipe(output);
            if(fs.existsSync(viewsPath)){
                archive.directory(viewsPath,'./views');
            }
            
            if(fs.existsSync(assetsPath)){
                archive.directory(assetsPath,'./public/views');
            }
            
            archive.finalize();
            
            output.on('close', function() {
                resolve();
                console.log('zip complete.');
            });
            
        } ) ).then( () => new Promise( (resolve,reject) => {
            var path = __dirname.replace('routes','temp') + `/${guid}.zip`;
            
            if(!fs.existsSync(path)){
                req.flash('error','未找到样式文件');
                return res.redirect('/panel/styles');
            }
            
            var formData = {
                style:fs.createReadStream(path)
            };
            
            c.postData(`${configs.service}styles/upload/${id}`,formData,function(data){
                var data = JSON.parse(data);
                if(data.msg){
                    req.flash('error',data.msg);
                    return res.redirect('/panel/styles');
                }
                
                resolve();
            });
            
        } ) ).then( () => new Promise( (resolve,reject) => {
            
            req.flash('error','分享成功,请等待审核.');
            res.redirect('/panel/styles');
            
        } ) );
    },
    center:function(req, res, next){
        var infomations = {};
        
        var page = req.query.page || 1,
            count = req.query.count || 20;
        
        ( () => new Promise( (resolve,reject) => {
            c.post(`${configs.service}styles/list`,function(data){
                try{
                    infomations = JSON.parse(data);
                    resolve();
                }catch(e){
                    req.flash('error','读取样式失败');
                    return res.redirect('/panel/styles');
                }
            });
        } ) )().then( () => new Promise( (resolve,reject) => {
            
            infomations['nowPage'] = page;
            infomations['query'] = req.query;
            
            infomations['username'] = req.session.userData.username;
            infomations['useravatar'] = req.session.userData.avatar;
            infomations['groupsName'] = req.session.userData.groupsName;
            
            console.log(infomations);
            
            res.render('styles_center',{title:'styles - center',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
            
        } ) )
    },
    get:function(req, res, next){
        var guid = req.body.guid || null;
        var infomations = {};
        
        var destPath,
            randomStr = ~~(Math.random() * 2000000);
        
        if(!guid){
            return res.json({
                msg:'请填写guid'
            });
        }
        
        ( () => new Promise( (resolve,reject) => {
            
            var path = __dirname.replace('routes',''),
                exist = fs.existsSync(path+'views/'+guid);
            
            if(exist){
                return res.json({
                    msg:'该样式已存在'
                });
            }
            
            resolve();
            
        } ) )().then( () => new Promise( (resolve,reject) => {
            
            c.post(`${configs.service}styles/get`,{
                guid:guid
            },function(data){
                try{
                    infomations = JSON.parse(data);
                    
                    if(infomations.msg){
                        return res.json({
                            msg:infomations.msg
                        });
                    }
                    
                    resolve();
                }catch(e){
                    return res.json({
                        msg:'获取失败'
                    });
                }
            });
            
        } ) ).then( () => new Promise( (resolve,reject) => {
            var url = configs.service.substr(0,configs.service.length-1)+infomations.files;
            
            download(url, {dest:`${__dirname.replace('routes','temp')}/${randomStr}.zip`, ext:false}, function (err, result) {
                destPath = `${__dirname.replace('routes','temp')}/${randomStr}.zip`;
                resolve();
            });
            
        } ) ).then( () => new Promise( (resolve,reject) => {
            
            extract(destPath, {dir:`${__dirname.replace('routes','temp')}/${randomStr}/`}, function (err) {
                resolve();
            });
            
            
        } ) ).then( () => new Promise( (resolve,reject) => {

            var viewsPath = `${__dirname.replace('routes','temp')}/${randomStr}/views`,
                publicPath = `${__dirname.replace('routes','temp')}/${randomStr}/public/views`;
            
            var arr = [];
            
            if(fs.existsSync(viewsPath)){
                arr.push(viewsPath);
            }
            
            if(fs.existsSync(publicPath)){
                arr.push(publicPath);
            }
            
            var tasks = new asyncArr(arr);
            
            tasks.each( (rsPath) => new Promise( (rev1,rej1) => {
                var destPath = rsPath == viewsPath ? `${__dirname.replace('routes','views')}/${guid}` : `${__dirname.replace('routes','public/views')}/${guid}`; 
                
                fse.move(rsPath,destPath,function(err){
                    if(err){
                        return console.log(err);
                    }
                    rev1();
                })
                
            } ) ).then( () => {
                resolve();
            } )
            
        } ) ).then( () => new Promise( (resolve,reject) => {

            req.flash('error','添加成功');
            res.json({
                result:'done.'
            });
            
        } ) )
        
    }
}

