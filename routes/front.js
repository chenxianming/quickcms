var express = require('express');
var router = express.Router();

var fs = require('fs');

//install
var installLock = `${__dirname.replace('routes','utils/install/lock.js')}`;
if(!fs.existsSync(installLock)){
    router.use(function(req,res,next){
        var urls = req.originalUrl.split('/');
        if(urls.indexOf('install')<0) return res.redirect('/install');
        
        next();
    });
    
    router.get('/install',require(`${__dirname}/install`).index);
    router.post('/install/configure',require(`${__dirname}/install`).configure);
    router.post('/install/checksql',require(`${__dirname}/install`).checksql);
    router.post('/install/user/login',require(`${__dirname}/install`).loginUser);
    router.post('/install/user/register',require(`${__dirname}/install`).newUser);
    router.post('/install/initconfig',require(`${__dirname}/install`).initConfig);
    router.post('/install/start',require(`${__dirname}/install`).start);
}

require(`${__dirname.replace('routes','')}/utils/dynamicRoutes`)(router);

module.exports = router;
