var asyncArr = function(arr){
    this.tasks = [];
    this.arr = arr;
}

asyncArr.prototype = {
    each:function(fn){
        var self = this;
        self.arr.forEach(function(item,index){
            self.tasks[index] = fn(item,index);
        });
        return Promise.all(self.tasks);
    }
}

;(function(c){
    c(function(){
        var width = c(window).width(),
            height = c(window).height();
        
        var preObj = {};

        var preloadStr = `
            <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve"><path fill="#7e7e7e" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z" transform="rotate(184.966 25 25)"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"></animateTransform></path></svg>
        `;
        
        function resize(){
            width = c(window).width(),
            height = c(window).height();
            c('.scene').css({
                width:width,
                height:height
            });
            c('#scene').css({
                width:width*4
            });
        }
        
        var configure = [
            {
                type:'detect',
                value:'/configs.js'
            },
            {
                type:'detect',
                value:'/temp'
            },
            {
                type:'detect',
                value:'/views'
            },
            {
                type:'detect',
                value:'/extensions'
            },
            {
                type:'detect',
                value:'/public'
            },
            {
                type:'detect',
                value:'/public/upload'
            },
            {
                type:'detect',
                value:'/public/upload/avatar'
            },
            {
                type:'detect',
                value:'/public/views'
            },
            {
                type:'detect',
                value:'/utils/dynamicRoutes.js'
            },
            {
                type:'detect',
                value:'/utils/cookies.json'
            },
            {
                type:'detect',
                value:'nginx'
            }
        ];
        
        var start = ['configs','extensions','contents','media','category','comments','users','groups'];
        
        function detect(arr,fn){
            var task1 = new asyncArr(configure);
            
            /*
            task1.each( (item) => new Promise( (rev1,rej1) => {
                c.post('/install/configure',item,function(data){
                    if(item.value!='nginx'){
                        c('.scene:eq(0)').find('.output .pd20').append(`
                            <p>检查目录权限 <span> ===> </span> ${item.value}  ${data.msg ? `<span class="red">${data.msg}</span>` : `<span class="green">${data.result}</span>` }</p>
                        `);
                        
                        (!data.msg) && arr.push(true);
                    }else{
                        c('.scene:eq(0)').find('.output .pd20').append(`
                            <p>检查nginx <span> ===> </span> ${ data.msg ? '' : data.result }  ${data.msg ? `<span class="red">${data.msg}</span>` : `<span class="green">nginx配置正常，可直接绑定域名</span>` }</p>
                        `);
                    }
                    
                    c('.scene:eq(0)').find('.output')[0].scrollTop = c('.scene:eq(0)').find('.output')[0].scrollHeight;
                    rev1();
                })
            } ) ).then(function(){
                fn && fn(arr);
            });
            */
            
            task1.each(function(item){
                return new Promise(function(rev1,rej1){
                    c.post('/install/configure',item,function(data){
                        if(item.value!='nginx'){
                            c('.scene:eq(0)').find('.output .pd20').append(`
                                <p>检查目录权限 <span> ===> </span> ${item.value}  ${data.msg ? `<span class="red">${data.msg}</span>` : `<span class="green">${data.result}</span>` }</p>
                            `);

                            (!data.msg) && arr.push(true);
                        }else{
                            c('.scene:eq(0)').find('.output .pd20').append(`
                                <p>检查nginx <span> ===> </span> ${data.msg ? `<span class="red">${data.msg}</span>` : `<span class="green">${data.result}</span>` }</p>
                            `);
                        }

                        c('.scene:eq(0)').find('.output')[0].scrollTop = c('.scene:eq(0)').find('.output')[0].scrollHeight;
                        rev1();
                    });
                })
            }).then(function(){
                fn && fn(arr);
            });
        }
        
        function install(arr,fn){
            var task1 = new asyncArr(start);
            
            /*
            task1.each( (item,index) => new Promise( (rev1,rej1) => {
                setTimeout(function(){
                    c.post('/install/start',{
                        step:item
                    },function(data){
                        c('.scene:eq(3)').find('.output .pd20').append(`
                            <p>创建数据 <span> ===> </span> ${item}  ${data.msg ? `<span class="red">失败</span>` : `<span class="green">ok</span>` }</p>
                        `);

                        (!data.msg) && arr.push(true);
                        c('.scene:eq(3)').find('.output')[0].scrollTop = c('.scene:eq(3)').find('.output')[0].scrollHeight;
                        rev1();
                    });
                },index*100);
            } ) ).then(function(){
                fn && fn(arr);
            });
            */
            
            task1.each(function(item,index){
                return new Promise(function(rev1,rej1){
                    setTimeout(function(){
                        c.post('/install/start',{
                            step:item
                        },function(data){
                            c('.scene:eq(3)').find('.output .pd20').append(`
                                <p>创建数据 <span> ===> </span> ${item}  ${data.msg ? `<span class="red">失败</span>` : `<span class="green">ok</span>` }</p>
                            `);

                            (!data.msg) && arr.push(true);
                            c('.scene:eq(3)').find('.output')[0].scrollTop = c('.scene:eq(3)').find('.output')[0].scrollHeight+10;
                            rev1();
                        });
                    },index*100);
                });
            }).then(function(){
                fn && fn(arr);
            });
        }
        
        function init(){
            c('html').removeClass('loading');
            
            var detectResult = detect([],function(arr){
                if(configure.length-1 == arr.length){
                    c('.scene:eq(0) .gray_btn').addClass('blue_btn').addClass('next');
                }
            });
            
            c(document).on('keydown','input',function(e){
                if(e.keyCode==9){
                    e.preventDefault();
                    return ;
                }
            });
            
            c(document).on('click','#check_sql',function(){
                var obj = {};
                var len = 0;
                
                c('.configs_check:eq(0) .warning').remove();
                
                c('.configs input').each(function(){
                    var key = c(this).attr('name'),
                        value = c(this).val();
                    
                    if(!value){
                        return ;
                    }
                    
                    obj[key] = value;
                    len++;
                });
                
                if(len!=5){
                    return c('.configs_check:eq(0)').append(`<span class="warning red">数据库访问失败,请检查配置</span>`);
                }
                
                c('.configs_check:eq(0) .warning').remove();
                c('.configs_check:eq(0)').append(`<span class="warning red">${preloadStr}</span>`);
                
                c.post('/install/checksql',obj,function(data){
                    if(data.msg){
                        var errCode = '';
                        
                        switch(data.msg){
                            case 'ETIMEDOUT' :
                                {
                                    errCode = '连接超时,请检查地址是否正确';
                                }
                                break;
                                
                            case 'ENOENT':
                                {
                                    errCode = '配置错误';
                                }
                                break;
                                
                            case 'ER_BAD_DB_ERROR' :
                                {
                                    errCode = '数据库不存在';
                                }
                                break;
                                
                            case 'ER_ACCESS_DENIED_ERROR' :
                                {
                                    errCode = '用户名或密码错误';
                                }
                                break;
                                
                            case 'ECONNREFUSED' :
                                {
                                    errCode = '端口错误';
                                }
                                break;
                            
                        }
                        
                        c('.configs_check:eq(0) .warning').remove();
                        return c('.configs_check:eq(0)').append(`<span class="warning red">${errCode}</span>`);
                    }
                    
                    c('.configs_check:eq(0) .warning').remove();
                    c('.configs_check:eq(0)').append(`<span class="warning green">连接成功</span>`);
                    
                    c('.scene:eq(1) .gray_btn:eq(1)').addClass('blue_btn').addClass('next');
                    
                    preObj['mysql'] = obj;
                });
            });
            
            c(document).on('blur','.scene:eq(2) .big_input input',function(){
                c('.configs_check:eq(1) .warning').remove();
                var obj = {};
                var len = 0;
                
                c('.scene:eq(2) .big_input input').each(function(i){
                    var key = c(this).attr('name'),
                        value = c(this).val();
                    
                    if(value){
                        obj[key] = value;
                        len++;
                    }
                });
                
                if(len!=5){
                    c('.configs_check:eq(1) .warning').remove();
                    return c('.configs_check:eq(1)').append(`<span class="warning red">请填写配置</span>`);
                }

                
                var parttern = /[0-9a-z]+$/;
                if(!parttern.test(obj['acount'])){
                    c('.scene:eq(2) .gray_btn:eq(1)').removeClass('blue_btn').removeClass('start');
                    c('.configs_check:eq(1) .warning').remove();
                    return c('.configs_check:eq(1)').append(`<span class="warning red">用户名只能由英文字母以及数字组成</span>`);
                }
                
                if(obj['acount'].length<5 || obj['acount'].length>19){
                    c('.scene:eq(2) .gray_btn:eq(1)').removeClass('blue_btn').removeClass('start');
                    c('.configs_check:eq(1) .warning').remove();
                    return c('.configs_check:eq(1)').append(`<span class="warning red">用户名长度不能小于6且大于20</span>`);
                }
                
                if(obj['pass'].length<5 || obj['pass'].length>19){
                    c('.scene:eq(2) .gray_btn:eq(1)').removeClass('blue_btn').removeClass('start');
                    c('.configs_check:eq(1) .warning').remove();
                    return c('.configs_check:eq(1)').append(`<span class="warning red">密码长度不能小于6且大于20</span>`);
                }
                
                if(obj['pass'] != obj['passver']){
                    c('.scene:eq(2) .gray_btn:eq(1)').removeClass('blue_btn').removeClass('start');
                    c('.configs_check:eq(1) .warning').remove();
                    return c('.configs_check:eq(1)').append(`<span class="warning red">两次密码不一样</span>`);
                }
                
                if(obj['pre'][obj['pre'].length-1] != '_'){
                    c('.scene:eq(2) .gray_btn:eq(1)').removeClass('blue_btn').removeClass('start');
                    c('.configs_check:eq(1) .warning').remove();
                    return c('.configs_check:eq(1)').append(`<span class="warning red">数据库前缀末尾需为"_"</span>`);
                }
                
                if(obj['pre'].length<3){
                    c('.scene:eq(2) .gray_btn:eq(1)').removeClass('blue_btn').removeClass('start');
                    c('.configs_check:eq(1) .warning').remove();
                    return c('.configs_check:eq(1)').append(`<span class="warning red">数据库前缀长度不能小于3</span>`);
                }
                
                
                preObj['admin'] = {
                    email:obj.email,
                    admin:obj.acount,
                    pass:obj.pass
                };
                
                preObj.pre = obj.pre;
                
                if(!preObj['mysql']){
                    c('.scene:eq(2) .gray_btn:eq(1)').removeClass('blue_btn').removeClass('start');
                    c('.configs_check:eq(1) .warning').remove();
                    return c('.configs_check:eq(1)').append(`<span class="warning red">请返回上一步检查数据库配置</span>`);
                }
                
                c('.configs_check:eq(1) .warning').remove();
                c('.configs_check:eq(1)').append(`<span class="warning green">准备就绪开始安装</span>`);
                c('.scene:eq(2) .gray_btn:eq(1)').addClass('blue_btn').addClass('start');
            });
            
            c(document).on('click','.start',function(){
                c.post('/install/initconfig',{
                    datas:JSON.stringify(preObj)
                },function(data){
                    if(data.msg){
                        c('.scene:eq(2) .gray_btn:eq(1)').removeClass('blue_btn').removeClass('start');
                        c('.configs_check:eq(1) .warning').remove();
                        return c('.configs_check:eq(1)').append(`<span class="warning red">${data.msg}</span>`);
                    }
                    
                    //begin
                    
                    c('#scene').attr('data-step',3);
                    
                    install([],function(arr){
                        if(start.length == arr.length){
                            c('.scene:eq(3) .gray_btn').addClass('blue_btn').addClass('complete');
                            c('.scene:eq(3)').find('.output .pd20').append(`
                                <p class=blue>安装完成</p>
                                <p>您的网站访问地址是</p>
                                <p><a class="green" target="_blank" href="${location.origin}/">${location.origin}/</a></p>
                                <p>后台地址是</p>
                                <p><a class="green" target="_blank" href="${location.origin}/panel">${location.origin}/panel</a></p>
                                <p><span>账号 ===> <span class="green">${preObj['admin'].admin}</span></span>  <span>密码 ===> <span class="green">${preObj['admin'].pass}</span></span></p>
                                <p><span class="red">如果您正在终端运行QuickCms,请重启!</span></p>
                            `);
                            
                        }
                    });
                    
                });
            });
            
            c(document).on('click','.register_login .small_btn',function(){
                var loginUser = c('.register_login [name="user"]').val(),
                    loginPass = c('.register_login [name="password"]').val();
                
                c('.register_infomation').html('');
                
                c.post('/install/user/login',{
                    user:loginUser,
                    password:loginPass
                },function(data){
                    if(data.msg){
                        return c('.register_infomation').html(data.msg);
                    }
                    
                    preObj['account'] = {
                        account:loginUser,
                        accountpass:loginPass
                    }
                    
                    c('.register_close').trigger('click');
                    c('.configs_check:eq(1) .warning').remove();
                    c('.configs_check:eq(1)').append(`<span class="warning green">绑定成功(可以分享样式及后续拓展)</span>`);
                })
            });
            
            c(document).on('click','.register_register .small_btn',function(){
                var username = c('.register_register [name="username"]').val(),
                    password = c('.register_register [name="password"]').val(),
                    email = c('.register_register [name="email"]').val(),
                    passwordVerify = c('.register_register [name="passwordVerify"]').val();
                
                if(!email || !username || !password || !passwordVerify){
                    return res.json({
                        msg:'缺少必填字段'
                    });
                }

                if(password != passwordVerify){
                    return c('.register_infomation').html('两次输入密码不一样');
                }

                var parttern = /[0-9a-zA-Z\-]+$/;
                if(!parttern.test(username) || username.length<3){
                    return c('.register_infomation').html('用户格式不正确');
                }

                if(password.length<6){
                    return c('.register_infomation').html('密码长度不正确');
                }
                
                c('.register_infomation').html('');
                
                c.post('/install/user/register',{
                    username:username,
                    password:password,
                    email:email,
                    passwordVerify:passwordVerify,
                },function(data){
                    if(data.msg){
                        return c('.register_infomation').html(data.msg);
                    }
                    
                    preObj['account'] = {
                        account:username,
                        accountpass:password
                    }
                    
                    c('.register_close').trigger('click');
                    c('.configs_check:eq(1) .warning').remove();
                    c('.configs_check:eq(1)').append(`<span class="warning green">绑定成功(可以分享样式及后续拓展)</span>`);
                })
                
            });
            
            c(document).on('click','.prev',function(){
                var idx = c('#scene').attr('data-step') * 1;
                if(idx<1){
                    return ;
                }
                c('#scene').attr('data-step',idx-1);
            });
            
            c(document).on('click','.next',function(){
                var idx = c('#scene').attr('data-step') * 1;
                if(idx>=2){
                    return ;
                }
                c('#scene').attr('data-step',idx+1);
            });
            
            c(document).on('click','.login_account',function(){
                c('.register').addClass('open');
            });
            
            c(document).on('click','.register_close',function(){
                c('.register').removeClass('open');
            });
            
            c(document).on('click','.complete',function(){
                location.href = `/panel`;
            });
            
        }
        
        resize();
        c(window).on('resize',resize).on('load',init);
    });
})($);