
module.exports = function(router){
    var configs = require('/Users/cxm/openresource/quickcms//configs');
    var connect = require('/Users/cxm/openresource/quickcms/utils/connect');
    var asyncArr = require('async-arr');
    var articlevisit = require('/Users/cxm/openresource/quickcms/utils/articlevisit');
    var fs = require('fs');

    var encrypter = require('object-encrypter');
    var engine = encrypter('ZwLSWfCMR1229evE1omP85J6lh3L7A29dzb3',{ttl:false});
    
    var base64 = require('base64-coder-node')();

    function strFilter(str){
        var newStr = str.replace(/"/g,'\"');
        newStr = newStr.replace(/'/g,"\'");
        return newStr;
    }

    //middleWare
    router.use('*',function(req,res,next){
        if(!req.session.lastreply){
            var nowDate = new Date().getTime();
            var key = engine.encrypt({timestamp:nowDate},7*60*60*1000);   //7*60*60*1000
            req.session.lastreply = nowDate;
            req.session.lastreplyToken = key;
        }

        var nowDate = new Date().getTime();
        var key = engine.encrypt({timestamp:nowDate},7*60*60*1000);   //7*60*60*1000
        req.session.timestamp = nowDate;
        req.session.token = key;
        console.log( key );
        
        next();
    });

    //comment api

    //== getComments GET
    router.get('/jsonp/getcomments',function(req,res,next){
        var id = req.query.id || null,
            model = req.query.model || null,
            callback = req.query.callback || null,
            count = req.query.count || 20,
            page = req.query.page || 1;

        var infomations = {};

        if(!id || !model){
            return res.json({
                msg:'缺少必填参数'
            });
        }

        ( () => new Promise( (resolve,reject) => {
            var queryStr = `select * from qc1_comments where model = "${model}" and ctid = "${id}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误'
                        });
                    }

                    con.end();
                    
                    if(!data[0]){
                        infomations = {'msg':'该内容无评论'};
                        return resolve();
                    }

                    infomations['datas'] = data[0];
                    resolve();
                });
            });
        } ) )().then( () => new Promise( (resolve,reject) => { //set pages
            if(!infomations['datas']){
                return resolve();
            }
            
            var datas = eval(infomations['datas'].datas);
            datas.forEach(function(d,i){
                d.index = i+1;
            });


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
            
            infomations['datas'].datas = arr;
            infomations['pageContainer'] = pageContainer;

            resolve();
            
        } ) ).then( () => new Promise( (resolve,reject) => {
            callback ? res.send(`${callback}(${JSON.stringify(infomations)})`) : res.json(infomations);
        } ) )
    });

    //== getComments POST
    router.post('/api/getcomments',function(req,res,next){
        var id = req.body.id || null,
            model = req.body.model || null,
            count = req.body.count || 20,
            page = req.body.page || 1;

        var infomations = {};

        if(!id || !model){
            return res.json({
                msg:'缺少必填参数'
            });
        }

        ( () => new Promise( (resolve,reject) => {
            var queryStr = `select * from qc1_comments where model = "${model}" and ctid = "${id}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误'
                        });
                    }

                    con.end();
                    
                    if(!data[0]){
                        infomations = {'msg':'该内容无评论'};
                        return resolve();
                    }

                    infomations['datas'] = data[0];
                    resolve();
                });
            });
        } ) )().then( () => new Promise( (resolve,reject) => { //set pages

            if(!infomations['datas']){
                return resolve();
            }
            
            var datas = eval(infomations['datas'].datas);
            datas.forEach(function(d,i){
                d.index = i+1;
            });

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
            
            infomations['datas'].datas = arr;
            infomations['pageContainer'] = pageContainer;

            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {
            res.json(infomations);
        } ) )
    });

    //== getComments END

    //post new replay
    router.post('/api/new-reply',function(req,res,next){
        var timestamp = req.session.lastreply || req.session.timestamp || req.body.timestamp || null,
            token = req.session.lastreplyToken || req.session.token || req.body.token || null,
            id = req.body.id || null,
            model = req.body.model || null,
            title = req.body.title || null,
            author = req.body.author || null,
            email = req.body.email || null,
            tel = req.body.tel || null,
            content = req.body.content || null;

        var date = new Date().getTime();

        var infomations = {};

        if(!timestamp || !token || !model || !id || !author || !content){
            return res.json({
                msg:'缺少必填参数'
            });
        }

        if(!email && !tel){
            return res.json({
                msg:'两种联系方式必须填一'
            });
        }

        var mainTitle;
        author = strFilter(author);
        email = strFilter(email);
        tel = strFilter(tel);
        content = strFilter(content);

        ( () => new Promise( (resolve,reject) => {
            
            var queryStr = `select * from qc1_ctgenerator where guid = "${model}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误#1'
                        });
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'model错误'
                        });
                    }

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from qc1_content_${model} where id = "${id}"`;

            connect(function(con){

                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误#2'
                        });
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'id错误'
                        });
                    }
                    
                    mainTitle = data[0].title;
                    
                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from qc1_configs where id = 1`;

            connect(function(con){

                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'读取配置错误'
                        });
                    }

                    con.end();

                    if(data[0] && data[0].comment){
                        var limit = data[0].comment * 1 * 1000 * 60;
                        if(date - timestamp < limit){
                            return res.json({
                                msg:`在${data[0].comment}分钟内只能发表一次评论`
                            });
                        }
                    }
                    
                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from qc1_comments where model = "${model}" and ctid = "${id}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误#3'
                        });
                    }

                    con.end();
                    
                    resolve(data[0]);
                });
            });

        } ) ).then( (comment) => new Promise( (resolve,reject) => {
            var obj = {};
            obj['title'] = title;
            obj['date'] = date;
            obj['author'] = author;
            obj['email'] = email || '';
            obj['tel'] = tel || '';
            obj['content'] = content;

            if(comment){
                var datas = eval(comment.datas);
                datas.push(obj);
                
                var queryStr = `update qc1_comments set lastupdate = "${date}", datas = '${JSON.stringify(datas)}' where model = "${model}" and ctid = "${id}"`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:'错误#4'
                            });
                        }

                        con.end();

                        resolve();
                    });
                });
            }else{
                var arr = [];

                arr.push(obj);

                var queryStr = `insert into qc1_comments (ctid,title,model,datas,lastupdate) values("${id}","${mainTitle}","${model}",'${JSON.stringify(arr)}',"${date}")`;
                
                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:'错误#4'
                            });
                        }

                        con.end();

                        resolve();
                    });
                });
            }

        } ) ).then( () => new Promise( (resolve,reject) => {
            var nowDate = new Date().getTime();
            var key = engine.encrypt({timestamp:nowDate},7*60*60*1000);   //7*60*60*1000
            req.session.lastreply = nowDate;
            req.session.lastreplyToken = key;
            console.log( key );
            
            res.json({
                result:'done.'
            });
        } ) )
    });

    //decode token
    router.post('/api/decode',function(req,res,next){
        var token = req.body.token || null,
            timestamp = req.body.timestamp || null;

        if(!token || !timestamp){
            return res.json({
                msg:'缺少要参数'
            });
        }

        try{
            var code = engine.decrypt(token);
            var pass = (code.timestamp == timestamp);
            return res.json({
                result:'pass'
            });
        
        }catch(e){
            console.log(e);
            return res.json({
                msg:'请填写正确参数'
            });
        }
    });
    

    //get content jsonp
    router.get('/jsonp/get-content/:query',function(req,res,next){
        var query = req.params.query || null;
        var arr = query.split('-');
        var model = arr[0] || null;
        var id = arr[1] || null;
        var infomations = {};
        var callback = req.query.callback || null;
        
        infomations['categories'] = categories;
        infomations['modelconfigs'] = modelConfigs;
        infomations['contents'] = '找不到该内容';

        if(!model || !id){
            return callback ? res.send(`${callback}(${JSON.stringify(infomations)})`) : res.json(infomations);
        }

        ( () => new Promise( (resolve,reject) => {
            
            var queryStr = `select * from qc1_ctgenerator where guid = "${model}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err
                    }

                    con.end();

                    if(!data[0]){
                        return callback ? res.send(`${callback}(${JSON.stringify(infomations)})`) : res.json(infomations);
                    }

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {
            
            var queryStr = `select * from qc1_content_${model} where id = "${id}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err
                    }

                    con.end();

                    if(!data[0]){
                        return callback ? res.send(`${callback}(${JSON.stringify(infomations)})`) : res.json(infomations);
                    }
                    
                    data[0].model = model;
                    infomations['contents'] = data[0];
                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {
            articlevisit(model,id);
            callback ? res.send(`${callback}(${JSON.stringify(infomations)})`) : res.json(infomations);
        } ) )
    });

    //get content api
    router.post('/api/get-content/:query',function(req,res,next){
        var query = req.params.query || null;
        var arr = query.split('-');
        var model = arr[0] || null;
        var id = arr[1] || null;
        var infomations = {};
        
        infomations['categories'] = categories;
        infomations['modelconfigs'] = modelConfigs;
        infomations['contents'] = '找不到该内容';


        if(!model || !id){
            return res.json(infomations);
        }

        ( () => new Promise( (resolve,reject) => {
            
            var queryStr = `select * from qc1_ctgenerator where guid = "${model}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err
                    }

                    con.end();

                    if(!data[0]){
                        return res.json(infomations);
                    }

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {
            
            var queryStr = `select * from qc1_content_${model} where id = "${id}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err
                    }

                    con.end();

                    if(!data[0]){
                        return res.json(infomations);
                    }
                    
                    data[0].model = model;
                    infomations['contents'] = data[0];
                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {
            articlevisit(model,id);
            res.json(infomations);
        } ) )
    });

    //get system configs
    router.get('/jsonp/get-system',function(req,res,next){
        var systems = {};
        var callback = req.query.callback || null;
        
        ( () => new Promise( (resolve,reject) => {
            var queryStr = `select * from qc1_configs where id = 1`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err
                    }

                    con.end();

                    if(!data[0]){
                        return res.json(infomations);
                    }
                    
                    systems = data[0];
                    resolve();
                });
            });
        } ) )().then( () => new Promise( (resolve,reject) => {
            delete systems.id;
            delete systems.comment;
            callback ? res.send(`${callback}(${JSON.stringify(systems)})`) : res.json(systems);
        } ) )
    });

    router.post('/api/get-system',function(req,res,next){
        var systems = {};
        
        ( () => new Promise( (resolve,reject) => {
            var queryStr = `select * from qc1_configs where id = 1`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err
                    }

                    con.end();

                    if(!data[0]){
                        return res.json(infomations);
                    }
                    
                    systems = data[0];
                    resolve();
                });
            });
        } ) )().then( () => new Promise( (resolve,reject) => {
            delete systems.id;
            delete systems.comment;
            res.json(systems);
        } ) )
    });

    
    //extensions api
    router.post('/api/extensions',function(req,res,next){
        var guid = req.body.guid || null,
            query = req.body.query || null, //query extension field content
            input = req.body.input || null, //update extension datas
            datas = req.body.datas || null;
        
        var action = query ? 'query' : 'input';
            
        if(!guid){
            return res.json({
                msg:'请填写guid'
            });
        }

        if(!query && !input){
            return res.json({
                msg:'请填写请求或输入'
            });
        }

        if(input && !datas){
            return res.json({
                msg:'请填写输入和数据'
            });
        }

        if(query && input){
            return res.json({
                msg:'无法同时查询和输入'
            });
        }

        var extension = {};

        ( () => new Promise( (resolve,reject) => {
            var queryStr = `select * from qc1_extensions where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'该拓展不存在'
                        });
                    }
                    
                    extension = data[0];

                    resolve();
                });
            });
        } ) )().then( () => new Promise( (resolve,reject) => {
            
            if(action=='query'){
                
                if(extension.query.indexOf(query)<0){
                    return res.json({
                        msg:'无查询该字段的权限'
                    });
                }

                var obj = eval(`[${extension.datas}]`)

                res.json(obj[0]);

            }else{

                if(extension.input.indexOf(input)<0){
                    return res.json({
                        msg:'无写入该字段的权限'
                    });
                }
                
                var queryStr = `update qc1_extensions set ${input} = "${datas}" where guid = "${guid}"`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            throw err
                        }

                        con.end();

                        resolve();
                    });
                });

            }

        } ) ).then( () => {
            return res.json({
                result:'写入成功'
            });
        } )

    });
    

    //dynamic routes
    
    var categories = {"name":"分类","datas":[{"name":"作品","router":"works","datas":[]},{"name":"新闻","router":"news","datas":[]},{"name":"关于","router":"about","datas":[]}]};
    var modelConfigs = {"article":[{"id":1,"name":"缩略图","value":"null","type":"media","search":0,"sort":0,"filter":0},{"id":2,"name":"内容","value":"null","type":"content","search":0,"sort":0,"filter":0}],"works":[{"id":1,"name":"简介","value":"null","type":"form","search":0,"sort":0,"filter":0},{"id":2,"name":"预览地址","value":"null","type":"form","search":0,"sort":0,"filter":0},{"id":3,"name":"风格","value":"黑色,白色,灰色,","type":"checkbox","search":0,"sort":0,"filter":1},{"id":4,"name":"缩略图","value":"null","type":"media","search":0,"sort":0,"filter":0},{"id":5,"name":"内容图","value":"null","type":"media-l","search":0,"sort":0,"filter":0}],"news":[{"id":1,"name":"简介","value":"null","type":"form","search":0,"sort":0,"filter":0},{"id":2,"name":"缩略图","value":"null","type":"media","search":0,"sort":0,"filter":0},{"id":3,"name":"内容","value":"null","type":"content","search":0,"sort":0,"filter":0}],"shops":[{"id":1,"name":"标题","value":"null","type":"form","search":1,"sort":0,"filter":0},{"id":2,"name":"价格","value":"￥","type":"d-form","search":0,"sort":1,"filter":0},{"id":3,"name":"缩略图","value":"null","type":"media","search":0,"sort":0,"filter":0},{"id":4,"name":"内容图","value":"null","type":"media-l","search":0,"sort":0,"filter":0},{"id":5,"name":"颜色","value":"黑色,白色,灰色,","type":"checkbox","search":0,"sort":0,"filter":1},{"id":6,"name":"类型","value":"衣服,日用,食品,","type":"options","search":0,"sort":0,"filter":0},{"id":7,"name":"详细介绍","value":"null","type":"content","search":0,"sort":0,"filter":0}],"about":[{"id":1,"name":"文字","value":"null","type":"form","search":0,"sort":0,"filter":0},{"id":2,"name":"图片组","value":"null","type":"media-l","search":0,"sort":0,"filter":0}]};
        
    function jsonpRoutes(req, res, next, categoriesStra) {
        var callback = req.query.callback || null;
        var page = req.query.page || 1;
        var count = req.query.count || 20;

        var keywords = req.query.keywords || null;
        var filter = req.query.filter || null;
        var sort = req.query.sort || null;

        var categoriesStr = categoriesStra;
        var infomations = {};
        var contents = [];
        
        
        //output contents data

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `show tables like "qc1_content_%"`;

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
                for(var i in p){
                    arr.push(p[i]);
                }
            });

            var tasks = new asyncArr(arr);
            tasks.each( (item) => new Promise( (rev1,rej1) => {

                var queryStr = `select * from ${item}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:'错误'
                            });
                        }

                        con.end();

                        var model = item.replace(`qc1_content_`,'');

                        data.forEach(function(d){
                            if(d.category==categoriesStr){
                                d.model = model;
                                contents.push(d);
                            }
                        });
                        rev1();
                    });
                });

            } )).then( () => {
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject) => {  //search,filter,sort
            var results = [];

            if(keywords){
                var searchField = [];
                var searchFieldArr = [];

                for(var key in modelConfigs){
                    modelConfigs[key].forEach(function(d){
                        if(d.search){
                            searchField.push({
                                model:key,
                                id:d.id
                            });
                        }
                    });
                }

                searchField.forEach(function(d){
                    searchFieldArr.push(`( d["model"]=="${d.model}" && d["field_${d.id}"] && d["field_${d.id}"].indexOf(keywords)>-1 )`);
                });

                var str = searchFieldArr.join(' || ');

                eval(`
                    contents.forEach(function(d){
                        if(d.title.indexOf(keywords)>-1 || d.tags.indexOf(keywords)>-1 || ${str}){
                            results.push(d);
                        }
                    });
                `);

                contents = results;
                results = [];
            }

            if(filter){
                //check model
                var temp1,temp2 = true;

                for(var i = 0;i<contents.length-1;i++){
                    var d = contents[i];

                    if(i==0){
                        temp1 = d.model;
                    }else{
                        if(temp1!=d.model){
                            temp2 = false;
                            break ;
                        }
                    }
                }

                if(temp1 && temp2){
                    var filterField = [];
                    var filterFieldArr = [];

                    for(var key in modelConfigs){
                        modelConfigs[key].forEach(function(d){
                            if(d.filter && d.model==temp1){
                                filterField.push({
                                    model:key,
                                    id:d.id
                                });
                            }
                        });
                    }

                    var queryFilterArr = [];

                    if(typeof filter!='object'){
                        queryFilterArr.push(filter);
                    }else{
                        queryFilterArr = filter;
                    }

                    queryFilterArr.forEach(function(d,i){
                        var arStr = d.split('-');
                        var arId = arStr[0].replace('fd','');

                        var tar;

                        modelConfigs[temp1].forEach(function(g){
                            if(g.id==arId){
                                var temArr = [],
                                    temStr;
                                g.value.split(',').forEach(function(d,j){
                                    if(d){
                                        temArr.push((j==arStr[1]) ? 1 :0);
                                    }
                                });
                                temStr = temArr.join(',');

                                filterFieldArr.push(`( d['field_${arId}'] == '${temStr}' ) `);
                            }
                        });
                    });

                    var chunk = filterFieldArr.join(' || ')

                    contents.forEach(function(d){
                        if(eval(chunk)){
                            if(d.model!=temp1){
                                return ;
                            }
                            results.push(d);
                        }
                    });

                    contents = results;
                }
            }
            
            if( sort && (typeof sort != 'object') ){
                var sortArr = sort.split('-');
                var key = sortArr[0],
                    st = sortArr[1];

                if(key.indexOf('fd')>-1){
                    key = key.replace('fd','field_');
                }
                
                contents.forEach(function(d){
                    if(!d[key]){
                        return resolve();
                    }
                });
                
                if(key=='postdate'){
                    contents.sort( (a,b) => st ==0 ? new Date(b[key]).getTime() - new Date(a[key]).getTime() : new Date(a[key]).getTime() - new Date(b[key]).getTime() );
                }else{
                    contents.sort( (a,b) => ( st==0 ? b[key] - a[key] : a[key] - b[key] ) );
                }
            }else{
                contents.sort( (a,b) => new Date(b.postdate).getTime() - new Date(a.postdate).getTime() );
            }
            
            resolve();
        } ) ).then( () => new Promise( (resolve,reject) => { //set pages

            var pageContainer = [],
                pageCount = Math.ceil(contents.length / count);

            for(var i = 1;i <= (pageCount); i++){
                var active = i==page ? true : false;
                pageContainer.push({
                    val:i,
                    current:active
                });
            }

            var arr = [];
            for(var i = count * (page-1); i<count*page; i++){
                if(contents[i]){
                    arr.push(contents[i]);
                }
            }
            
            //== decode base64
            
            arr.forEach(function(d){
                var ctArr = [];
                modelConfigs[d.model].forEach(function(o){
                    if(o.type=='content') ctArr.push(o.id);
                });
                ctArr.forEach(function(o){
                    d['field_'+o] = base64.decode(d['field_'+o]);
                });
            });

            //== decode base64 END

            contents = arr;
            
            infomations['categories'] = categories;
            infomations['modelconfigs'] = modelConfigs;
            infomations['contents'] = contents;
            infomations['pageContainer'] = pageContainer;

            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {

            callback ? res.send(`${callback}(${JSON.stringify(infomations)})`) : res.json(infomations);

        } ) )
    }
        
    function jsonpQuery(req, res, next, categoriesStra) {
        var callback = req.query.callback || null;

        var categoriesStr = categoriesStra;
        var infomations = {};
        var contents = [];
        var lists = [];

        var query = req.params.query;

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `show tables like "qc1_content_%"`;

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
                for(var i in p){
                    arr.push(p[i]);
                }
            });

            var tasks = new asyncArr(arr);
            tasks.each( (item) => new Promise( (rev1,rej1) => {

                var queryStr = `select * from ${item}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:'错误'
                            });
                        }

                        con.end();

                        var model = item.replace(`qc1_content_`,'');

                        data.forEach(function(d){
                            if(d.category==categoriesStr){
                                d.model = model;
                                contents.push(d);
                            }
                        });
                        rev1();
                    });
                });

            } )).then( () => {
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject) => {
            infomations['categories'] = categories;
            infomations['modelconfigs'] = modelConfigs;
            contents.forEach(function(d){
                var obj = {};
                for(var key in d){
                    if( key.indexOf('field') < 0 ){
                        obj[key] = d[key];
                    }
                }

                lists.push(obj);
            });
            
            lists.sort( (a,b) => new Date(b.postdate) - new Date(a.postdate) );
            infomations['lists'] = lists;

            //router
            for(var i = 0;i<contents.length;i++){
                var d = contents[i];
                if(d.router==query){
                    //get index
                    lists.forEach(function(o,j){
                        if(o.id==d.id && o.model==d.model){
                            infomations['index'] = j;
                        }
                    });

                    infomations['contents'] = d;

                    //decode base64
                    var ctArr = [];
                    modelConfigs[d.model].forEach(function(o){
                        if(o.type=='content') ctArr.push(o.id);
                    });
                    ctArr.forEach(function(o){
                        d['field_'+o] = base64.decode(d['field_'+o]);
                    });
                    //decode base64 END
    
                    return resolve();
                }
            }

            //model id
            for(var i = 0;i<contents.length;i++){
                var d = contents[i];
                if((d.model+'-'+d.id)==query){
                    
                    //decode base64
                    var ctArr = [];
                    modelConfigs[d.model].forEach(function(o){
                        if(o.type=='content') ctArr.push(o.id);
                    });
                    ctArr.forEach(function(o){
                        d['field_'+o] = base64.decode(d['field_'+o]);
                    });
                    //decode base64 END

                    //get index
                    lists.forEach(function(o,j){
                        if(o.id==d.id && o.model==d.model){
                            infomations['index'] = j;
                        }
                    });

                    infomations['contents'] = d;
                    return resolve();
                }
            }

            infomations['contents'] = '找不到该内容';
            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {
            
            var model = infomations['contents'].model || null,
                id = infomations['contents'].id || null;
            if(model && id){
                articlevisit(model,id);
            }

            callback ? res.send(`${callback}(${JSON.stringify(infomations)})`) : res.json(infomations);

        } ) )

    }
        
    function apiRoutes(req, res, next, categoriesStra) {
        var page = req.body.page || 1;
        var count = req.body.count || 20;

        var keywords = req.body.keywords || null;
        var filter = req.body.filter || null;
        var sort = req.body.sort || null;

        var categoriesStr = categoriesStra;
        var infomations = {};
        var contents = [];

        //output contents data

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `show tables like "qc1_content_%"`;

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
                for(var i in p){
                    arr.push(p[i]);
                }
            });

            var tasks = new asyncArr(arr);
            tasks.each( (item) => new Promise( (rev1,rej1) => {

                var queryStr = `select * from ${item}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:'错误'
                            });
                        }

                        con.end();

                        var model = item.replace(`qc1_content_`,'');

                        data.forEach(function(d){
                            if(d.category==categoriesStr){
                                d.model = model;
                                contents.push(d);
                            }
                        });
                        rev1();
                    });
                });

            } )).then( () => {
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject) => {  //search,filter,sort
            var results = [];

            if(keywords){
                var searchField = [];
                var searchFieldArr = [];

                for(var key in modelConfigs){
                    modelConfigs[key].forEach(function(d){
                        if(d.search){
                            searchField.push({
                                model:key,
                                id:d.id
                            });
                        }
                    });
                }

                searchField.forEach(function(d){
                    searchFieldArr.push(`( d["model"]=="${d.model}" && d["field_${d.id}"] && d["field_${d.id}"].indexOf(keywords)>-1 )`);
                });

                var str = searchFieldArr.join(' || ');

                eval(`
                    contents.forEach(function(d){
                        if(d.title.indexOf(keywords)>-1 || d.tags.indexOf(keywords)>-1 || ${str}){
                            results.push(d);
                        }
                    });
                `);

                contents = results;
                results = [];
            }

            if(filter){
                //check model
                var temp1,temp2 = true;

                for(var i = 0;i<contents.length-1;i++){
                    var d = contents[i];

                    if(i==0){
                        temp1 = d.model;
                    }else{
                        if(temp1!=d.model){
                            temp2 = false;
                            break ;
                        }
                    }
                }

                if(temp1 && temp2){
                    var filterField = [];
                    var filterFieldArr = [];

                    for(var key in modelConfigs){
                        modelConfigs[key].forEach(function(d){
                            if(d.filter && d.model==temp1){
                                filterField.push({
                                    model:key,
                                    id:d.id
                                });
                            }
                        });
                    }

                    var queryFilterArr = [];

                    if(typeof filter!='object'){
                        queryFilterArr.push(filter);
                    }else{
                        queryFilterArr = filter;
                    }

                    queryFilterArr.forEach(function(d,i){
                        var arStr = d.split('-');
                        var arId = arStr[0].replace('fd','');

                        var tar;

                        modelConfigs[temp1].forEach(function(g){
                            if(g.id==arId){
                                var temArr = [],
                                    temStr;
                                g.value.split(',').forEach(function(d,j){
                                    if(d){
                                        temArr.push((j==arStr[1]) ? 1 :0);
                                    }
                                });
                                temStr = temArr.join(',');

                                filterFieldArr.push(`( d['field_${arId}'] == '${temStr}' ) `);
                            }
                        });
                    });

                    var chunk = filterFieldArr.join(' || ')

                    contents.forEach(function(d){
                        if(eval(chunk)){
                            if(d.model!=temp1){
                                return ;
                            }
                            results.push(d);
                        }
                    });

                    contents = results;
                }
            }
            
            if( sort && (typeof sort != 'object') ){
                var sortArr = sort.split('-');
                var key = sortArr[0],
                    st = sortArr[1];

                if(key.indexOf('fd')>-1){
                    key = key.replace('fd','field_');
                }
                
                contents.forEach(function(d){
                    if(!d[key]){
                        return resolve();
                    }
                });
                
                if(key=='postdate'){
                    contents.sort( (a,b) => st ==0 ? new Date(b[key]).getTime() - new Date(a[key]).getTime() : new Date(a[key]).getTime() - new Date(b[key]).getTime() );
                }else{
                    contents.sort( (a,b) => ( st==0 ? b[key] - a[key] : a[key] - b[key] ) );
                }
            }else{
                contents.sort( (a,b) => new Date(b.postdate).getTime() - new Date(a.postdate).getTime() );
            }
            
            resolve();
        } ) ).then( () => new Promise( (resolve,reject) => { //set pages

            var pageContainer = [],
                pageCount = Math.ceil(contents.length / count);

            for(var i = 1;i <= (pageCount); i++){
                var active = i==page ? true : false;
                pageContainer.push({
                    val:i,
                    current:active
                });
            }

            var arr = [];
            for(var i = count * (page-1); i<count*page; i++){
                if(contents[i]){
                    arr.push(contents[i]);
                }
            }
            
            
            //== decode base64
            
            arr.forEach(function(d){
                var ctArr = [];
                modelConfigs[d.model].forEach(function(o){
                    if(o.type=='content') ctArr.push(o.id);
                });
                ctArr.forEach(function(o){
                    d['field_'+o] = base64.decode(d['field_'+o]);
                });
            });

            //== decode base64 END

            contents = arr;
            
            infomations['categories'] = categories;
            infomations['modelconfigs'] = modelConfigs;
            infomations['contents'] = contents;
            infomations['pageContainer'] = pageContainer;

            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {

            res.json(infomations);

        } ) )
    }
        
    function apiQuery(req, res, next, categoriesStra) {

        var categoriesStr = categoriesStra;
        var infomations = {};
        var contents = [];
        var lists = [];
        
        var query = req.params.query;

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `show tables like "qc1_content_%"`;

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
                for(var i in p){
                    arr.push(p[i]);
                }
            });

            var tasks = new asyncArr(arr);
            tasks.each( (item) => new Promise( (rev1,rej1) => {

                var queryStr = `select * from ${item}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:'错误'
                            });
                        }

                        con.end();

                        var model = item.replace(`qc1_content_`,'');

                        data.forEach(function(d){
                            if(d.category==categoriesStr){
                                d.model = model;
                                contents.push(d);
                            }
                        });
                        rev1();
                    });
                });

            } )).then( () => {
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject) => {
            infomations['categories'] = categories;
            infomations['modelconfigs'] = modelConfigs;

            contents.forEach(function(d){
                var obj = {};
                for(var key in d){
                    if( key.indexOf('field') < 0 ){
                        obj[key] = d[key];
                    }
                }

                lists.push(obj);
            });
            
            lists.sort( (a,b) => new Date(b.postdate) - new Date(a.postdate) );
            infomations['lists'] = lists;

            //router
            for(var i = 0;i<contents.length;i++){
                var d = contents[i];
                if(d.router==query){
                    //get index
                    lists.forEach(function(o,j){
                        if(o.id==d.id && o.model==d.model){
                            infomations['index'] = j;
                        }
                    });

                    infomations['contents'] = d;

                    //decode base64
                    var ctArr = [];
                    modelConfigs[d.model].forEach(function(o){
                        if(o.type=='content') ctArr.push(o.id);
                    });
                    ctArr.forEach(function(o){
                        d['field_'+o] = base64.decode(d['field_'+o]);
                    });
                    //decode base64 END

                    return resolve();
                }   
            }

            //model id
            for(var i = 0;i<contents.length;i++){
                var d = contents[i];
                if((d.model+'-'+d.id)==query){
                    //get index
                    lists.forEach(function(o,j){
                        if(o.id==d.id && o.model==d.model){
                            infomations['index'] = j;
                        }
                    });
                    infomations['contents'] = d;

                    //decode base64
                    var ctArr = [];
                    modelConfigs[d.model].forEach(function(o){
                        if(o.type=='content') ctArr.push(o.id);
                    });
                    ctArr.forEach(function(o){
                        d['field_'+o] = base64.decode(d['field_'+o]);
                    });
                    //decode base64 END

                    return resolve();
                }   
            }

            infomations['contents'] = '找不到该内容';
            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {
            
            var model = infomations['contents'].model || null,
                id = infomations['contents'].id || null;
            if(model && id){
                articlevisit(model,id);
            }
            
            res.json(infomations);

        } ) )
    }
        
    function viewsRoutes(req, res, next, categoriesStra) {
        var page = req.query.page || 1;
        var count = req.query.count || 20;

        var keywords = req.query.keywords || null;
        var filter = req.query.filter || null;
        var sort = req.query.sort || null;

        var categoriesStr = categoriesStra;
        var infomations = {};
        var contents = [];

        var system;
        
        //output contents data

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `show tables like "qc1_content_%"`;

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
                for(var i in p){
                    arr.push(p[i]);
                }
            });

            var tasks = new asyncArr(arr);
            tasks.each( (item) => new Promise( (rev1,rej1) => {

                var queryStr = `select * from ${item}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:'错误'
                            });
                        }

                        con.end();

                        var model = item.replace(`qc1_content_`,'');

                        data.forEach(function(d){
                            if(d.category==categoriesStr){
                                d.model = model;
                                contents.push(d);
                            }
                        });
                        rev1();
                    });
                });

            } )).then( () => {
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject) => {  //search,filter,sort
            var results = [];

            if(keywords){
                var searchField = [];
                var searchFieldArr = [];

                for(var key in modelConfigs){
                    modelConfigs[key].forEach(function(d){
                        if(d.search){
                            searchField.push({
                                model:key,
                                id:d.id
                            });
                        }
                    });
                }

                searchField.forEach(function(d){
                    searchFieldArr.push(`( d["model"]=="${d.model}" && d["field_${d.id}"] && d["field_${d.id}"].indexOf(keywords)>-1 )`);
                });

                var str = searchFieldArr.join(' || ');

                eval(`
                    contents.forEach(function(d){
                        if(d.title.indexOf(keywords)>-1 || d.tags.indexOf(keywords)>-1 || ${str}){
                            results.push(d);
                        }
                    });
                `);

                contents = results;
                results = [];
            }

            if(filter){
                //check model
                var temp1,temp2 = true;

                for(var i = 0;i<contents.length-1;i++){
                    var d = contents[i];

                    if(i==0){
                        temp1 = d.model;
                    }else{
                        if(temp1!=d.model){
                            temp2 = false;
                            break ;
                        }
                    }
                }

                if(temp1 && temp2){
                    var filterField = [];
                    var filterFieldArr = [];

                    for(var key in modelConfigs){
                        modelConfigs[key].forEach(function(d){
                            if(d.filter && d.model==temp1){
                                filterField.push({
                                    model:key,
                                    id:d.id
                                });
                            }
                        });
                    }

                    var queryFilterArr = [];

                    if(typeof filter!='object'){
                        queryFilterArr.push(filter);
                    }else{
                        queryFilterArr = filter;
                    }

                    queryFilterArr.forEach(function(d,i){
                        var arStr = d.split('-');
                        var arId = arStr[0].replace('fd','');

                        var tar;

                        modelConfigs[temp1].forEach(function(g){
                            if(g.id==arId){
                                var temArr = [],
                                    temStr;
                                g.value.split(',').forEach(function(d,j){
                                    if(d){
                                        temArr.push((j==arStr[1]) ? 1 :0);
                                    }
                                });
                                temStr = temArr.join(',');

                                filterFieldArr.push(`( d['field_${arId}'] == '${temStr}' ) `);
                            }
                        });
                    });

                    var chunk = filterFieldArr.join(' || ')

                    contents.forEach(function(d){
                        if(eval(chunk)){
                            if(d.model!=temp1){
                                return ;
                            }
                            results.push(d);
                        }
                    });

                    contents = results;
                }
            }
            
            if( sort && (typeof sort != 'object') ){
                var sortArr = sort.split('-');
                var key = sortArr[0],
                    st = sortArr[1];

                if(key.indexOf('fd')>-1){
                    key = key.replace('fd','field_');
                }
                
                contents.forEach(function(d){
                    if(!d[key]){
                        return resolve();
                    }
                });
                
                if(key=='postdate'){
                    contents.sort( (a,b) => st ==0 ? new Date(b[key]).getTime() - new Date(a[key]).getTime() : new Date(a[key]).getTime() - new Date(b[key]).getTime() );
                }else{
                    contents.sort( (a,b) => ( st==0 ? b[key] - a[key] : a[key] - b[key] ) );
                }
            }else{
                contents.sort( (a,b) => new Date(b.postdate).getTime() - new Date(a.postdate).getTime() );
            }
            
            resolve();
        } ) ).then( () => new Promise( (resolve,reject) => { //set pages

            var pageContainer = [],
                pageCount = Math.ceil(contents.length / count);

            for(var i = 1;i <= (pageCount); i++){
                var active = i==page ? true : false;
                pageContainer.push({
                    val:i,
                    current:active
                });
            }

            var arr = [];
            for(var i = count * (page-1); i<count*page; i++){
                if(contents[i]){
                    arr.push(contents[i]);
                }
            }
            
            //== decode base64
            
            arr.forEach(function(d){
                var ctArr = [];
                modelConfigs[d.model].forEach(function(o){
                    if(o.type=='content') ctArr.push(o.id);
                });
                ctArr.forEach(function(o){
                    d['field_'+o] = base64.decode(d['field_'+o]);
                });
            });

            //== decode base64 END

            contents = arr;
            
            infomations['categories'] = categories;
            infomations['modelconfigs'] = modelConfigs;
            infomations['contents'] = contents;
            infomations['pageContainer'] = pageContainer;

            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {
            
            var queryStr = `select * from qc1_configs where id = 1`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误'
                        });
                    }

                    con.end();
                    
                    infomations['style'] = data[0].style

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            try{
                var path = __dirname.replace('utils','views');

                var a = fs.readFileSync(path+'/'+infomations['style']+'/configs.json','utf-8'),
                    styleConfig = eval(`[${a}]`);

                infomations['style'] = styleConfig[0];
            }catch(e){

            }
            
            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from qc1_configs where id = 1`;
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err
                    }

                    con.end();

                    if(!data[0]){
                        return res.json(infomations);
                    }
                    
                    system = data[0];
                    delete system['comment'];
                    delete system['id'];
                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {
            
            var a = (typeof infomations['style'] == 'object') ? infomations['style'].guid : infomations['style'],
                assets = '/views/'+a+'/';
            var path = __dirname.replace('utils','') + 'views/'+a+'/';

            if(!categoriesStra){
                return res.render(path+infomations['style'].entry, {title:'/',system:system,infomations:infomations,position:[],path:assets});
            }

            var arr = [],
                arr2 = categoriesStra.split(','),
                chunk = '',
                titleChunk = '';

            var templateStr = '';

            arr2.forEach(function(d,i){
                chunk+='.datas['+d+']';
                var temp = eval('categories'+chunk);
                arr.push({name:temp.name,router:temp.router});
                titleChunk += i==0 ? temp.name : (' - '+temp.name);
            });

            templateStr += arr[arr.length-1].router+'_'+(arr.length-1);
            var templateFile = '',
                templateArr = [(path+templateStr+'.ejs'),(path+'lists_'+(arr.length-1)+'.ejs'),(path+'lists'+'.ejs'),(path+infomations['style'].entry)];

            if(req.useragent.isDesktop==false){
                var arrTemp = [];
                templateArr.forEach(function(d){
                    arrTemp.push(d.replace(a,'mobile/'+a));
                });
                
                for(var i = arrTemp.length-1;i>=0;i--){
                    templateArr.unshift(arrTemp[i]);
                }
            }
            
            for(var i = 0;i<templateArr.length;i++){
                if(fs.existsSync(templateArr[i])){
                    templateFile = templateArr[i];
                    break ;
                }
            }
            
            /*
                templatefile rule (lists)
                Example:
                
                /works
                'works_0.ejs' > 'lists_0.ejs' > 'lists.ejs' > styleEntryFile

                /works/works-1
                'works-1_1.ejs' > 'lists_1.ejs' > 'lists.ejs' > styleEntryFile
                
                /works/works-1/works-1-1
                'works-1-1_1.ejs' > 'lists_2.ejs' > 'lists.ejs' > styleEntryFile
            */

            res.render(templateFile,{title:titleChunk,system:system,infomations:infomations,position:arr,path:assets});

        } ) )
    }
        
    function viewsQuery(req, res, next, categoriesStra) {
        var categoriesStr = categoriesStra;
        var infomations = {};
        var contents = [];
        
        var lists = [];

        var system;

        var query = req.params.query;

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `show tables like "qc1_content_%"`;

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
                for(var i in p){
                    arr.push(p[i]);
                }
            });

            var tasks = new asyncArr(arr);
            tasks.each( (item) => new Promise( (rev1,rej1) => {

                var queryStr = `select * from ${item}`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:'错误'
                            });
                        }

                        con.end();

                        var model = item.replace(`qc1_content_`,'');

                        data.forEach(function(d){
                            if(d.category==categoriesStr){
                                d.model = model;
                                contents.push(d);
                            }
                        });
                        rev1();
                    });
                });

            } )).then( () => {
                resolve();
            });

        } ) ).then( () => new Promise( (resolve,reject) => {
            infomations['categories'] = categories;
            infomations['modelconfigs'] = modelConfigs;

            contents.forEach(function(d){
                var obj = {};
                for(var key in d){
                    if( key.indexOf('field') < 0 ){
                        obj[key] = d[key];
                    }
                }

                lists.push(obj);
            });
            
            lists.sort( (a,b) => new Date(b.postdate) - new Date(a.postdate) );
            infomations['lists'] = lists;

            //router
            for(var i = 0;i<contents.length;i++){
                var d = contents[i];
                if(d.router==query){
                    //get index
                    lists.forEach(function(o,j){
                        if(o.id==d.id && o.model==d.model){
                            infomations['index'] = j;
                        }
                    });

                    infomations['contents'] = d;

                    //decode base64
                    var ctArr = [];
                    modelConfigs[d.model].forEach(function(o){
                        if(o.type=='content') ctArr.push(o.id);
                    });
                    ctArr.forEach(function(o){
                        d['field_'+o] = base64.decode(d['field_'+o]);
                    });
                    //decode base64 END

                    return resolve();
                }   
            }

            //model id
            for(var i = 0;i<contents.length;i++){
                var d = contents[i];
                if((d.model+'-'+d.id)==query){
                    
                    //decode base64
                    var ctArr = [];
                    modelConfigs[d.model].forEach(function(o){
                        if(o.type=='content') ctArr.push(o.id);
                    });
                    ctArr.forEach(function(o){
                        d['field_'+o] = base64.decode(d['field_'+o]);
                    });
                    //decode base64 END

                    //get index
                    lists.forEach(function(o,j){
                        if(o.id==d.id && o.model==d.model){
                            infomations['index'] = j;
                        }
                    });

                    infomations['contents'] = d;
                    return resolve();
                }   
            }

            infomations['contents'] = '找不到该内容';
            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {

            if(typeof infomations['contents'] == 'object'){
                var guid = infomations['contents'].guid;
                
                var queryStr = `select * from qc1_collection_config where guid = "${guid}"`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:err
                            });
                        }

                        con.end();

                        infomations['style'] = data[0].style

                        resolve();
                    });
                });
            }else{
                var queryStr = `select * from qc1_configs where id = 1`;

                connect(function(con){
                    var queryFn = con.query(queryStr,function(err,data){
                        if(err){
                            return res.json({
                                msg:err
                            });
                        }

                        con.end();

                        infomations['style'] = data[0].style

                        resolve();
                    });
                });
            }

        } ) ).then( () => new Promise( (resolve,reject) => {

            try{
                var path = __dirname.replace('utils','views');

                var a = fs.readFileSync(path+'/'+infomations['style']+'/configs.json','utf-8'),
                    styleConfig = eval(`[${a}]`);

                infomations['style'] = styleConfig[0];
            }catch(e){

            }
            
            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from qc1_configs where id = 1`;
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err
                    }

                    con.end();

                    if(!data[0]){
                        return res.json(infomations);
                    }
                    
                    system = data[0];
                    delete system['comment'];
                    delete system['id'];
                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var model = infomations['contents'].model || null,
                id = infomations['contents'].id || null;
            if(model && id){
                articlevisit(model,id);
            }
            
            var a = (typeof infomations['style'] == 'object') ? infomations['style'].guid : infomations['style'],
                assets = '/views/'+a+'/';
            var path = __dirname.replace('utils','') + 'views/'+a+'/';
            
            if(req.useragent.isDesktop==false){
                var arrTemp = [];
                templateArr.forEach(function(d){
                    arrTemp.push(d.replace(a,'mobile/'+a));
                });
                
                for(var i = arrTemp.length-1;i>=0;i--){
                    templateArr.unshift(arrTemp[i]);
                }
            }

            if(!categoriesStra){
                return res.render(path+infomations['style'].entry, {title:'/',system,infomations:infomations,position:[],path:assets});
            }

            var templateStr = '';

            var arr = [],
                arr2 = categoriesStra.split(','),
                chunk = '',
                titleChunk = '';

            arr2.forEach(function(d,i){
                chunk+='.datas['+d+']';
                var temp = eval('categories'+chunk);
                arr.push({name:temp.name,router:temp.router});
                titleChunk += i==0 ? temp.name : (' - '+temp.name);
            });
            
            if(typeof infomations['contents'] == 'object'){
                arr.push({
                    name:infomations['contents'].title,
                    router:infomations['contents'].router ? infomations['contents'].router : model+'-'+id
                });
                
                titleChunk += ' - ' + infomations['contents'].title;
            }else{
                arr.push({'name':'找不到该内容',router:query});
                titleChunk += ' - 找不到该内容';
            }

            console.log(arr);
            templateStr += arr[arr.length-1].router+'_'+(arr.length-1);
            
            var lastCate = '';
            if(arr[arr.length-2]){
                lastCate = arr[arr.length-2].router;
            }

            var templateFile = '',
                templateArr = [(path+templateStr+'.ejs'),(path+(lastCate)+'_content'+'.ejs'),(path+'content_'+(arr.length-1)+'.ejs'),(path+'content'+'.ejs'),(path+infomations['style'].entry)];
            
            for(var i = 0;i<templateArr.length;i++){
                if(fs.existsSync(templateArr[i])){
                    templateFile = templateArr[i];
                    break ;
                }
            }


            /*
                templatefile rule (contents)
                Example:
                
                /works
                'works_0.ejs' > 'content_0.ejs' > 'content.ejs' > styleEntryFile

                /works/works-1
                'works-1_1.ejs' > 'content_1.ejs' > 'content.ejs' > styleEntryFile
                
                /works/works-1/article-router
                'article-router_2.ejs' > 'works-1_content.ejs' > 'works-1_content.ejs' > 'content_2.ejs' > 'content.ejs' > styleEntryFile

                
                /works/works-1( the same name between category and article)
                lists-data(works-1) > content-data(works-1)

                the same rule on mobile but must in "mobile" folder
            */

            //check useragent
            
            console.log(infomations);

            res.render(templateFile,{title:titleChunk,system:system,infomations:infomations,position:arr,path:assets});

        } ) )

    }
        
    router.get('/jsonp/works/',function(req, res, next){
        jsonpRoutes(req, res, next, '0');
    });

    router.get('/jsonp/works/:query',function(req, res, next){
        jsonpQuery(req, res, next, '0');
    });

    router.post('/api/works/',function(req, res, next){
        apiRoutes(req, res, next, '0');
    });

    router.post('/api/works/:query',function(req, res, next){
        apiQuery(req, res, next, '0');
    });
            
    router.get('/works/',function(req, res, next){
        viewsRoutes(req, res, next, '0');
    });

    router.get('/works/:query',function(req, res, next){
        viewsQuery(req, res, next, '0');
    });
            
    router.get('/jsonp/news/',function(req, res, next){
        jsonpRoutes(req, res, next, '1');
    });

    router.get('/jsonp/news/:query',function(req, res, next){
        jsonpQuery(req, res, next, '1');
    });

    router.post('/api/news/',function(req, res, next){
        apiRoutes(req, res, next, '1');
    });

    router.post('/api/news/:query',function(req, res, next){
        apiQuery(req, res, next, '1');
    });
            
    router.get('/news/',function(req, res, next){
        viewsRoutes(req, res, next, '1');
    });

    router.get('/news/:query',function(req, res, next){
        viewsQuery(req, res, next, '1');
    });
            
    router.get('/jsonp/about/',function(req, res, next){
        jsonpRoutes(req, res, next, '2');
    });

    router.get('/jsonp/about/:query',function(req, res, next){
        jsonpQuery(req, res, next, '2');
    });

    router.post('/api/about/',function(req, res, next){
        apiRoutes(req, res, next, '2');
    });

    router.post('/api/about/:query',function(req, res, next){
        apiQuery(req, res, next, '2');
    });
            
    router.get('/about/',function(req, res, next){
        viewsRoutes(req, res, next, '2');
    });

    router.get('/about/:query',function(req, res, next){
        viewsQuery(req, res, next, '2');
    });
            
    router.get('/jsonp/',function(req, res, next){
        jsonpRoutes(req, res, next, '');
    });

    router.get('/jsonp/:query',function(req, res, next){
        jsonpQuery(req, res, next, '');
    });

    router.post('/api/',function(req, res, next){
        apiRoutes(req, res, next, '');
    });

    router.post('/api/:query',function(req, res, next){
        apiQuery(req, res, next, '');
    });
            
    router.get('/',function(req, res, next){
        viewsRoutes(req, res, next, '');
    });

    router.get('/:query',function(req, res, next){
        viewsQuery(req, res, next, '');
    });
            

}
        