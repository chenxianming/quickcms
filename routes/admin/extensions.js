var __dirname = __dirname.replace('/admin','');

var fs = require('fs');
var code = fs.readFileSync(__dirname+'/common.js','utf8');
eval(code);

module.exports = {
    extensions:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var count = req.query.count || 20,
            page = req.query.page || 1;

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}extensions`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    var pageContainer = [],
                        pageCount = Math.ceil(data.length / count);

                    for(var i = 1;i <= (pageCount); i++){
                        var active = i==page ? true : false;
                        pageContainer.push({
                            val:i,
                            current:active
                        });
                    }

                    var arr = [];
                    for(var i = count * (page-1); i<count*page; i++){
                        if(data[i]){
                            arr.push(data[i]);
                        }
                    }

                    infomations['nowPage'] = page;
                    infomations['extensions'] = arr;
                    infomations['pageContainer'] = pageContainer;
                    infomations['query'] = req.query;

                    resolve();
                });
            });

        } ) )().then( ()=>new Promise( (resolve,reject) => {

            res.render('extensions',{title:'extensions',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

        } ) );
    },
    view:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var guid = req.query.guid || null;
        var layer = req.query.layer || 'default';

        if(!guid){
            req.flash('error','请填写guid');
            return res.redirect('/panel/extensions');
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}extensions where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','该拓展不存在');
                        return res.redirect('/panel/extensions');
                    }

                    infomations['datas'] = data[0];

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            try{
                var str = base64.decode(infomations['datas'].layers);
                var a = eval(`[${str}]`);

                infomations['datas'].layers = a[0];

                infomations['datas'].layers[layer].preload({
                    configs:configs,
                    connect:connect
                },function(datas){
                    datas.extensionsData = infomations['datas'].datas;
                    infomations['layer'] = infomations['datas'].layers[layer].render(datas);
                    resolve();
                });

            }catch(e){
                req.flash('error','读取拓展错误');
                return res.redirect('/panel/extensions');
            }


        } ) ).then( () => new Promise( (resolve,reject) => {

            res.render('extensions_view',{title:infomations.datas.name+' '+' - extensions',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

        } ) );
    },
    set:function(req, res, next){
        var guid = req.query.guid || null,
            status = req.query.status || null;

        if(!guid || !status){
            req.flash('error','缺少必填参数');
            return res.redirect('/panel/extensions');
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `update ${configs.pre}extensions set status="${status==1 ? 'normal' : 'cancel'}" where guid = "${guid}"`;

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
            return res.redirect('/panel/extensions');
        } ) )
    },
    remove:function(req, res, next){
        var guid = req.body.guid || null;
        if(!guid){
            return res.json({
                msg:'请填写guid'
            });
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}extensions where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'该拓展不存在'
                        });
                    }

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var queryStr = `delete from ${configs.pre}extensions where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {
            req.flash('error','删除成功');
            res.json({
                result:'done.'
            });
        } ) )
    },
    actions:function(req, res, next){
        var guid = req.query.guid || null,
            action = req.query.action || null,
            params = req.query.params || null;

        if(!guid){
            req.flash('error','请填写guid');
            return res.redirect('/panel/extensions');
        }

        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}extensions where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','该拓展不存在');
                        return res.redirect('/panel/extensions');
                    }

                    infomations['datas'] = data[0];

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            try{
                var str = base64.decode(infomations['datas'].actions);
                var a = eval(`[${str}]`);

                a[0][action](params);

            }catch(e){
                req.flash('error','读取拓展错误');
                return res.redirect('/panel/extensions');
            }


        } ) )
    },
    actionsPost:function(req, res, next){
        var guid = req.body.guid || null,
            action = req.body.action || null,
            params = req.body.params || null;

        if(!guid){
            return res.json({
                msg:'请填写guid'
            });
        }

        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}extensions where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'该拓展不存在'
                        });
                    }

                    infomations['datas'] = data[0];

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            try{
                var str = base64.decode(infomations['datas'].actions);
                var a = eval(`[${str}]`);

                a[0][action](params);

            }catch(e){
                console.log(e);
                return res.json({
                    msg:'读取拓展错误'
                });
            }


        } ) )
    },
    upload:function(req, res, next){
        var guid = req.params.guid || null;
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var file = req.files.extensions.path || null;

        if(!file){
            return res.json({
                msg:'错误'
            });
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}extensions where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'该拓展不存在'
                        });
                    }

                    infomations['datas'] = data[0];

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var input = infomations['datas'].input;
            if(input.indexOf('upload')<0){
                return res.json({
                    msg:'该拓展无法使用文件上传'
                });
            }

            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {

            try{
                var json = require(file);
                res.json(json);
            }catch(e){
                res.json({
                    msg:'该数据无法解析'
                });
            }

        } ) )
    },
    center:function(req,res,next){
        var infomations = {};
        
        var page = req.query.page || 1,
            count = req.query.count || 20;
        
        ( () => new Promise( (resolve,reject) => {
            c.post(`${configs.service}extensions/list`,function(data){
                try{
                    infomations = JSON.parse(data);
                    resolve();
                }catch(e){
                    req.flash('error','读取拓展失败');
                    return res.redirect('/panel/extensions');
                }
            });
        } ) )().then( () => new Promise( (resolve,reject) => {
            
            infomations['nowPage'] = page;
            infomations['query'] = req.query;
            
            infomations['username'] = req.session.userData.username;
            infomations['useravatar'] = req.session.userData.avatar;
            infomations['groupsName'] = req.session.userData.groupsName;
            
            res.render('extensions_center',{title:'extensions - center',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
            
        } ) )
    },
    add:function(req,res,next){
        var guid = req.body.guid || null;
        
        if(!guid){
            return res.json({
                msg:'该拓展无法使用文件上传'
            });
        }
        
        var datas = {};
        var arrKey = [],
            arrValue = [];
        
        ( () => new Promise( (resolve,reject) => {
            
            var queryStr = `select * from ${configs.pre}extensions where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(data[0]){
                        return res.json({
                            msg:'该拓展已存在'
                        });
                    }

                    resolve();
                });
            });
            
        } ) )().then( () => new Promise( (resolve,reject) => {
            
            c.post(`${configs.service}extensions/get`,{
                guid:guid
            },function(data){
                datas = JSON.parse(data);
                resolve();
            });
            
        } ) ).then( () => new Promise( (resolve,reject) => {
            var keywords = ['id','centerpage','downloads']
            
            for(var key in datas){
                if(keywords.indexOf(key)<0){
                    arrKey.push(key);
                    arrValue.push(`\"${datas[key]}\"`);
                }
            }
            
            var keys = arrKey.join(','),
                values = arrValue.join(',');
            
            var queryStr = `insert into ${configs.pre}extensions (${keys}) values(${values})`;
            
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });
            
            
        } ) ).then( () => new Promise( (resolve,reject) => {
            
            req.flash('error','拓展添加成功');
            res.json({
                result:'done.'
            });
            
        } ) )
        
    }
}