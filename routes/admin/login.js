var __dirname = __dirname.replace('/admin','');

var fs = require('fs');
var code = fs.readFileSync(__dirname+'/common.js','utf8');
eval(code);

module.exports = {
    login:function(req, res, next){
        if(req.session.userData){
            return res.redirect('/panel');
        }

        res.render('login',{title:'Login',err:req.flash('error')[0],assets:configs.panelStyle});
    },
    loginPost:function(req, res, next){
        var username = req.body.username || null,
            password = ( isMd5(req.body.password) ? req.body.password : md5(req.body.password) ) || null;

        if(!username || !password){
            req.flash('error','账号或密码不能为空');
            return res.redirect('/panel/login');
        }

        if(username.indexOf('"')>-1 || username.indexOf(' ')>-1){
            req.flash('error','账号非法');
            return res.redirect('/panel/login');
        }

        ;( ()=> new Promise( (resolve,reject) => {
            var queryStr = `select * from ${configs.pre}users where username = "${username}"`;

            connect(function(con){
                con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','账号不存在');
                        return res.redirect('/panel/login');
                    }

                    resolve(data[0]);
                });
            });
        } ) )().then( (data) => new Promise( (resolve,reject) => {
            if(data.password != password){//success
                req.flash('error','密码错误');
                return res.redirect('/panel/login');
            }else{
                resolve(data);
            }
        } ) ).then( (datas) => new Promise( (resolve,reject) => {

            var queryStr = `select * from ${configs.pre}groups where guid = "${datas.groups}"`;

            connect(function(con){
                con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    if(!data[0]){
                        req.flash('error','读取用户组信息出错');
                    }

                    datas['groupsName'] = data[0].name;

                    resolve(datas);
                });
            });

        } ) ).then( (datas) => new Promise( (resolve,reject) => {

            req.flash('error','登录成功');
            req.session.userData = datas;
            return res.redirect('/panel');
        } ) )
    },
    logout:function(req, res, next){
        req.flash('error','注销成功');
        req.session.userData = null;
        return res.redirect('/panel/login');
    }
}