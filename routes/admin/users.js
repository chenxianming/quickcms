var __dirname = __dirname.replace('/admin','');

var fs = require('fs');
var code = fs.readFileSync(__dirname+'/common.js','utf8');
eval(code);

module.exports = {
    users:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        var page = req.query.page || 1;
        var count = req.query.count || 20;

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}users`;

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
                if(p.username==configs.admin){
                    p.isOrginalAccount = true;
                }

                if(data.length >= count){
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

            infomations['users'] = listsData;
            infomations['nowPage'] = page;
            infomations['query'] = req.query;
            infomations['pages'] = pageContainer;
            resolve();
        } ) ).then( () => new Promise( (resolve,reject) => {

            console.log(infomations);//print results

            res.render('users',{title:'users',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

        } ) );
    },
    userNew:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ( () => new Promise( (resolve,reject) => {
            var queryStr = `select * from ${configs.pre}groups`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    infomations['groups'] = data;

                    resolve();
                });
            });
        } ) )().then( () => new Promise( (resolve,reject) => {
            var path = __dirname.replace('routes',''),
                ps = fs.readdirSync(path+'/admin');

            var panelStyle = [];

            ps.forEach(function(d){
                if(d!='.DS_Store') panelStyle.push(d);
            });

            infomations['panelStyle'] = panelStyle;

            resolve();
        } ) ).then( () => new Promise( (resolve,reject) => {

            console.log(infomations);//print results

            res.render('users_new',{title:'users - new',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

        } ) )
    },
    userNewPost:function(req, res, next){

        for(var key in req.body){
            req.body[key] = strFilter(req.body[key]);
        }

        var username = req.body.username || null,
            nickname = req.body.nickname || null,
            groups = req.body.groups || null,
            styles = req.body.styles || null,
            email = req.body.email || null,
            avatar = req.body.avatar || '',
            password = req.body.password || null;

        password = ( isMd5(password) ? password : md5(password) );

        if(!username || !nickname || !groups || !styles || !email || !password){
            return res.json({
                msg:'缺少必填参数'
            });
        }

        if(req.session.userData.groups!='administrator' && groups=='administrator'){
            return res.json({
                msg:'你所在的用户组无法操作管理员用户'
            });
        }

        ( () => new Promise( (resolve,reject) => { //check username

            var queryStr = `select * from ${configs.pre}users where username = "${username}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(data[0]){
                        return res.json({
                            msg:'用户名已存在'
                        });
                    }else{
                        resolve();
                    }

                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => { //insert

            var queryStr = `insert into ${configs.pre}users (username,nickname,groups,styles,email,avatar,password,posts) values("${username}","${nickname}","${groups}","${styles}","${email}","${avatar}","${password}",0)`;

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

            req.flash('error','更改用户信息成功');
            res.json({
                result:'done.'
            });


        } ) )

    },
    userEdit:function(req, res, next){
        var username = req.query.username || null;
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        if(!username){
            req.flash('error','请填写用户名');
            res.redirect(`/panel/users`);
        }

        if(username == configs.admin){
            req.flash('error','创始人用户无法进行编辑');
            res.redirect(`/panel/users`);
        }

        username = strFilter(username);

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}users where username = "${username}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','用户名不存在');
                        res.redirect(`/panel/users`);
                    }else{
                        infomations['user'] = data[0];
                        resolve();
                    }

                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}groups`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    infomations['groups'] = data;

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {
            var path = __dirname.replace('routes',''),
                ps = fs.readdirSync(path+'/admin');

            var panelStyle = [];

            ps.forEach(function(d){
                if(d!='.DS_Store') panelStyle.push(d);
            });

            infomations['panelStyle'] = panelStyle;

            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {

            console.log(infomations);//print results

            res.render('users_edit',{title:'users',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

        } ) )
    },
    person:function(req, res, next){
        res.redirect(`/panel/users/edit?username=${req.session.userData.username}`);
    },
    userRemove:function(req, res, next){
        var username = req.body.username || null;

        if(!username){
            return res.json({
                msg:'用户名称不能为空'
            });
        }

        ( () => new Promise( (resolve,reject) => { //check username

            var queryStr = `select * from ${configs.pre}users where username = "${username}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        return res.json({
                            msg:'用户名不存在'
                        });
                    }else{
                        resolve();
                    }

                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var queryStr = `delete from ${configs.pre}users where username = "${username}"`;

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
    uploadAvatar:function(req, res, next){
        var avatar = req.files.avatar || null,
            username = req.params.username || null;

        if(!avatar || !username){
            return res.json({
                msg:'错误'
            });
        }

        var str = __dirname.replace('routes','public');
        var path = avatar.path.replace(str,'');

        ( () => new Promise( (resolve,reject) => {
            if(username == '-common'){
                reject();
            }else{
                resolve();
            }
        } ) )().then( () => new Promise( (resolve,reject) => { //editor user

        } ),() => { //new user
            res.json({
                result:path
            });
        } )
    },
    updateProfile:function(req, res, next){
        var username = req.body.username || null,
            password = req.body.password || null;

        var groups = req.body.groups || null;

        if(!username){
            return res.json({
                msg:'请填写用户名称'
            });
        }

        if(password && password.length < 6){
            return res.json({
                msg:'密码长度不能小于6'
            });
        }

        if(username == configs.admin){
            return res.json({
                msg:'创始人用户无法进行编辑'
            });
        }

        if(req.session.userData.groups!='administrator' && groups=='administrator'){
            return res.json({
                msg:'你所在的用户组无法操作管理员用户'
            });
        }

        var chunks = '';

        ( () => new Promise( (resolve,reject) => { //check username

            var queryStr = `select * from ${configs.pre}users where username = "${username}"`;

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
                            msg:'用户不存在'
                        });
                    }

                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => { //chunks

            var i = 0;

            for(var key in req.body){

                if(key!='username'){
                    var value = '';

                    value = strFilter(req.body[key]);

                    if(key=='password'){
                        value = ( isMd5(value) ? value : md5(value) )
                    }

                    if(i==0){
                        chunks += `${key} = "${value}"`;
                    }else{
                        chunks += `,${key} = "${value}"`
                    }

                    i++;
                }

            }

            var queryStr = `update ${configs.pre}users set ${chunks} where username = "${username}"`;

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

            req.flash('error','更改用户信息成功');
            res.json({
                result:'done.'
            });

        } ))   
    },
    groups:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}groups`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    infomations['groups'] = data;

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            console.log(infomations);//print results

            res.render('groups',{title:'groups',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

        } ) );

    },
    groupsNew:function(req, res, next){
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ( () => new Promise( (resolve,reject) => {
            infomations['roles'] = configs.roles;
            resolve();
        } ) )().then( () => new Promise( (resolve,reject) => {

            console.log(infomations);//print results

            res.render('groups_new',{title:'groups - new',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});

        } ) )
    },
    groupsNewPost:function(req, res, next){
        var name = req.body.name || null,
            guid = req.body.guid || null,
            roles = req.body.roles || null;

        if(!name || !guid || !roles){
            return res.json({
                msg:'缺少必要参数'
            });
        }

        name = strFilter(name);

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}groups where guid = "${guid}"`;

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

        } ) )().then( () => new Promise((resolve,reject) => {

            var queryStr = `insert into ${configs.pre}groups (name,guid,roles) values("${name}","${guid}","${roles}")`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });

        }) ).then( () => new Promise((resolve,reject) => {

            req.flash('error','添加成功');
            res.json({
                result:'done.'
            });

        }) )
    },
    groupsEdit:function(req, res, next){
        var guid = req.query.guid || null;
        var infomations = {};
        infomations['username'] = req.session.userData.username;
        infomations['useravatar'] = req.session.userData.avatar;
        infomations['groupsName'] = req.session.userData.groupsName;

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}groups where guid = "${guid}"`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','id错误');
                        res.redirect(`/panel/groups`);
                    }

                    infomations['roles'] = configs.roles;
                    infomations['datas'] = data[0];

                    resolve();
                });
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            console.log(infomations);//print results

            res.render('groups_edit',{title:'groups - edit',err:req.flash('error')[0],infomations:infomations,assets:configs.panelStyle});
        } ) );

    },
    groupsEditPost:function(req, res, next){
        var name = req.body.name || null,
            guid = req.body.guid || null,
            roles = req.body.roles || null;

        if(guid=='administrator'){
            return res.json({
                msg:'不能修改管理员权限'
            });
        }

        if(!name || !guid || !roles){
            return res.json({
                msg:'缺少必要参数'
            });
        }

        name = strFilter(name);

        ;( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}groups where guid = "${guid}"`;

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

            var queryStr = `update ${configs.pre}groups set name = "${name}" , roles = "${roles}" where guid = "${guid}"`;

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
                result:'done.'
            });

        } ) );
    },
    groupsRemove:function(req, res, next){
        var guid = req.body.guid || null;

        if(guid=='administrator'){
            return res.json({
                msg:'不能修改管理员权限'
            });
        }

        ( () => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}groups where guid = "${guid}"`;

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
                            msg:'删除失败,guid不存在'
                        });
                    }
                });
            });

        } ))().then( ()=>new Promise( (resolve,reject) => {

            var queryStr = `delete from ${configs.pre}groups where guid = "${guid}"`;

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
            req.flash('error','删除成功');
            res.json({
                result:'done.'
            });
        } ) )
    }
}