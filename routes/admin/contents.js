var __dirname = __dirname.replace('/admin','');

var fs = require('fs');
var code = fs.readFileSync(__dirname+'/common.js','utf8');
eval(code);

module.exports = {
    contents:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}collection_config`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误'
                        });
                    }

                    con.end();

                    resolve(data);
                });
            });

        } ) )().then( (tables) => new Promise( (resolve,reject) => {

            var arr = [];
            tables.forEach(function(p){
                arr.push({
                    name:p.name,
                    guid:p.guid
                });
            });

            var tasks = new asyncArr(arr);
            tasks.each((item) => new Promise( (rev,rej) => {

                var queryStr = `select * from ${configs.pre}collections_${item.guid}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:'错误'
                            });
                        }

                        con.end();

                        item.length = data.length;
                        rev(item);

                    });
                });

            } )).then(function(results){
                infomations['collections'] = results;
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}media`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误'
                        });
                    }

                    con.end();

                    infomations['media'] = {
                        count:data.length
                    }

                    var image = 0,
                        video = 0,
                        audio = 0;

                    data.forEach(function(d,i){
                        if(d.type.indexOf('audio')>-1){
                            audio++;
                        }
                        if(d.type.indexOf('video')>-1){
                            video++;
                        }
                        if(d.type.indexOf('image')>-1){
                            image++;
                        }
                    });

                    infomations['media']['video'] = video;
                    infomations['media']['audio'] = audio;
                    infomations['media']['image'] = image;

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}ctgenerator`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误'
                        });
                    }

                    con.end();

                    resolve(data);
                });
            });

        } ) ).then( (models) => new Promise( (resolve,reject) => {
            var tasks = new asyncArr(models);

            tasks.each( (item) => new Promise( (res,rej) => {
                var queryStr = `select * from ${configs.pre}content_${item.guid}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:'错误'
                            });
                        }

                        con.end();

                        item.length = data.length;

                        res(item);
                    });
                });
            } ) ).then(function(results){
                infomations['models'] = results;
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}comments`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误'
                        });
                    }

                    con.end();

                    infomations['comments'] = {
                        topic:data.length
                    }

                    resolve(data);
                });
            });

        } ) ).then( (comments) => new Promise( (resolve,reject) => {

            var reply = 0;
            var tasks = new asyncArr(comments);
            tasks.each( (comment) => new Promise( (rev,rej) => {
                var datas = eval(comment.datas);
                reply += datas.length;
                rev();
            } ) ).then(function(){
                infomations['comments']['reply'] = reply;
                infomations['comments']['count'] = reply + infomations['comments']['topic'];
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject) => {
            console.log(infomations);//print results
            res.render('contents',{title:'system',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) )

    },
    media:function(req, res, next){
        var page = req.query.page || 1,
            count = req.query.count || 11,
            keywords = req.query.keywords || '';

        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        keywords = strFilter(keywords);

        ( () => new Promise( (resolve,reject)=>{
            var queryStr = `select * from ${configs.pre}media where name like '%${keywords}%' or description like '%${keywords}%'`;

            connect(function(con){
                con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve(data);

                });
            });
        } ) )().then( (datas) => new Promise( (resolve,reject)=>{
            if(!datas[0]){
                infomations['datas'] = [];
                return resolve();
            }

            //sort by date
            datas.sort( (a,b) => b.id - a.id );

            var pageContainer = [],
                pageCount = Math.ceil(datas.length / count);

            for(var i = 1;i <= (pageCount); i++){
                var active = i==page ? true : false;
                pageContainer.push({
                    val:i,
                    current:active
                });
            }

            var arr = [];
            for(var i = count * (page-1); i<count*page; i++){
                if(datas[i]){
                    arr.push(datas[i]);
                }
            }

            infomations['datas'] = arr;
            infomations['pageContainer'] = pageContainer;
            infomations['query'] = req.query;

            resolve();
        } ) ).then( (datas) => new Promise( (resolve,reject)=>{

            res.render('media',{title:'system',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) )
    },
    mediaPost:function(req, res, next){
        ( () => new Promise( (resolve,reject)=>{
            var queryStr = `select * from ${configs.pre}media`;

            connect(function(con){
                con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve(data);
                });
            });
        } ) )().then( (datas) => new Promise( (resolve,reject)=>{
            //sort by date
            datas.sort( (a,b) => b.id - a.id );

            res.json({
                result:datas
            });
        } ) )
    },
    upload:function(req, res, next){
        if(req.files.media.type.indexOf('image')<0 && req.files.media.type.indexOf('audio')<0 && req.files.media.type.indexOf('video')<0 ){
            return res.json({
                msg:'格式错误'
            });
        }
        var file = req.files.media.path || null;
        if(!file){
            return res.json({
                msg:'错误'
            });
        }

        var temp = __dirname.replace('routes','public');
        file = file.replace(temp,'');

        var name = req.files.media.name,
            type = req.files.media.type;

        var id = null;

        ( ()=> new Promise( (resolve,reject)=>{
            var queryStr = `insert into  ${configs.pre}media (name,type,description,link) values("${name}","${type}","","${file}")`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    id = queryFn['_results'][0]['insertId'];

                    resolve();
                });
            });
        } ) )().then( ()=> new Promise( (resolve,reject)=>{
            res.json({
                id:id,
                url:file,
                name:name,
                type:type
            });
        } ) );
    },
    getMedia:function(req, res, next){
        var id = req.params.id || null;
        if(!id){
            return res.json({
                msg:'err'
            });
        }

        ( ()=>new Promise( (resolve,reject)=>{
            var queryStr = `select * from ${configs.pre}media where id = "${id}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'已删除'
                        });
                    }

                    resolve(data[0]);
                });
            });
        } ) )().then( (data) => new Promise( (resolve,reject)=>{
                res.json(data);
        } ) )
    },
    remove:function(req, res, next){
        var id = req.body.id || null;
        if(!id){
            return res.json({
                msg:'请填写id'
            });
        }
        
        var link;

        ;( () => new Promise( (resolve,reject) => {
            var queryStr = `select * from ${configs.pre}media where id = "${id}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'已删除'
                        });
                    }

                    link = data[0].link;
                    resolve(data[0]);
                });
            });

        } ) )().then( (data) => new Promise( (resolve,reject) => {

            var queryStr = `delete from ${configs.pre}media where id = "${id}"`;
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

            var dp = __dirname.replace('/routes',''),
                path = dp + '/public' + link;

            if(!fs.existsSync(path)){
                return res.json({
                    msg:'该文件不存在或已转移目录'
                });
            }

            fs.unlinkSync(path);

            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {

            res.json({
                result:'done.'
            });
        } ) )
    },
    editdescription:function(req, res, next){
        var id = req.body.id || null;
        var str = req.body.str || null;

        if(!id || !str){
            return res.json({
                msg:'缺少必填字段'
            });
        }

        str = strFilter(str);

        ( ()=>new Promise( (resolve,reject)=>{
            var queryStr = `update ${configs.pre}media set description = "${str}" where id = ${id}`;

            connect(function(con){
                con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });
        } ) )().then( ()=>new Promise( (resolve,reject)=>{
            res.json({
                result:'done.'
            });
        } ) )
    },
    collections:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ( ()=>new Promise( (resolve,reject)=>{
            var queryStr = `select * from ${configs.pre}collection_config`;
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve(data);
                });
            });
        } ) )().then( (datas)=>new Promise( (resolve,reject) => {
            var task = new asyncArr(datas);
            task.each((item) => new Promise( (rev,rej)=>{
                var queryStr = `select * from ${configs.pre}collections_${item.guid}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err;
                        }

                        con.end();
                        item.length = data.length;
                        rev();
                    });
                });
            } )).then( function(){
                resolve(datas);
            } );
        } ) ).then( (datas) => new Promise( (resolve,reject) => {
            console.log(datas);//print results

            infomations['datas'] = datas || [];
            res.render('collections',{title:'collections',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) )
    },
    collectionsview:function(req, res, next){
        var infomations = {};

        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var id = req.query.guid || null;

        var page = req.query.page || 1;
        var count = req.query.count || 20;

        var keywords = req.query.keywords || '';

        if(keywords){
            keywords = strFilter(keywords);
        }

        if(!id){
            req.flash('error','id不能为空');
            return res.redirect('/panel/contents/collections');
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}collection_config where guid = "${id}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','id不正确');
                        return res.redirect('/panel/contents/collections');
                    }

                    infomations['guid'] = id;
                    infomations['info'] = data[0];

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}collections_${id} where title like '%${keywords}%'`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    data.sort( (a,b)=> b.id - a.id );

                    var listsData = [];

                    data.forEach(function(p,i){
                        if(data.length >= count ){
                            if( (i >= (page-1) * count) && i<= ((page) * count - 1) ){
                                listsData.push(p);
                            }
                        }else{
                            listsData.push(p);
                        }
                    });

                    var pageContainer = [],
                        pageCount = Math.ceil(data.length / count);

                    for(var i = 1;i <= (pageCount); i++){
                        var active = i==page ? true : false;
                        pageContainer.push({
                            val:i,
                            current:active
                        });
                    }

                    infomations['lists'] = listsData;
                    infomations['pages'] = pageContainer;

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var tasks = new asyncArr(infomations['lists']);

            tasks.each( (item) => new Promise( (rev,rej) => {
                var model = item.model || '';
                var id = item.ctid || '';

                item.model = model;

                var queryStr = `select * from ${configs.pre}content_${model} where id = ${id}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return rev();
                        }

                        con.end();

                        item.detail = data[0] || {};

                        rev();
                    });
                });

            } )).then(function(){
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var tasks = new asyncArr(infomations['lists']);

            tasks.each( (item) => new Promise( (rev,rej) => {
                var id = item.ctid || null,
                    model = item.model || null;

                var queryStr = `select * from ${configs.pre}comments where ctid = ${id} and model = "${model}"`;
                console.log(queryStr);
                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return rev();
                        }

                        con.end();

                        if(data[0]){
                            item['comments'] = data[0];
                        }

                        rev();
                    });
                });

            } )).then(function(){
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            console.log(infomations); //print results 
            infomations['nowPage'] = page;
            infomations['query'] = req.query;

            res.render('collectionsview',{title:'collections',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) )
    },
    collectionsdetail:function(req, res, next){
        
        var model = req.query.model || null,
            id = req.query.id || null;

        if(!id || !model){
            req.flash('error','缺少必填参数');
            return res.redirect('/panel/contents/collections');
        }

        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ( ()=> new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}ctgenerator where guid = "${model}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','model不正确');
                        return res.redirect('/panel/contents/collections');
                    }

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {
            var queryStr = `select * from ${configs.pre}ctconfig_${model}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    infomations['datas'] = data || [];

                    resolve();
                });
            });
        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}content_${model} where id = "${id}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','id不正确');
                        return res.redirect('/panel/contents/collections');
                    }

                    infomations['contents'] = data[0];
                    infomations['datas'].forEach(function(d){
                        if(d.type=='content'){
                            var value = infomations['contents']['field_'+d.id];
                            try{
                                var dValue = base64.decode(value);
                                infomations['contents']['field_'+d.id] = dValue;
                            }catch(e){
                                req.flash('error','读取内容字段失败');
                            }
                        }
                    });

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}category`;
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    infomations['categories'] = data[0].datas;

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            console.log(infomations); //print results

            infomations['guid'] = infomations.contents.guid;
            infomations['model'] = model;
            infomations['id'] = id;

            res.render('editpost',{title:'editpost',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) )

    },
    upcontent:function(req, res, next){
        var model = req.body.model || null,
            id = req.body.id || null;

        if(!id || !model){
            return res.json({
                msg:'缺少必填参数'
            });
        }

        var uptime = new Date().getTime();

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}content_${model} where id = ${id}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'id不正确'
                        });
                    }

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var queryStr = `update ${configs.pre}content_${model} set up = "${uptime}" where id = ${id}`;

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

            return res.json({
                results:'done.'
            });

        } ) )
    },
    postnew:function(req, res, next){

        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var id = req.query.guid || null;
        var model = req.query.model || null;

        if(!id){
            req.flash('error','id不能为空');
            return res.redirect('/panel/contents/collections');
        }

        if(!model){ //step 1
            ( ()=>new Promise( (resolve,reject) => {

                var queryStr = `select * from ${configs.pre}collection_config where guid = "${id}"`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err;
                        }

                        con.end();

                        if(!data[0]){
                            req.flash('error','id不正确');
                            return res.redirect('/panel/contents/collections');
                        }

                        infomations['info'] = data[0];

                        resolve();
                    });
                });

            } ) )().then( ()=>new Promise( (resolve,reject) => {
                var queryStr = `select * from ${configs.pre}ctgenerator`;
                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err;
                        }

                        con.end();

                        resolve(data);
                    });
                });
            } ) ).then( (datas) => new Promise( (resolve,reject) => {
                infomations['datas'] = datas || [];

                console.log(infomations); //print results

                res.render('postselectmodel',{title:'selectmodel',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

            } ) )
        }else{ //step 2
            //prepear
            infomations['guid'] = id;
            infomations['model'] = model;

            ( () => new Promise( (resolve,reject) => {

                var queryStr = `select * from ${configs.pre}collection_config where guid = "${id}"`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err;
                        }

                        con.end();

                        if(!data[0]){
                            req.flash('error','id不正确');
                            return res.redirect('/panel/contents/collections');
                        }

                        infomations['info'] = data[0];

                        resolve();
                    });
                });

            } ) )().then( ()=> new Promise( (resolve,reject) => {

                var queryStr = `select * from ${configs.pre}ctgenerator where guid = "${model}"`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err;
                        }

                        con.end();

                        if(!data[0]){
                            req.flash('error','id不正确');
                            return res.redirect('/panel/contents/collections');
                        }

                        resolve();
                    });
                });

            } ) ).then( () => new Promise( (resolve,reject) => {

                var queryStr = `select * from ${configs.pre}category`;
                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err;
                        }

                        con.end();

                        infomations['categories'] = data[0].datas;

                        resolve();
                    });
                });

            } ) ).then( () => new Promise( (resolve,reject) => {

                var queryStr = `select * from ${configs.pre}ctconfig_${model}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err;
                        }

                        con.end();

                        infomations['datas'] = data;

                        resolve();
                    });
                });

            } ) ).then( () => new Promise( (resolve,reject) => {
                console.log(infomations); //print results

                res.render('newpost',{title:'newpost',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
            } ) )
        }

    },
    recivepostobject:function(req, res, next){
        var obj = req.body.datas || null;

        var guid = req.body.guid || null;
        var model = req.body.model || null;

        if(!obj || !guid || !model){
            return res.json({
                msg:'缺少必填参数'
            });
        }

        var datas = JSON.parse(obj);

        datas.author = req.session.userData.username;//set author

        console.log(datas);

        var title = strFilter(datas.title);

        var chunkKey = '',
            keyArr = [];

        var chunkValue = '',
            valueArr = [];

        for(var key in datas){
            var value = datas[key];

            if(value){
                keyArr.push(key);
                valueArr.push(value);
            }
        }

        ;( ()=> new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}ctgenerator where guid = "${model}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'guid不正确'
                        });
                    }

                    resolve();
                });
            });

        } ) )().then( ()=> new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}collection_config where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'内容id不正确'
                        });
                    }

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}ctconfig_${model}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve(data);
                });
            });

        } ) ).then( (ctconfig) => new Promise( (resolve,reject) => {
            //convert queryString
            var isContents = [];

            keyArr.forEach(function(d,j){
                if(d.indexOf('field_')>-1){
                    var id = d.replace('field_','');

                    ctconfig.forEach(function(p,i){
                        if(p.id==id && p.type=='content'){
                            isContents.push(j);
                        }
                    });
                }
            });

            keyArr.forEach(function(d,i){
                if(d){
                    chunkKey += `${ (i==0) ? '' : ',' }${d}`;
                }
            });

            valueArr.forEach(function(d,i){
                if(d){
                    //var value = isContents.indexOf(i) > -1 ? base64.encode(d) : d;
                    var value = '';

                    if(isContents.indexOf(i) > -1){
                        value = base64.encode(d);
                    }else{
                        if(typeof d == 'string'){
                            value = strFilter(d);
                        }else{
                            value = d;
                        }
                    }

                    chunkValue += `${ (i==0) ? '' : ',' }"${value}"`;
                }
            });

            resolve();

        } ) ).then( ()=> new Promise( (resolve,reject) => { //insert into contents
            var queryStr = `insert into ${configs.pre}content_${model} (${chunkKey}) values(${chunkValue})`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    var id = queryFn['_results'][0]['insertId'];

                    resolve(id);
                });
            });
        } ) ).then( (id)=> new Promise( (resolve,reject) => { //insert into collections

            var queryStr = `insert into ${configs.pre}collections_${guid} (ctid,title,model) values(${id},"${title}","${model}")`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( ()=> new Promise( (resolve,reject) => { //done.
            var queryStr = `update ${configs.pre}users set posts = posts+1 where username = "${req.session.userData.username}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });
        } ) ).then( ()=> new Promise( (resolve,reject) => { //done.
            req.flash('error','发表成功');
            res.json({
                result:'done.'
            });
        } ) )
    },
    updatepost:function(req, res, next){
        var obj = req.body.datas || null;

        var guid = req.body.guid || null;
        var model = req.body.model || null;
        var id = req.body.id || null;

        if(!obj || !guid || !model || !id){
            return res.json({
                msg:'缺少必填参数'
            });
        }

        var datas = JSON.parse(obj); 
        var title = datas.title.toString();
        var title2 = strFilter(title);

        var chunkKey = '',
            keyArr = [],
            keyArr2 = [];

        var chunkValue = '',
            valueArr = [],
            valueArr2 = [];

        delete datas.views;

        for(var key in datas){
            var value = datas[key];

            if(value){
                keyArr.push(key);
                valueArr.push(value);
            }
        }

        ;( ()=> new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}ctgenerator where guid = "${model}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'guid不正确'
                        });
                    }

                    resolve();
                });
            });

        } ) )().then( ()=> new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}collection_config where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'内容id不正确'
                        });
                    }

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}ctconfig_${model}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve(data);
                });
            });

        } ) ).then( (ctconfig) => new Promise( (resolve,reject) => {
            //convert queryString
            var isContents = [];

            keyArr.forEach(function(d,j){
                if(d.indexOf('field_')>-1){
                    var id = d.replace('field_','');

                    ctconfig.forEach(function(p,i){
                        if(p.id==id && p.type=='content'){
                            isContents.push(j);
                        }
                    });
                }
            });

            keyArr.forEach(function(d,i){
                if(d){
                    keyArr2.push(d);
                }
            });

            valueArr.forEach(function(d,i){
                if(d){
                    //var value = isContents.indexOf(i) > -1 ? base64.encode(d) : d;
                    var value = '';

                    if(isContents.indexOf(i) > -1){
                        value = base64.encode(d);
                    }else{
                        if(typeof d == 'string'){
                            value = strFilter(d);
                        }else{
                            value = d;
                        }
                    }

                    valueArr2.push(value);
                }
            });

            resolve();

        } ) ).then( ()=> new Promise( (resolve,reject) => { //insert into contents
            var chunk = '';
            keyArr2.forEach(function(d,i){
                if(i==0){
                    chunk += `${d}='${valueArr2[i]}'`
                }else{
                    chunk += `,${d}='${valueArr2[i]}'`
                }
            });

            var queryStr = `update ${configs.pre}content_${model} set ${chunk} where id = ${id}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'id不正确#1'
                        });
                    }

                    con.end();

                    resolve();
                });
            });
        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `update ${configs.pre}collections_${guid} set title = '${title}' where ctid = ${id}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'id不正确#2'
                        });
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {
            req.flash('error','更新成功');
            res.json({
                result:'done.'
            });
        } ) );
    },
    removecollections:function(req, res, next){
        var guid = req.body.guid || null;
        var model = req.body.model || null;
        var id = req.body.id || null;

        if(!guid || !model){
            return res.json({
                msg:'缺少必填参数'
            });
        }

        ( () => new Promise( (resolve,reject) => {
            var queryStr = `delete from ${configs.pre}content_${model} where id = "${id}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'删除错误'
                        });
                    }

                    con.end();

                    resolve();
                });
            });
        } ) )().then( () => new Promise( (resolve,reject) => {
            var queryStr = `delete from ${configs.pre}collections_${guid} where ctid = "${id}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'删除错误'
                        });
                    }

                    con.end();

                    resolve();
                });
            });
        } ) ).then( () => new Promise( () => {

            req.flash('error','删除成功');

            return res.json({
                results:'删除成功'
            });

        } ) );
    },
    model:function(req, res, next){

        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ( ()=>new Promise( (resolve,reject) => {
            var queryStr = `select * from ${configs.pre}ctgenerator`;
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve(data);
                });
            });
        } ) )().then( (datas) => new Promise( (resolve,reject) => {
            console.log(datas);//print results

            infomations['datas'] = datas || [];
            res.render('model',{title:'model',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) )
    },
    modelnew:function(req, res, next){

        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        res.render('newmodel',{title:'model - new',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
    },
    modelnewPost:function(req, res, next){
        var guid = req.body.guid || null,
            name = req.body.name || null;

        if(!guid || !name){
            return res.json({
                msg:'缺少必填字段'
            });
        }

        var datas = JSON.parse(req.body.datas);

        ( ()=>new Promise( (resolve,reject)=>{ //check exits

            var queryStr = `select * from ${configs.pre}ctgenerator where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(data[0]){
                        return res.json({
                            msg:'该模型已存在，请重新填写guid'
                        });
                    }else{
                        resolve();
                    }
                });
            });

        } ) )().then( ()=> new Promise( (resolve,reject)=>{

            var queryStr = `insert into ${configs.pre}ctgenerator (name,guid) values("${name}","${guid}")`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( ()=>new Promise( (resolve,reject)=>{

            var queryStr = `DROP TABLE IF EXISTS ${configs.pre}ctconfig_${guid}`;
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( ()=>new Promise( (resolve,reject)=>{

            var queryStr = `create table ${configs.pre}ctconfig_${guid} (id int primary key auto_increment,name VARCHAR(32),value TEXT,type VARCHAR(32),search TINYINT(1),sort TINYINT(1),filter TINYINT(1))`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( ()=>new Promise( (resolve,reject) => {
            var tasks = new asyncArr(datas);
            var the_idx = 0;

            tasks.each( (item) => new Promise( (rev,rej) => {
                var queryStr = `insert into ${configs.pre}ctconfig_${guid} (name,value,type,search,sort,filter) values("${item.name}","${item.value}","${item.type}",${item.search},${item.sort},${item.filter})`;

                the_idx++;

                setTimeout(function(){
                    connect(function(con){
                        var queryFn = con.query(queryStr,function(err,data){
                            if(err){
                                throw err;
                            }

                            con.end();

                            var id = queryFn['_results'][0]['insertId'];

                            rev({
                                id:id,
                                type:item.type
                            });
                        });
                    });
                },(the_idx*100));

            } ) ).then( (ids) => {
                resolve(ids);
            } )
        } ) ).then( (ids) => new Promise( (resolve,reject)=>{

            var queryStr = `DROP TABLE IF EXISTS ${configs.pre}content_${guid}`;
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve(ids);
                });
            });

        } ) ).then( (ids)=> new Promise( (resolve,reject)=>{

            var chunk = '';
            ids.forEach(function(p){
                var type = (p.type == 'content') ? 'LONGTEXT' : 'TEXT';

                chunk+=('field_'+p.id+' '+type+',');
            });

            var queryStr = `
                CREATE TABLE ${configs.pre}content_${guid} (
                    id int(11) unsigned NOT NULL AUTO_INCREMENT,
                    title varchar(32) DEFAULT NULL,
                    category text,
                    postdate varchar(32) DEFAULT NULL,
                    router varchar(32) DEFAULT NULL,
                    tags text,
                    up varchar(32) DEFAULT NULL,
                    views int(12) DEFAULT NULL,
                    guid varchar(32) DEFAULT NULL,
                    author varchar(32) DEFAULT NULL,
                    ${chunk}
                    PRIMARY KEY (id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
            `;

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
            req.flash('error','成功');
            res.json({
                result:'success'
            });
        } ) )
    },
    modelEdit:function(req, res, next){
        var guid = req.query.guid || null;
        if(!guid){
            req.flash('error','guid不正确');
            return res.redirect('/panel/contents/model');
        }

        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ( () => new Promise( (resolve,reject) => {
            var queryStr = `select * from ${configs.pre}ctgenerator where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','读取配置失败,请重试#1');
                        return res.redirect('/panel/contents/model');
                    }

                    resolve();
                });
            });
        } ) )().then( () => new Promise( (resolve,reject)=>{
            var queryStr = `select * from ${configs.pre}ctconfig_${guid}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    infomations['configs'] = data;

                    resolve();
                });
            });
        } ) ).then( () => new Promise( (resolve,reject)=>{
            var queryStr = `select * from ${configs.pre}ctgenerator where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','读取配置失败,请重试#2');
                        return res.redirect('/panel/contents/model');
                    }

                    infomations['name'] = data[0].name;
                    infomations['guid'] = guid;

                    resolve();
                });
            });
        } ) ).then( () => new Promise( (resolve,reject) => {
            console.log(infomations); //print infomations
            res.render('editmodel',{title:'model - edit',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) )
    },
    modelUpdate:function(req, res, next){
        var guid = req.body.guid || null,
            name = req.body.name || null;

        name = strFilter(name);

        if(!guid || !name){
            return res.json({
                msg:'缺少必填字段'
            });
        }

        var ids = [];

        var datas = JSON.parse(req.body.datas);

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}ctgenerator where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(data[0]){
                        resolve();
                    }else{
                        return res.json({
                            msg:'该模型不存在，请重新填写guid'
                        });
                    }
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => { //update name

            var queryStr = `update ${configs.pre}ctgenerator set name = "${name}" where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => { //update configs
            var queryStr = `truncate table ${configs.pre}ctconfig_${guid}`;

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
            var tasks = new asyncArr(datas);
            var the_idx = 0;

            tasks.each( (item) => new Promise( (rev,rej) => {
                var queryStr = `insert into ${configs.pre}ctconfig_${guid} (name,value,type,search,sort,filter) values("${item.name}","${item.value}","${item.type}",${item.search},${item.sort},${item.filter})`;

                the_idx++;

                setTimeout(function(){
                    connect(function(con){
                        var queryFn = con.query(queryStr,function(err,data){
                            if(err){
                                throw err;
                            }

                            con.end();

                            var id = queryFn['_results'][0]['insertId'];

                            rev({
                                id:id,
                                type:item.type
                            });
                        });
                    });
                },(the_idx*100));

            } ) ).then( (idlist) => {
                ids = idlist;
                resolve();
            } )
        } ) ).then( () => new Promise( (resolve,reject) => { //update content table key

            var queryStr = `show fields from ${configs.pre}content_${guid}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve(data);
                });
            });

        } ) ).then( (fields) => new Promise( (resolve,reject) => {

            var arr = [];
            fields.forEach(function(d,i){
                if(d.Field.indexOf('field_')>-1){
                    arr.push(d.Field);
                }
            });

            var dropChunk = '';
            arr.forEach(function(d,i){
                if(i==0){
                    dropChunk += `drop ${d}`;
                }else{
                    dropChunk += `,drop ${d}`;
                }
            });

            var queryStr = `alter table ${configs.pre}content_${guid} ${dropChunk}`;

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

            var chunk = '';

            console.log('ids');
            console.log(ids);

            ids.forEach(function(d,i){
                var id = d.id;
                var type = (d.type == 'content') ? 'LONGTEXT' : 'TEXT';

                if(i==0){
                    chunk += `add field_${id} ${type}`;
                }else{
                    chunk += `,add field_${id} ${type}`;
                }
            });

            var queryStr = `alter table ${configs.pre}content_${guid} ${chunk}`;

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

            req.flash('error','成功');
            res.json({
                result:'success'
            });

        } ) )
    },
    modelRemove:function(req, res, next){
        var guid = req.query.guid || null;
        if(!guid){
            req.flash('error','guid不正确');
            return res.redirect('/panel/contents/model');
        }

        if(guid=='article'){
            req.flash('error','guid不能为默认模型(article)');
            return res.redirect('/panel/contents/model');
        }

        var collections = [];

        ;( () =>  new Promise( (resolve,reject) => {

            var queryStr = `DROP TABLE IF EXISTS ${configs.pre}content_${guid}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误'
                        });
                    }

                    con.end();

                    resolve();
                });
            });

        } ))().then( () => new Promise( (resolve,reject) => {

            var queryStr = `DROP TABLE IF EXISTS ${configs.pre}ctconfig_${guid}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误'
                        });
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `delete from ${configs.pre}ctgenerator where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误'
                        });
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `show tables like "${configs.pre}collections_%"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误'
                        });
                    }

                    con.end();

                    resolve(data);
                });
            });

        } ) ).then( (tables) => new Promise( (resolve,reject) => {
            var arr = [];
            tables.forEach(function(p){
                for(var i in p){
                    arr.push(p[i]);
                }
            });

            var tasks = new asyncArr(arr);
            tasks.each( (item)=>new Promise( (rev,rej) => {

                var queryStr = `delete from ${item} where model = "${guid}"`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:'错误'
                            });
                        }

                        con.end();

                        rev();
                    });
                });

            } ) ).then( ()=>{
                resolve();
            } )

        } ) ).then( () => new Promise( (resolve,reject) => {

            req.flash('error','删除成功');
            res.json({
                results:'done.'
            });

        } ) )
    },
    modelExport:function(req, res, next){
        var guid = req.params.guid || null;

        if(!guid){
            req.flash('error','缺少必填字段');
            return res.redirect('/panel/contents/model');
        }

        var obj = {};

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}ctgenerator where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        req.flash('error','错误');
                        return res.redirect('/panel/contents/model');
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','id不正确或模型不存在#1');
                        return res.redirect('/panel/contents/model');
                    }

                    obj['name'] = data[0].name;
                    obj['guid'] = guid;

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}ctconfig_${guid}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        req.flash('error','id不正确或模型不存在#2');
                        return res.redirect('/panel/contents/model');
                    }

                    con.end();

                    obj['datas'] = data;

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            res.json(obj);

        } ) );

    },
    importModel:function(req, res, next){
        var model = req.files.model || null;

        if(!model){
            return res.json({
                msg:'错误'
            });
        }

        var json,
            guid,
            name,
            datas;

        var path = (model.path);


        ( () => new Promise( (resolve,reject) => {

            json = require(path);

            guid = json.guid;
            name = json.name;
            datas = json.datas;

            var queryStr = `select * from ${configs.pre}ctgenerator where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(data[0]){
                        return res.json({
                            msg:'该模型已存在，请重新填写guid'
                        });
                    }else{
                        resolve();
                    }
                });
            });

        } ) )().then( ()=> new Promise( (resolve,reject)=>{

            var queryStr = `insert into ${configs.pre}ctgenerator (name,guid) values("${name}","${guid}")`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( ()=>new Promise( (resolve,reject)=>{

            var queryStr = `DROP TABLE IF EXISTS ${configs.pre}ctconfig_${guid}`;
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( ()=>new Promise( (resolve,reject)=>{

            var queryStr = `create table ${configs.pre}ctconfig_${guid} (id int primary key auto_increment,name VARCHAR(32),value TEXT,type VARCHAR(32),search TINYINT(1),sort TINYINT(1),filter TINYINT(1))`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( ()=>new Promise( (resolve,reject) => {
            var tasks = new asyncArr(datas);
            var the_idx = 0;

            tasks.each( (item) => new Promise( (rev,rej) => {
                var queryStr = `insert into ${configs.pre}ctconfig_${guid} (name,value,type,search,sort,filter) values("${item.name}","${item.value}","${item.type}",${item.search},${item.sort},${item.filter})`;

                the_idx++;

                setTimeout(function(){
                    connect(function(con){
                        var queryFn = con.query(queryStr,function(err,data){
                            if(err){
                                throw err;
                            }

                            con.end();

                            var id = queryFn['_results'][0]['insertId'];

                            rev({
                                id:id,
                                type:item.type
                            });
                        });
                    });
                },(the_idx*100));

            } ) ).then( (ids) => {
                resolve(ids);
            } )
        } ) ).then( (ids) => new Promise( (resolve,reject)=>{

            var queryStr = `DROP TABLE IF EXISTS ${configs.pre}content_${guid}`;
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve(ids);
                });
            });

        } ) ).then( (ids)=> new Promise( (resolve,reject)=>{

            var chunk = '';
            ids.forEach(function(p){
                var type = (p.type == 'content') ? 'LONGTEXT' : 'TEXT';

                chunk+=('field_'+p.id+' '+type+',');
            });

            var queryStr = `
                CREATE TABLE ${configs.pre}content_${guid} (
                    id int(11) unsigned NOT NULL AUTO_INCREMENT,
                    title varchar(32) DEFAULT NULL,
                    category text,
                    postdate varchar(32) DEFAULT NULL,
                    router varchar(32) DEFAULT NULL,
                    tags text,
                    up varchar(32) DEFAULT NULL,
                    views int(12) DEFAULT NULL,
                    guid varchar(32) DEFAULT NULL,
                    author varchar(32) DEFAULT NULL,
                    ${chunk}
                    PRIMARY KEY (id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
            `;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });

        } ) ).then( ()=> new Promise( (resolve,reject) => { //delete json file

            fs.unlinkSync(path);
            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {
            req.flash('error','导入成功');
            res.json({
                result:'success'
            });
        } ) )

    },
    collectionsNew:function(req, res, next){

        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var model = req.query.model || null;

        if(!model){ //step 1

            ( () => new Promise( (resolve,reject) => {

                var queryStr = `select * from ${configs.pre}collection_config`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err;
                        }

                        con.end();

                        infomations['info'] = data[0] || [];

                        resolve();
                    });
                });

            } ) )().then( () => new Promise( (resolve,reject) => {

                var queryStr = `select * from ${configs.pre}ctgenerator`;
                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err;
                        }

                        con.end();

                        resolve(data);
                    });
                });

            } ) ).then( (datas) => new Promise( (resolve,reject) => {

                infomations['datas'] = datas || [];

                console.log(infomations); //print results

                res.render('collectionsselectmodel',{title:'new collections - select model',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

            } ) )

        }else{ //step 2

            model = strFilter(model);

            ( () => new Promise( (resolve,reject) => {

                var queryStr = `select * from ${configs.pre}ctgenerator where guid = "${model}"`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err;
                        }

                        con.end();

                        if(!data[0]){
                            req.flash('error','id不正确');
                            return res.redirect('/panel/contents/collections');
                        }

                        infomations['model'] = req.query.model;

                        resolve();
                    });
                });

            } ) )().then( () => new Promise( (resolve,reject) => {

                var path = __dirname.replace('routes',''),
                    ps = fs.readdirSync(path+'/views');

                var styles = [];

                ps.forEach(function(d){
                    if(d!='.DS_Store') styles.push(d);
                });

                infomations['styles'] = styles;

                resolve();

            } ) ).then( () => new Promise( (resolve,reject) => {

                console.log(infomations);

                res.render('newcollection',{title:'new collections',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

            } ) )
        }
    },
    collectionsNewPost:function(req, res, next){
        var model = req.body.model || null;

        if(!model){
            return res.json({
                msg:'请填写模型'
            });
        }

        var datas

        try{
            datas = JSON.parse(req.body.datas);

            for(var key in datas){
                datas[key] = strFilter(datas[key]);
            }
        }catch(e){
            console.log(e);
            return res.json({
                msg:'缺少必填参数#1'
            });
        }

        var name = datas.name || null,
            guid = datas.guid || null,
            styles = datas.styles || null;

        if(!name || !guid || !styles){
            return res.json({
                msg:'缺少必填参数#2'
            });
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}collection_config where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(data[0]){
                        return res.json({
                            msg:'guid已存在'
                        });
                    }else{
                        resolve();
                    }

                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var queryStr = `insert into ${configs.pre}collection_config (name,guid,style,defaultmodel) values("${name}","${guid}","${styles}","${model}")`;

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

            var queryStr = `
                CREATE TABLE ${configs.pre}collections_${guid} (
                    id int(11) unsigned NOT NULL AUTO_INCREMENT,
                    ctid varchar(32) DEFAULT NULL,
                    title varchar(32) DEFAULT NULL,
                    model varchar(32) DEFAULT NULL,
                    PRIMARY KEY (id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
            `;

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

            req.flash('error','添加成功');
            res.json({
                result:'success'
            });

        } ) )
    },
    editCollection:function(req, res, next){
        var guid = req.query.guid || null;

        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        if(!guid){
            req.flash('error','id不能为空');
            return res.redirect('/panel/contents/collections');
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}collection_config where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','列表集不存在');
                        return res.redirect('/panel/contents/collections');
                    }else{
                        infomations['collection'] = data[0];
                        resolve();
                    }

                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}ctgenerator`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','id不正确');
                        return res.redirect('/panel/contents/collections');
                    }

                    infomations['models'] = data;

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var path = __dirname.replace('routes',''),
                ps = fs.readdirSync(path+'/views');

            var styles = [];

            ps.forEach(function(d){
                if(d!='.DS_Store') styles.push(d);
            });

            infomations['styles'] = styles;

            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {

            console.log(infomations);

            res.render('editcollection',{title:'edit collections',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

        } ) )

    },
    editCollectionPost:function(req, res, next){
        var guid = req.body.guid || null;
        if(!guid){
            return res.json({
                msg:'请填写guid'
            });
        }

        var chunks = '',
            i = 0;
        for(var key in req.body){
            req.body[key] = strFilter(req.body[key]);
            if(key!='guid'){

                chunks += `${i==0?'':','}${key}="${req.body[key]}"`;
                i++;
            }
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}collection_config where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'guid不存在'
                        });
                    }else{
                        resolve();
                    }

                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var queryStr = `update ${configs.pre}collection_config set ${chunks} where guid = "${guid}"`;

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

            req.flash('error','修改成功');
            res.json({
                result:'success'
            });

        } ) )
    },
    removeCollection:function(req, res, next){
        var guid = req.body.guid || null;
        if(!guid){
            return res.json({
                msg:'请填写guid'
            });
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}collection_config where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'guid不存在'
                        });
                    }else{
                        resolve();
                    }

                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}collections_${guid}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve(data);
                });
            });

        } ) ).then( (datas) => new Promise( (resolve,reject) => {
            var obj = {},
                keys = [];

            datas.forEach(function(d){
                if(!obj[d.model]){
                    obj[d.model] = [];
                }
                obj[d.model].push(d);
            });

            for(var key in obj){
                keys.push(key);
            }

            var tasks1 = new asyncArr(keys);
            tasks1.each( (key) => new Promise( (rev1,rej1) => {

                var task2 = new asyncArr(obj[key]);
                task2.each( (item) => new Promise( (rev2,rej2) => {

                    var queryStr = `delete from ${configs.pre}content_${key} where id = ${item.ctid}`;

                    connect(function(con){
                        var queryFn = con.query(queryStr,function(err,data){
                            if(err){
                                throw err;
                            }

                            con.end();

                            rev2();
                        });
                    });

                } ) ).then( ()=>{
                    rev1();
                } );

            } )).then( () => {

                resolve();

            } );


        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `delete from ${configs.pre}collection_config where guid = "${guid}"`;

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

            var queryStr = `DROP TABLE IF EXISTS ${configs.pre}collections_${guid}`;

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
                result:'success'
            });

        } ) )
    },
    categories:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ( () => new Promise( (resolve,reject) => {
            var queryStr = `select * from ${configs.pre}category`;
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve(data[0].datas);
                });
            });
        } ) )().then( (datas) => new Promise( (resolve,reject) => {
            console.log(datas);//print results

            infomations['datas'] = datas || [];
            res.render('categories',{title:'model',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) )
    },
    categoriesPost:function(req, res, next){
        var datas = req.body.datas || null;

        if(!datas){
            return res.json({
                msg:'请填写数据'
            });
        }

        ( () => new Promise( (resolve,reject)=>{
            var queryStr = `update ${configs.pre}category set datas = '${datas}' where id = 1`;
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });
        } ) )().then( () => {
           res.json({
               result:'done.'
           }); 
        } )
    },
    comments:function(req, res, next){

        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var page = req.query.page || 1;
        var count = 10;

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}comments`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve(data);
                });
            });

        } ) )().then( (data) => new Promise( (resolve,reject) => {

            data.sort( (a,b)=> b.id - a.id );

            var listsData = [];

            data.forEach(function(p,i){
                if(data.length >= count ){
                    if( (i >= (page-1) * count) && i<= ((page) * count - 1) ){
                        listsData.push(p);
                    }
                }else{
                    listsData.push(p);
                }
            });

            var pageContainer = [],
                pageCount = Math.ceil(data.length / count);

            for(var i = 1;i <= (pageCount); i++){
                var active = i==page ? true : false;
                pageContainer.push({
                    val:i,
                    current:active
                });
            }

            infomations['lists'] = eval(listsData);
            infomations['pages'] = pageContainer;
            infomations['nowPage'] = page;
            infomations['query'] = req.query;

            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {
            console.log(infomations);//print results

            res.render('comments',{title:'comments',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) )
    },
    commentsDetail:function(req, res, next){
        var id = req.query.id || null;

        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var page = req.query.page || 1,
            count = req.query.count || 10;

        if(!id){
            req.flash('error','id不正确');
            return res.redirect('/panel/contents/comments');
        }

        ( () => new Promise( (resolve,reject)=>{

            var queryStr = `select * from ${configs.pre}comments where id = ${id}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','id不正确或数据为空');
                        return res.redirect('/panel/contents/comments');
                    }

                    var datas = data[0],
                        datas2 = eval(datas.datas);

                    datas2.forEach(function(d,i){
                        d.index = (i+1);
                    });

                    var pageContainer = [],
                        pageCount = Math.ceil(datas2.length / count);

                    for(var i = 1;i <= (pageCount); i++){
                        var active = i==page ? true : false;
                        pageContainer.push({
                            val:i,
                            current:active
                        });
                    }

                    var arr = [];
                    for(var i = count * (page-1); i<count*page; i++){
                        if(datas2[i]){
                            arr.push(datas2[i]);
                        }
                    }

                    datas.datas = arr;

                    infomations['datas'] = datas;
                    infomations['length'] = datas2.length;
                    infomations['pages'] = pageContainer;
                    infomations['nowPage'] = page;
                    infomations['query'] = req.query;

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            console.log(infomations);//print results

            res.render('commentsview',{title:'comments',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

        } ) )
    },
    commentsRemove:function(req, res, next){
        var id = req.query.id || null,
            cid = req.query.cid || null;

        if(!id || !cid){
            req.flash('error','id或cid不能为空');
            return res.redirect('/panel/contents/comments');
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}comments where id = ${id}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','id不正确或数据为空#1');
                        return res.redirect('/panel/contents/comments');
                    }

                    resolve(data);
                });
            });

        } ) )().then( (datas) => new Promise( (resolve,reject) => {
            var newData = datas[0];
            var data = eval(newData.datas);

            data.splice(cid,1);

            if(!data.length){

                var queryStr = `delete from ${configs.pre}comments where id = ${id}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err;
                        }

                        con.end();

                        req.flash('error','删除成功');
                        res.redirect(`/panel/contents/comments`);
                    });
                });

            }else{

                var dataStr = JSON.stringify(data);
                dataStr = strFilter(dataStr);

                var queryStr = `update ${configs.pre}comments set datas = "${dataStr}" where id = ${id}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err;
                        }

                        con.end();

                        resolve();
                    });
                });

            }

        } ) ).then( () => new Promise( (resolve,reject) => {
            req.flash('error','删除成功');
            res.redirect(`/panel/contents/comments/detail/?id=${id}`);
        } ) )

    },
    removeall:function(req, res, next){
        var id = req.body.id || null;

        if(!id){
            return res.json({
                msg:'缺少必填参数'
            });
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `delete from ${configs.pre}comments where id = ${id}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'删除失败'
                        });
                    }

                    con.end();

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            req.flash('error','删除成功');
            return res.json({
                result:'done.'
            });

        } ) )
    }
}