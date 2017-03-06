var routerArr = function(){
    this.routes = [];
    this.arr = [];
}

routerArr.prototype = {
    getRouter:function(chunk,data,str,idx){
        var self = this;
        
        if(data.router){
            chunk += data.router + '/';
            str += idx+',';
        }
        
        data.datas.forEach(function(d,i){
            self.getRouter(chunk,d,str,i);
        });
        
        self.routes.push(chunk);
        str = str.substring(0,str.length-1);
        self.arr.push(str);
    }
}

module.exports = routerArr;