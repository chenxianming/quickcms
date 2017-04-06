var exec = require('child_process').exec;

modules.export = (callback) => ( () => new Promise( (resolve,reject) => {
    try{
        exec('nginx -t',(error, st, dt) => {
            if(error){
                return callback({
                    msg:'err'
                });
            }

            var str = dt.toString();

            var arr = str.match(/file .*\.conf/g),
                path = arr[0].replace(/file /g,''),
                path = path.replace(/nginx\.conf/g,'');

            resolve(path);
        });
    }catch(e){
        return callback({
            msg:'err'
        });
    }
} ) )().then( (path) => new Promise( (resolve,reject) => {
    callback && callback({
        path:path
    });
} ) );