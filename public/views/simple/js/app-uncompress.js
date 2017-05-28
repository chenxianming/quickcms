;(function(c,global){
    c(function(){
        var width = c(window).width(),
            height = c(window).height();
        
        var scrollLock = true;

        var preloadStr = `
            <div class="preload">
                <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve"><path fill="#7e7e7e" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z" transform="rotate(184.966 25 25)"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"></animateTransform></path></svg>
            </div>
                        `;
        
        //init list
        resize();
        
        function resize(){
            width = c(window).width();
            height = c(window).height();
            c('.item_infomation_img').height(c('.item_infomation_img').width());
        }
        
        function init(){
            var scroller = new Scroller(c('#container'));
            scroller.init();
            c('.ele-parallax').each(function(){
                c(this).parallax();
            });
            
            scroller.onRender = function(){
                
                var st = _this.el.position().top;
                
                if(st <= -(c('#header').height())){
                    TweenLite.set(c('.works_infomation_wrap'),{
                        y:-st-(c('#header').height()+5),
                        force3D:true
                    });
                }else{
                    TweenLite.to(c('.works_infomation_wrap'),{
                        y:-st,
                        force3D:true
                    });
                }
                
                //scroll infinity load
                if(c('#lists')[0]){
                    var innerHeight = c('#layerfill').height();
                    
                    if( st < (innerHeight*-1 + height + height * .7) && scrollLock ){
                        nowPage+=1;
                        scrollLock = false;
                        
                        c('#lists').after(preloadStr);
                        
                        var obj = getQuery();
                        obj['page'] = nowPage;
                        
                        var pn = location.pathname[location.pathname.length-1] !='/' ? location.pathname+'/' : location.pathname;
                        
                        c.get('/jsonp'+pn,obj,function(data){
                            if(data.contents.length){
                                scrollLock = true;
                                data.contents.forEach(function(d){
                                    c('#lists ul').append(
                                        `<li class="item float" data-fric="${Math.random()}">
                                            <a href="${pn}${d.router ? d.router : d.model+'-'+d.id}">
                                                <div class="item_infomation_img" style="height: ${c('.item_infomation_img').width()};">
                                                    <img src="${ d['field_4'] }" alt="${d['field_1']}">
                                                </div>
                                                <div class="item_infomation">
                                                    <div class="table">
                                                        <div class="cell">
                                                            <h2>${d.title}</h2>
                                                            <h3>${d['field_1'] || ''}</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>
                                        </li>`
                                    );
                                });
                                
                                setTimeout(function(){
                                    scroller.onResize();
                                },200);
                                
                            }else{
                                scrollLock = false;
                            }
                            
                            c('.preload').remove();
                        })
                    }
                }
                
                if(c('#news')[0]){
                    var innerHeight = c('#layerfill').height();
                    
                    if(st <  (innerHeight*-1 + height + height * .7) && scrollLock ){
                        nowPage+=1;
                        scrollLock = false;
                        
                        c('#news').after(preloadStr);
                        
                        var obj = getQuery();
                        obj['page'] = nowPage;
                        
                        var pn = location.pathname[location.pathname.length-1] !='/' ? location.pathname+'/' : location.pathname;
                        
                        c.get('/jsonp'+pn,obj,function(data){
                            if(data.contents.length){
                                scrollLock = true;
                                
                                data.contents.forEach(function(d){
                                    c('#news ul').append(
                                        `<li class="item float" data-fric="${Math.random()}">
                                            <a href="${pn}${d.router ? d.router : d.model+'-'+d.id}"><img src="${d['field_2'] || ''}"></a>
                                            <div class="pd20">
                                                <h3>${d.title}</h3>
                                                <h4><i class="material-icons">access_time</i><span>${d.postdate}</span></h4>
                                                <p></p>
                                            </div>
                                        </li>`
                                    );
                                });
                                
                                setTimeout(function(){
                                    scroller.onResize();
                                },200);
                            }else{
                                scrollLock = false;
                                
                            }
                            c('.preload').remove();
                        });
                    }
                }
            }

            if(c('#index')[0]){
                //transition
                
                c(document).on('click','a',function(e){
                    if(c(this).attr('href')=='/' || c(this).attr('target')=='_blank'){
                        return ;
                    }
                    e.preventDefault();
                    
                    var url = c(this).attr('href');
                    
                    c('#header').removeClass('open');
                    c('.menu i').html('menu');
                    c('#main').addClass('open');
                    
                    c('#header').after(preloadStr);
                    c('.preload').css({
                        position:'absolute',
                        left:'50%',
                        marginLeft:-60,
                        top:200,
                        zIndex:101
                    });
                    
                    history.pushState({},'',url);
                    
                    setTimeout(function(){
                        TweenLite.set(scroller.el,{y:0,force3D:true});
                        c('body,html').stop().animate({scrollTop:0},0);
                        
                        c.get(url,function(data){
                            c('#main').html(c(data).find('#main').html());
                            //about
                            var aboutArr = [];
                            c('#about .float').each(function(){
                                aboutArr.push(c(this).position().top);
                            });
                            var maxHeight = Math.max.apply(this,aboutArr);
                            c('#about').height(maxHeight+600);

                            setTimeout(function(){
                                c('#header_menu').html(c(data).find('#header_menu').html());
                                scroller.onResize();
                            },400);

                            setTimeout(function(){
                                c('#main').removeClass('open');
                                c('.preload').remove();
                            },500);
                        });
                        
                    },100);
                });
                
                c(document).on('click','.filter dd i,.sort_li,.navigator li a',function(){
                    setTimeout(function(){
                        scrollLock = true;
                        nowPage = 1;
                    },500);
                });
                
                c(document).on('click','.navigator li a',function(){
                    c(this).parents('li').addClass('current').siblings().removeClass('current');
                });
                
                c(document).on('click','.sort_li',function(){
                    setTimeout(function(){
                        scrollLock = true;
                        nowPage = 1;
                    },500);
                });
                
                window.nowPage = 1;
                c('#main').html(preloadStr);
                
                c.get('/works',function(data){
                    c('#header_menu').html(c(data).find('#header_menu').html());
                });
                
                c.get('/jsonp/works',function(data){
                    c('#main').html(`
                        <div id="lists">
                            <div class="wrap">
                                <ul class="ele-parallax" data-fric="${Math.random()}"></ul>
                            </div>
                        </div>
                    `);
                    
                    var obj = getQuery();
                    obj['page'] = nowPage;
                    history.pushState({},'','/works'+queryStringify(obj));
                    
                    if(!window.scrollLock){
                        window.scrollLock = true;
                    }
                    
                    var pn = location.pathname[location.pathname.length-1] !='/' ? location.pathname+'/' : location.pathname;
                    
                    data.contents.forEach(function(d){
                        c('#lists ul').append(
                            `<li class="item float" data-fric="${Math.random()}">
                                <a href="${pn}${d.router ? d.router : d.model+'-'+d.id}">
                                    <div class="item_infomation_img" style="height: ${c('.item_infomation_img').width()};">
                                        <img src="${ d['field_4'] }" alt="${d['field_1']}">
                                    </div>
                                    <div class="item_infomation">
                                        <div class="table">
                                            <div class="cell">
                                                <h2>${d.title}</h2>
                                                <h3>${d['field_1'] || ''}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </li>`
                        );
                    });
                    
                    setTimeout(function(){
                        scroller.onResize();
                        c('#main').removeClass('open');
                    },200);
                    
                });
            }
            
            if(c('.filter')[0]){
                if(!c('.filter dl').length){
                    c('.filter').remove();
                }
                
                var queryObj = getQuery();
                if(queryObj['filter'] && queryObj['filter'].indexOf('-')<-1){
                    return ;
                }
                
                c('.filter dl').each(function(){
                    try{
                        var id = c(this).attr('data-id'),
                            fd = queryObj['filter'],
                            arr = fd.split('-');

                        if(id==arr[0].replace('fd','')){
                            c(this).find('dd').each(function(i){
                                if(i==arr[1]){
                                    c(this).find('i').addClass('sl');
                                }
                            });
                        }
                    }catch(e){
                        console.log(e);
                    }
                });
            }
            
            if(queryObj['sort']){
                var queryObj = getQuery();
                if(queryObj['sort'].indexOf('-')<-1){
                    return ;
                }
                
                var sortArr = queryObj['sort'].split('-');
                
                c('.sort_li').each(function(){
                    var sort = c(this).attr('data-sort');
                    if(sort==sortArr[0]){
                        c(this).attr('data-val',sortArr[1]);
                        var str = sortArr[1] == 0 ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
                        c(this).find('em i').html(str);
                    }
                });
            }
            
            if('1'){
                var contentId = c('.view_comment').attr('data-id'),
                    contentModel = c('.view_comment').attr('data-model');
                
                c.get('/jsonp/getcomments',{
                    id:contentId,
                    model:contentModel
                },function(data){
                    if(data.msg){
                        return ;
                    }
                    c('.view_comment span').html(`评论(${data.datas.datas.length})`);
                });
                
                c(document).on('click','.view_comment',function(){
                    var id = c(this).attr('data-id'),
                        model = c(this).attr('data-model');
                    
                    c.get('/jsonp/getcomments',{
                        id:contentId,
                        model:contentModel,
                        count:5
                    },function(data){
                        var chunk = '该内容暂无评论';
                        if(!data.msg){
                            chunk = '';
                            data.datas.datas.forEach(function(d){
                                chunk+=`
                                <div class="onecomment">
                                    <h2>#${d.index} ${d.title} (${parseDate(new Date(d.date))})</h2>
                                    <h3>
                                        <span><i class="material-icons">person</i>Author:${d.author}</span>
                                        <span><i class="material-icons">email</i>Email:${d.email}</span>
                                        <span><i class="material-icons">phone_android</i>Tel:${d.tel}</span>
                                    </h3>
                                    <p>${d.content}</p>
                                </div>
                                `;
                            });
                            chunk+=`
                                <div class="oncommentpage">
                                    <span class="na oncommentpage_prev">上页</span><span class="oncommentpage_next">下页</span>
                                </div>
                            `;
                        }
                        
                        if(!window.scrollLock){
                            window.scrollLock = true;
                        }
                        
                        c('body').addClass('lock').append(`
                            <div id="commentpage" data-id="${id}" data-model="${model}" data-page="1">
                                <div class="commentpage_close_w">
                                    <div class="commentpage_close"><i class="material-icons">close</i></div>
                                </div>
                                <div class="commentpage">
                                    <div class="pd20">
                                        ${chunk}
                                    </div>
                                    <div class="commentreply">
                                        <div class="pd20">
                                            <input type="text" placeholder="标题" name="title" />
                                            <input type="text" placeholder="作者" name="author" />
                                            <input type="text" placeholder="邮箱" name="email" />
                                            <input type="text" placeholder="电话" name="tel" />
                                            <textarea placeholder="内容" name="content"></textarea>
                                            <div class="commentreply_respone"></div>
                                        </div>
                                    </div>
                                    <div class="replybtn">
                                        <span>评论</span>
                                    </div>
                                </div>
                            </div>
                        `);
                    });
                });
                
                c(document).on('click','.oncommentpage_prev',function(){
                    if(c(this).hasClass('na')){
                        return ;
                    }
                    
                    var self = c(this);
                    
                    var id = c(this).parents('#commentpage').attr('data-id'),
                        model = c(this).parents('#commentpage').attr('data-model'),
                        page = c(this).parents('#commentpage').attr('data-page') * 1;
                    
                    page-=1;
                    c('.oncommentpage_next').removeClass('na');
                    
                    c.get('/jsonp/getcomments',{
                        id:contentId,
                        model:contentModel,
                        count:5,
                        page:page
                    },function(data){
                        if(data.msg || !data.datas.datas.length){
                            return self.addClass('na');
                        }
                        
                        if(page==1){
                            self.addClass('na');
                        }
                        
                        var chunk = '';
                        self.parents('#commentpage').attr('data-page',page);
                        c('.onecomment').remove();
                        data.datas.datas.forEach(function(d){
                            c('.oncommentpage').before(`
                                <div class="onecomment">
                                    <h2>#${d.index} ${d.title} (${parseDate(new Date(d.date))})</h2>
                                    <h3>
                                        <span><i class="material-icons">person</i>Author:${d.author}</span>
                                        <span><i class="material-icons">email</i>Email:${d.email}</span>
                                        <span><i class="material-icons">phone_android</i>Tel:${d.tel}</span>
                                    </h3>
                                    <p>${d.content}</p>
                                </div>
                            `);
                        });
                    });
                });
                
                c(document).on('click','.replybtn',function(){
                    var id = c(this).parents('#commentpage').attr('data-id'),
                        model = c(this).parents('#commentpage').attr('data-model');
                    
                    var title = c('.commentreply input[name="title"]').val() || null,
                        author = c('.commentreply input[name="author"]').val() || null,
                        email = c('.commentreply input[name="email"]').val() || null,
                        tel = c('.commentreply input[name="tel"]').val() || null,
                        content = c('.commentreply textarea[name="content"]').val() || null;
                        
                    if(!title || !author || !content){
                        return c('.commentreply_respone').html('请填写标题,作者,内容');
                    }
                    
                    if(!email && !tel){
                        return c('.commentreply_respone').html('两种联系方式必填一');
                    }
                    
                    var self = c(this);
                    
                    /*
                    ( () => new Promise( (resolve,reject) => {
                        c.post('/api/new-reply',{
                            id:id,
                            model:model,
                            title:title,
                            author:author,
                            email:email,
                            tel:tel,
                            content:content
                        },function(data){
                            if(data.msg){
                                return c('.commentreply_respone').html(data.msg);
                            }
                            resolve();
                        });
                    } ) )().then( () => new Promise( (resolve,reject) => {
                        c('.commentreply_respone').html('评论成功');
                        c('.onecomment').remove();
                        
                            c.get('/jsonp/getcomments',{
                                id:id,
                                model:model,
                                count:5,
                                page:1
                            },function(data){
                                var chunk = '';
                                self.parents('#commentpage').attr('data-page','1');
                                c('.commentpage .pd20').eq(0).html(`<div class="oncommentpage">
                                <span class="na oncommentpage_prev">上页</span><span class="oncommentpage_next">下页</span>
                            </div>`);
                                data.datas.datas.forEach(function(d){
                                    c('.oncommentpage').before(`
                                        <div class="onecomment">
                                            <h2>#${d.index} ${d.title} (${parseDate(new Date(d.date))})</h2>
                                            <h3>
                                                <span><i class="material-icons">person</i>Author:${d.author}</span>
                                                <span><i class="material-icons">email</i>Email:${d.email}</span>
                                                <span><i class="material-icons">phone_android</i>Tel:${d.tel}</span>
                                            </h3>
                                            <p>${d.content}</p>
                                        </div>
                                    `);
                                });

                            });
                        
                    } ) )
                    */
                    
                    (function(){
                        return new Promise(function(resolve,reject){
                            c.post('/api/new-reply',{
                                id:id,
                                model:model,
                                title:title,
                                author:author,
                                email:email,
                                tel:tel,
                                content:content
                            },function(data){
                                if(data.msg){
                                    return c('.commentreply_respone').html(data.msg);
                                }
                                resolve();
                            });
                        })
                    })().then(function(){
                        return new Promise(function(resolve,reject){
                            c('.commentreply_respone').html('评论成功');
                            c('.onecomment').remove();

                            c.get('/jsonp/getcomments',{
                                id:id,
                                model:model,
                                count:5,
                                page:1
                            },function(data){
                                var chunk = '';
                                self.parents('#commentpage').attr('data-page','1');
                                c('.commentpage .pd20').eq(0).html(`<div class="oncommentpage">
                                <span class="na oncommentpage_prev">上页</span><span class="oncommentpage_next">下页</span>
                            </div>`);
                                data.datas.datas.forEach(function(d){
                                    c('.oncommentpage').before(`
                                        <div class="onecomment">
                                            <h2>#${d.index} ${d.title} (${parseDate(new Date(d.date))})</h2>
                                            <h3>
                                                <span><i class="material-icons">person</i>Author:${d.author}</span>
                                                <span><i class="material-icons">email</i>Email:${d.email}</span>
                                                <span><i class="material-icons">phone_android</i>Tel:${d.tel}</span>
                                            </h3>
                                            <p>${d.content}</p>
                                        </div>
                                    `);
                                });

                            });
                        })
                    });
                    
                });
                
                c(document).on('click','.oncommentpage_next',function(){
                    if(c(this).hasClass('na')){
                        return ;
                    }
                    
                    var self = c(this);
                    
                    var id = c(this).parents('#commentpage').attr('data-id'),
                        model = c(this).parents('#commentpage').attr('data-model'),
                        page = c(this).parents('#commentpage').attr('data-page') * 1;
                    
                    page+=1;
                    c('.oncommentpage_prev').removeClass('na');
                    
                    c.get('/jsonp/getcomments',{
                        id:contentId,
                        model:contentModel,
                        count:5,
                        page:page
                    },function(data){
                        if(data.msg || !data.datas.datas.length){
                            return self.addClass('na');
                        }
                        
                        if(page==data.pageContainer.length){
                            self.addClass('na');
                        }
                        
                        var chunk = '';
                        self.parents('#commentpage').attr('data-page',page);
                        c('.onecomment').remove();
                        data.datas.datas.forEach(function(d){
                            c('.oncommentpage').before(`
                            <div class="onecomment">
                                <h2>#${d.index} ${d.title} (${parseDate(new Date(d.date))})</h2>
                                <h3>
                                    <span><i class="material-icons">person</i>Author:${d.author}</span>
                                    <span><i class="material-icons">email</i>Email:${d.email}</span>
                                    <span><i class="material-icons">phone_android</i>Tel:${d.tel}</span>
                                </h3>
                                <p>${d.content}</p>
                            </div>
                            `);
                        });
                        
                    });
                });
                
                c(document).on('click','.commentpage_close',function(){
                    c('#commentpage').remove();
                    c('body').removeClass('lock');
                });
                
            }
            
            //menu
            c(document).on('click','.navigator li.menu i',function(){
                if(c('#header').hasClass('open')){
                    c('.navigator li.menu i').html('menu');
                    c('#header').removeClass('open')
                }else{
                    c('.navigator li.menu i').html('close');
                    c('#header').addClass('open')
                }
            });
            
            //search
            c(document).on('click','.search span',function(){
                var val = c(this).parents('.search').find('input').val(),
                    type = c('#lists').length ? 'lists' : 'news';
                
                if(type=='lists'){
                    c('#lists ul').empty();
                    c('#lists').after(preloadStr);
                    
                    var obj = getQuery();
                    obj['keywords'] = val;
                    history.pushState({},'',queryStringify(obj));
                
                    var pn = location.pathname[location.pathname.length-1] !='/' ? location.pathname+'/' : location.pathname;
                    
                    c.get('/jsonp'+pn,obj,function(data){
                        if(data.contents.length){
                            if(!window.scrollLock){
                                window.scrollLock = true;
                            }
                            data.contents.forEach(function(d){
                                c('#lists ul').append(
                                    `<li class="item float" data-fric="${Math.random()}">
                                        <a href="${pn}${d.router ? d.router : d.model+'-'+d.id}">
                                            <div class="item_infomation_img" style="height: ${c('.item_infomation_img').width()};">
                                                <img src="${ d['field_4'] }" alt="${d['field_1']}">
                                            </div>
                                            <div class="item_infomation">
                                                <div class="table">
                                                    <div class="cell">
                                                        <h2>${d.title}</h2>
                                                        <h3>${d['field_1'] || ''}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </li>`
                                );
                            });   
                        }
                        c('.preload').remove();
                        
                        setTimeout(function(){
                            scroller.onResize();
                        },200);
                    });
                    
                }
                
                if(type=='news'){
                    c('#news ul').empty();
                    c('#news').after(preloadStr);
                    
                    var obj = getQuery();
                    obj['keywords'] = val;
                    history.pushState({},'',queryStringify(obj));
                
                    var pn = location.pathname[location.pathname.length-1] !='/' ? location.pathname+'/' : location.pathname;
                    
                    c.get('/jsonp'+pn,obj,function(data){
                        if(!window.scrollLock){
                            window.scrollLock = true;
                        }

                        if(data.contents.length){
                            data.contents.forEach(function(d){
                                c('#news ul').append(
                                    `<li class="item float" data-fric="${Math.random()}">
                                        <a href="${pn}${d.router ? d.router : d.model+'-'+d.id}"><img src="${d['field_2']}"></a>
                                        <div class="pd20">
                                            <h3>${d.title}</h3>
                                            <h4><i class="material-icons">access_time</i><span>${d.postdate}</span></h4>
                                            <p></p>
                                        </div>
                                    </li>`
                                );
                            });
                        }
                        c('.preload').remove();

                        setTimeout(function(){
                            scroller.onResize();
                        },200);
                    });
                    
                }
                
                setTimeout(function(){
                    scrollLock = true;
                    nowPage = 1;
                },500);
            });
            
            c(document).on('keyup','.search input',function(e){
                if(e.keyCode==13){
                    c('.search span').trigger('click');
                    setTimeout(function(){
                        scrollLock = true;
                        nowPage = 1;
                    },500);
                }
            });
            
            c(document).on('click','.filter dl i',function(){
                var id = c(this).parents('dl').attr('data-id');
                var idx = c(this).attr('data-idx')*1;
                
                var type = c('#lists').length ? 'lists' : 'news';
                
                c(this).parents('dl').each(function(){
                    c(this).find('i').removeClass('sl');
                });
                c(this).addClass('sl');
                
                if(type=='lists'){
                    c('#lists ul').empty();
                    c('#lists').after(preloadStr);
                    
                    var obj = getQuery();
                    
                    idx==0 ? obj['filter'] = '' : obj['filter'] = 'fd'+id+'-'+idx;
                    history.pushState({},'',queryStringify(obj));

                    if(!window.scrollLock){
                        window.scrollLock = true;
                    }
                    
                    var pn = location.pathname[location.pathname.length-1] !='/' ? location.pathname+'/' : location.pathname;
                    c.get('/jsonp'+pn,obj,function(data){
                        
                        if(data.contents.length){
                            data.contents.forEach(function(d){
                                c('#lists ul').append(
                                    `<li class="item float" data-fric="${Math.random()}">
                                        <a href="${pn}${d.router ? d.router : d.model+'-'+d.id}">
                                            <div class="item_infomation_img" style="height: ${c('.item_infomation_img').width()};">
                                                <img src="${ d['field_4'] }" alt="${d['field_1']}">
                                            </div>
                                            <div class="item_infomation">
                                                <div class="table">
                                                    <div class="cell">
                                                        <h2>${d.title}</h2>
                                                        <h3>${d['field_1'] || ''}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </li>`
                                ); 
                            });
                        }

                        c('.preload').remove();
                        
                        setTimeout(function(){
                            scroller.onResize();
                        },200);
                        
                    });
                }
                
            });
            
            c(document).on('click','.sort_li',function(){
                var sort = c(this).attr('data-sort');
                var obj = getQuery();
                
                var type = c('#lists').length ? 'lists' : 'news';
                
                if(type=='lists'){
                    if(c(this).attr('data-val')==0){
                        c(this).attr('data-val',1);
                        c(this).find('em i').html('keyboard_arrow_down');
                    }else{
                        c(this).attr('data-val',0);
                        c(this).find('em i').html();
                        c(this).find('em i').html('keyboard_arrow_up');
                    }

                    obj['sort'] = sort +'-'+ c(this).attr('data-val');
                    
                    c('#lists ul').empty();
                    c('#lists').after(preloadStr);
                    
                    history.pushState({},'',queryStringify(obj));

                    var pn = location.pathname[location.pathname.length-1] !='/' ? location.pathname+'/' : location.pathname;
                    
                    c.get('/jsonp'+pn,obj,function(data){
                        if(!window.scrollLock){
                            window.scrollLock = true;
                        }
                        
                        if(data.contents.length){ 
                            data.contents.forEach(function(d){
                                c('#lists ul').append(
                                    `<li class="item float" data-fric="${Math.random()}">
                                        <a href="${pn}${d.router ? d.router : d.model+'-'+d.id}">
                                            <div class="item_infomation_img" style="height: ${c('.item_infomation_img').width()};">
                                                <img src="${ d['field_4'] }" alt="${d['field_1']}">
                                            </div>
                                            <div class="item_infomation">
                                                <div class="table">
                                                    <div class="cell">
                                                        <h2>${d.title}</h2>
                                                        <h3>${d['field_1'] || ''}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </li>`
                                );
                            });   
                        }

                        c('.preload').remove();
                        
                        setTimeout(function(){
                            scroller.onResize();
                        },200);
                        
                    });
                }
                
                if(type=='news'){

                    if(c(this).attr('data-val')==0){
                        c(this).attr('data-val',1);
                        c(this).find('em i').html('keyboard_arrow_down');
                    }else{
                        c(this).attr('data-val',0);
                        c(this).find('em i').html();
                        c(this).find('em i').html('keyboard_arrow_up');
                    }

                    obj['sort'] = sort +'-'+ c(this).attr('data-val');
                    
                    c('#news ul').empty();
                    c('#news').after(preloadStr);
                    
                    history.pushState({},'',queryStringify(obj));

                    var pn = location.pathname[location.pathname.length-1] !='/' ? location.pathname+'/' : location.pathname;
                    c.get('/jsonp'+pn,obj,function(data){
                        if(!window.scrollLock){
                            window.scrollLock = true;
                        }
                        if(data.contents.length){
                            data.contents.forEach(function(d){
                                c('#news ul').append(
                                    `<li class="item float" data-fric="${Math.random()}">
                                        <a href="${pn}${d.router ? d.router : d.model+'-'+d.id}"><img src="${d['field_2'] || ''}"></a>
                                        <div class="pd20">
                                            <h3>${d.title}</h3>
                                            <h4><i class="material-icons">access_time</i><span>${d.postdate}</span></h4>
                                            <p></p>
                                        </div>
                                    </li>`
                                );
                            });
                        }

                        c('.preload').remove();
                        
                        setTimeout(function(){
                            scroller.onResize();
                        },200);
                        
                    });
                    
                }
                
            });
            
            //about
            var aboutArr = [];
            c('#about .float').each(function(){
                aboutArr.push(c(this).position().top);
            });
            var maxHeight = Math.max.apply(this,aboutArr);
            c('#about').height(maxHeight+600);
            
            setTimeout(function(){
                scroller.onResize();
            },200);
        }
        
        function dateFilter(d){
            return (d<10) ? '0'+d : d;
        }
        
        function parseDate(date){
            var dateStr = '';
            var y = date.getFullYear(),
                m = date.getMonth(),
                d = date.getDay(),
                h = date.getHours(),
                min = date.getMinutes();

            dateStr = `${y}-${dateFilter(m)}-${dateFilter(d)} ${dateFilter(h)}:${dateFilter(min)}`;
            return dateStr;
        }
        
        function getQuery(){
            var str = location.search,
                arr = str.split('&'),
                obj = {};
            
            arr.forEach(function(d){
                if(d){
                    d = d.replace('?','');
                    var arr2 = d.split('=');
                    obj[arr2[0]] = arr2[1];
                }
            });
            
            return obj;
        }
        
        function queryStringify(obj){
            var str = '',
                i = 0;
            
            for(var key in obj){
                if(key){
                    str += (i==0? '?' : '&') + key+'='+obj[key]
                    i++;
                }
            }
                
            return str;
        }
        
        c(window).on('resize',resize).on('load',init);
    });
})(jQuery,window.global || {});