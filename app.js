var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var flash = require('connect-flash');

var configs = require('./configs');

var front = require('./routes/front');
var panel = require('./routes/panel');

var app = express();

var fs = require('fs'),
    installLock = `${__dirname}/utils/install/lock.js`,
    installExist = fs.existsSync(installLock);

if(installExist){
    var session = require('express-session');
    var mysqlStore = require('express-mysql-session')(session);
}

//set limiter
var RateLimit = require('express-rate-limit');
var limiter = new RateLimit({
    windowMs:1000,
    max:100,
    delayMs:0,
    message:'request limit'
});
app.use(limiter);

var useragent = require('express-useragent');
app.use(useragent.express());

if(installExist){
    app.use(flash());
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if(installExist){
    //set sessions
    var sessionStore = new mysqlStore({
        host:configs.sqlhost,
        port:configs.sqlport,
        user:configs.user,
        password:configs.password,
        database:configs.database,
        schema: {
            tableName:`${configs.pre}sessions`,
            columnNames: {
                session_id:'session_id',
                expires:'expires',
                data:'data'
            }
        }
    });

    var sessions = session({
        key:'loginData',
        secret:configs.sessionKey,
        store:sessionStore,
        cookie:{maxAge: 30*24*60*60*1000}, 
        resave:true,
        saveUninitialized:true
    });
    app.use(sessions);
}

// view engine setup
app.set('views',`${__dirname}/admin/${configs.panelStyle}/`);
app.set('view engine','ejs');

if(installExist){
    //panel
    app.use('/panel',panel);
}

//front
app.use('/', front);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
