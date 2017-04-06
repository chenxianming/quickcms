var fs = require('fs');
var code = fs.readFileSync(__dirname+'/common.js','utf8');
eval(code);

var exec = require('child_process').exec;
var proPath = __dirname.replace('/routes','');
var Mode = require('stat-mode');
var mysql = require('mysql');
var updateconfigs = require(`${__dirname.replace('routes','')}/utils/updateconfigs`);
var connect = require(`${__dirname.replace('routes','')}/utils/connect`);
var dataFile = fs.readFileSync(`${__dirname.replace('routes','')}utils/install/original.json`,'utf-8');
var updaterouter = require(`${__dirname.replace('routes','utils')}/updaterouter`);

module.exports = {
    index:function(req, res, next) {
        
        var infomations = {};
        
        global.dataLength = 0;
        
        res.render(`${__dirname.replace('routes','utils')}/install/views/index.ejs`,{title:'install',infomations:infomations,assets:'/install/'});
        
    },
    configure:function(req, res, next) {
        var type = req.body.type || null,
            value = req.body.value || null;
        
        if(!type || !value){
            return res.json({
                msg:'缺少必填字段'
            });
        }

        ( () => new Promise( (resolve,reject) => {
            if(value!='nginx'){
                var ps = proPath+value;
                if(!fs.existsSync(ps)){
                    return res.json({
                        msg:'该文件不存在'
                    })
                }
                
                var stat = fs.statSync(ps);
                var mode = new Mode(stat);
                if(!mode.owner.write){
                    return res.json({
                        msg:'请将目录设置为可写'
                    })
                }
                
                res.json({
                    result:'ok'
                });
            }else{
                try{
                    execSync('nginx -t');
                    resolve();
                }catch(e){
                    res.json({
                        msg:'该环境无nginx'
                    });
                }
            }
        } ) )().then( () => new Promise( (resolve,reject) => {
            
            exec('nginx -t',function(err,s,d){
                res.json({
                    result:'nginx配置正常,可直接绑定域名'
                });
            });
            
        } ) )
    },
    checksql:function(req, res, next) {
        
        var sqlhost = req.body.sqlhost || null,
            database = req.body.database || null,
            user = req.body.user || null,
            password = req.body.password || null,
            sqlport = req.body.sqlport || null;
        
        if(!sqlhost || !database || !user || !password || !sqlport){
            return json({
                msg:'缺少必填参数'
            });
        }
        
        ( () => new Promise( (resolve,reject) => {
            var connection = mysql.createConnection({
                host: sqlhost,
                user: user,
                password: password,
                database: database,
                port:sqlport
            });
            
            connection.connect(function(d){
                if(!d){
                    global.sql = {
                        sqlhost: sqlhost,
                        user:user,
                        password: password,
                        database: database,
                        sqlport:sqlport
                    }
                    
                    updateconfigs({
                        sqlhost: sqlhost,
                        user:user,
                        password: password,
                        database: database,
                        sqlport:sqlport
                    });
                    
                    return resolve();
                }
                
                res.json({
                    msg:d.code
                });
            });
            
        } ) )().then( () => new Promise( (resolve,reject) => {
            res.json({
                result:'ok'
            });
        } ) )
        
    },
    loginUser:function(req, res, next) {
        for(var key in req.body){
            req.body[key] = strFilter(req.body[key]);
        }
        var user = req.body.user || null,
            password = req.body.password || null;
        
        if(!user || !password){
            return res.json({
                msg:'请填写用户名和密码'
            });
        }
        
        c.post(`${configs.service}users/login`,{
            user:user,
            password:password
        },function(data){
            var a = eval(`[${data}]`);
            var data = a[0];
            
            res.json(data);
        });
    },
    newUser:function(req, res, next) {
        for(var key in req.body){
            req.body[key] = strFilter(req.body[key]);
        }

        var email = req.body.email || null,
            username = req.body.username || null,
            password = req.body.password || null,
            passwordVerify = req.body.passwordVerify || null;

        if(!email || !username || !password || !passwordVerify){
            return res.json({
                msg:'缺少必填字段'
            });
        }

        if(password != passwordVerify){
            return res.json({
                msg:'两次输入密码不一样'
            });
        }

        var parttern = /[0-9a-zA-Z\-]+$/;
        if(!parttern.test(username) || username.length<3){
            return res.json({
                msg:'用户格式不正确'
            });
        }

        if(password.length<6){
            return res.json({
                msg:'密码长度不正确'
            });
        }
        
        c.post(`${configs.service}users/new`,{
            username:username,
            email:email,
            password:password,
            passwordVerify:passwordVerify
        },function(data){
            var a = eval(`[${data}]`);
            var data = a[0];
            
            res.json(data);
        });
    },
    initConfig:function(req, res, next) {
        var datas = JSON.parse(req.body.datas);
        
        var mysql = datas.mysql || null,
            admin = datas.admin || null,
            pre = datas.pre || null,
            account = datas.account || null;
        
        if(!mysql || !admin || !pre){
            return res.json({
                msg:'缺少必填参数'
            });
        }
        
        var obj = {};
        
        try{
            obj['database'] = mysql.database;
            obj['sqlhost'] = mysql.sqlhost;
            obj['sqlport'] = mysql.sqlport;
            obj['user'] = mysql.user;
            obj['password'] = mysql.password;
            obj['pre'] = pre;

            obj['admin'] = admin.admin;
            obj['email'] = admin.email;
            obj['pass'] = admin.pass;

            if(account){
                obj['account'] = account.account;
                obj['accountpass'] = account.accountpass;
            }
            
            updateconfigs(obj);
            
            var databasePath = `${__dirname.replace('routes','')}utils/install/database.json`;
            
            ( () => new Promise( (resolve,reject) => {
                setTimeout(function(){
                    var code = fs.readFileSync(`${__dirname.replace('routes','')}configs.js`,'utf-8');
                    var a = eval(`[${code}]`);
                    var configs = a[0];

                    if(fs.existsSync(databasePath)){
                        fs.unlinkSync(databasePath);
                    }
                    resolve(configs);
                },200);
                
            } ) )().then( (configs) => new Promise( (resolve,reject) => {
                
                setTimeout(function(){
                    
                    var code = dataFile.replace(/qc_/g,configs.pre);
                    fs.writeFileSync(databasePath,code,'utf-8');
                    resolve();
                    
                },200);
                
            } ) ).then( () => new Promise( (resolve,reject) => {
                
                res.json({
                    result:'done.'
                });
                
            } ) )
            
        }catch(e){
            console.log(e);
            res.json({
                msg:'错误'
            });
        }
        
    },
    start:function(req, res, next) {
        var step = req.body.step;
        
        var datas;
        if(global.dataFile){
            datas = global.dataFile;
        }else{
            var dataFile = fs.readFileSync(`${__dirname.replace('routes','')}utils/install/database.json`,'utf-8');
            var a = eval(`[${dataFile}]`);
            datas = global.dataFile = a[0];
        }
        
        if(!datas[step]){
            return res.json({
                msg:step
            });
        }
        
        var configs;

        ( () => new Promise( (resolve,reject) => {

            fs.readFile(`${__dirname.replace('routes','')}/configs.js`,'utf-8',function(err,cfa){
                if(err){
                    return res.json({
                        msg:step
                    });
                }
                var cfb = eval(`[${cfa}]`);
                configs = cfb[0];
                resolve();
            });

        } ) )().then( () => new Promise( (resolve,reject) => {

            var tasks = new asyncArr(datas[step]);
            tasks.each( (item) => new Promise( (rev1,rej1) => {

                connect({
                    host:configs.sqlhost,
                    port:configs.sqlport,
                    user:configs.user,
                    password:configs.password,
                    database:configs.database,
                    multipleStatements:true
                },function(con){
                    var queryFn = con.query(item,function(err,data){
                        con.end();
                        if(err){
                            return res.json({
                                msg:step
                            });
                        }

                        setTimeout(rev1,2000);
                    });
                });

            } ) ).then( () => {

                global.dataLength++ ;
                if(global.dataLength < 8){
                    return res.json({
                        result:step
                    });
                }
                resolve();
                
            } );

        } ) ).then( () => new Promise( (resolve,reject) => {
            
            
            var queryStr = `insert into ${configs.pre}users (username,nickname,groups,styles,email,avatar,password,posts) values ("${configs.admin}","admin","administrator","default(zh)","${configs.email}","","${md5(configs.pass)}",0)`;
            
            connect({
                host:configs.sqlhost,
                port:configs.sqlport,
                user:configs.user,
                password:configs.password,
                database:configs.database
            },function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    con.end();
                    
                    if(err){
                        return res.json({
                            msg:step
                        });
                    }

                    resolve();
                });
            });

        } ) ).then( () => new Promise( (resolve,reject) => {

            var oldLockPath = __dirname.replace('routes','utils/install/_lock.js'),
                newLockPath = __dirname.replace('routes','utils/install/lock.js');
            //installation locked
            try{
                fs.renameSync(oldLockPath,newLockPath);
            }catch(e){
                fs.writeFileSync(newLockPath,'{}','utf-8');
            }

            //update dynamic routes
            updaterouter();
            resolve();

        } ) ).then( () => new Promise( (resolve,reject) => {
            
            c.post('http://service.quickcms.cn:3050/encode',function(data){
                global.cloudCenter = data;
                resolve();
            });
            
        } ) ).then( () => new Promise( (resolve,reject) => {
            
            res.json({
                result:step
            });
            
            setTimeout(resolve,2000);
            
        } ) ).then( () => new Promise( (resolve,reject) => {
            
            try{
                execSync(`forever restart ${__dirname.replace('routes','bin/www')}`);
            }catch(e){
                
            }
            
        } ) )
    }
}
