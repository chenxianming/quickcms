//panel auto tasks
var configs = require(`${__dirname.replace('utils','')}configs`);
var connect = require(`${__dirname}/connect`);
var c = require(`${__dirname}/request`);
var asyncArr = require('async-arr');
var md5 = require('md5');
var isMd5 = require('is-md5');
var fs = require('fs');
var fse = require('fs-extra');
var updaterouter = require(`${__dirname}/updaterouter`);

var cityjson = 'http://pv.sohu.com/cityjson?ie=utf-8';


module.exports = function(){
    var startTime = new Date().getTime();
    
    //check original account
    ( () => new Promise( (resolve,reject) => {
        
        var queryStr = `select * from ${configs.pre}users where username = "${configs.admin}"`;
        
        connect(function(con){
            var queryFn = con.query(queryStr,function(err,data){
                if(err){
                    throw err;
                }
                
                con.end();
                
                resolve(data[0] ? false : true);
            });
        });
        
    } ) )().then( (isNew)=> new Promise( (resolve,reject) => {
        var password = ( isMd5(configs.pass) ? configs.pass : md5(configs.pass) );
        
        if(isNew){
            
            var queryStr = `insert into ${configs.pre}users (username,nickname,groups,styles,email,avatar,password,posts) values("${configs.admin}","${configs.admin}","${administrator}","default(zh)","","","${password}",0)`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }

                    con.end();

                    resolve();
                });
            });
        }else{
            
            var queryStr = `update ${configs.pre}users set password = "${password}"`;
            
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
        
    } ) ).then( ()=> new Promise( (resolve,reject) => {
        
        console.log(`task "check original account" is completed ==> (${new Date().getTime() - startTime} (ms))`);
        
    } ) )
    
    //fixed user posts
    var users = [];
    
    ( () => new Promise( (resolve,reject) => {
        var queryStr = `select * from ${configs.pre}users`;
        
        connect(function(con){
            var queryFn = con.query(queryStr,function(err,data){
                if(err){
                    throw err;
                }
                
                con.end();
                
                data.forEach(function(d){
                    users.push({
                        username:d.username,
                        posts:0
                    });
                });
                
                resolve();
            });
        });
        
    } ) )().then( () => new Promise( (resolve,reject) => {
        
        var queryStr = `show tables like "${configs.pre}content_%"`;
        
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
        var contents = [];
        
        tasks.each( (item) => new Promise( (rev,rej) => {
            
            var queryStr = `select * from ${item}`;

            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        return res.json({
                            msg:'错误'
                        });
                    }

                    con.end();
                    data.forEach(function(d){
                        contents.push(d);
                    });
                    
                    rev();
                });
            });
            
        } ) ).then( () => {
            contents.forEach(function(d){
                users.forEach(function(u){
                    if(d.author==u.username){
                        u.posts++;
                    }
                });
            });
            
            resolve();
        } )
        
    } ) ).then( () => new Promise( (resolve,reject) => {
        
        var tasks = new asyncArr(users);
        tasks.each( (item) => new Promise( (rev,rej) => {
            var queryStr = `update ${configs.pre}users set posts = ${item.posts} where username = "${item.username}"`;

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
        } ) ).then(function(){
            resolve();
        });
        
    } ) ).then( () => new Promise( (resolve,reject) => {

        console.log(`task "fixed user posts" is completed ==> (${new Date().getTime() - startTime} (ms))`);
        
    } ) );
    
    //update dynamicRoutes
    ( () => new Promise( (resolve,reject) => {
        updaterouter();
        resolve();
    } ) )().then( () => new Promise( (resolve,reject) => {
        console.log(`task "update dynamic routes" is completed ==> (${new Date().getTime() - startTime} (ms))`);
    } ) );
    
    //clear comments
    var comments = [],
        commentResults = [];
    
    ( () => new Promise( (resolve,reject) => {
        var queryStr = `select * from ${configs.pre}comments`;

        connect(function(con){
            var queryFn = con.query(queryStr,function(err,data){
                if(err){
                    return res.json({
                        msg:'错误'
                    });
                }

                con.end();
                
                data.forEach(function(d){
                    comments.push({
                        model:d.model,
                        id:d.ctid
                    });
                });
                
                resolve();
            });
        });
    } ) )().then( () => new Promise( (resolve,reject) => {
        
        var task = new asyncArr(comments);
        task.each( (item) => new Promise( (rev1,rej1) => {
            
            var queryStr = `select * from ${configs.pre}content_${item.model} where id = ${item.id}`;
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        commentResults.push(item);
                        return rev1();
                    }
                    
                    con.end();
                    
                    if(!data[0]){
                        commentResults.push(item);
                    }
                    rev1();
                });
            });
            
        } ) ).then( () => {
            resolve();
        } );
        
    } ) ).then( () => new Promise( (resolve,reject) => {
        
        var task = new asyncArr(commentResults);
        task.each( (item) => new Promise( (rev1,rej1) => {
            
            var queryStr = `delete from ${configs.pre}comments where model = "${item.model}" and ctid = ${item.id}`;
            
            connect(function(con){
                var queryFn = con.query(queryStr,function(err,data){
                    if(err){
                        throw err;
                    }
                    
                    con.end();
                    
                    rev1();
                });
            });
            
        } ) ).then( () => {
            resolve();
        } );
        
    } ) ).then( () => new Promise( (resolve,reject) => {
        console.log(`task "clear comments" is completed ==> (${new Date().getTime() - startTime} (ms))`);
    } ) );
    
    //clear cache
    ( () => new Promise( (resolve,reject) => {
        var files = fs.readdirSync(__dirname.replace('utils','temp'));
        files.forEach(function(d){
            if(d.indexOf('.log')>-1){
                return ;
            }
            fse.removeSync(__dirname.replace('utils','temp/')+d);
        });
        
        resolve();
        
    } ) )().then( () => new Promise( (resolve,reject) => {
        console.log(`task "clear cache" is completed ==> (${new Date().getTime() - startTime} (ms))`);
    } ) );
    
    //get token
    ( () => new Promise( (resolve,reject) => {
        c.post('http://service.quickcms.cn:3050/encode',function(data){
            global.cloudCenter = data;
            resolve();
        });
        
    } ) )().then( () => new Promise( (resolve,reject) => {
        console.log(`task "get token" is completed ==> (${new Date().getTime() - startTime} (ms))`);
        
        if(configs.account && configs.accountpass){
            resolve();
        }
        
    } ) ).then( () => new Promise( (resolve,reject) => {
        //login to QuickCms server
        c.post(`${configs.service}users/login`,{
            user:configs.account,
            password:configs.accountpass
        },function(data){
            return console.log(data);
            resolve();
        });
    } ) ).then( () => new Promise( (resolve,reject) => {
        console.log(`task "get token" is completed ==> (${new Date().getTime() - startTime} (ms))`);
    } ) );
    
    
    //get news
    ( () => new Promise( (resolve,reject) => {
        c.post(`${configs.service}news/get`,{
            count:5
        },function(data){
            try{
                global.news = eval(data);
            }catch(e){
                global.news = [];
            }
            
            resolve();
        });
    } ) )().then( () => new Promise( (resolve,reject) => {
        console.log(`task "get news" is completed ==> (${new Date().getTime() - startTime} (ms))`);
    } ) );
    
    //get ip
    ( () => new Promise( (resolve,reject) => {
        c.get(cityjson,function(d){
            try{
                eval(d);
                global.address = returnCitySN.cip;
            }catch(e){
                global.address = '未能获取您的ip';
            }
            resolve();
        });
    } ) )().then( () => new Promise( (resolve,reject) => {
        console.log(`task "get ip address" is completed ==> (${new Date().getTime() - startTime} (ms))`);
    } ) );
    
}