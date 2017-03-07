;(function(c,global){
    c.fn.drawCanvas = function(value){
        if(!value || typeof value!='object'){
            return ;
        }
        
        var this_ = $(this),
            ctx = this_[0].getContext('2d'),
            width = this_.width(),
            height = this_.height();
        
        this_[0].width = width;
        this_[0].height = height;
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(0,0,width,height);
        
        var startY = 0;
        
        //drawBg
        var d = 35;
        for(var i = 0;i<width/10;i++){
            for(var j = 0;j<(height)/40;j++){
                var y = (height - d) - j*30,
                    x = i * 10;
                
                if(j==0){
                    startY = y;
                }
                
                ctx.beginPath();
                ctx.lineWidth = 0;
                ctx.fillStyle = 'rgba(196,208,216,.4)';
                ctx.arc(x+3,y,1.5,0,2*Math.PI,false);
                ctx.fill();
            }
        }
        
        //drawNum
        for(var i = 1;i<4;i++){
            ctx.fillStyle = '#c4d0d8';
            ctx.fontSize = '12';
            var x = (i-1)*(width/2-6)+3;
            ctx.textAlign = 'center';
            ctx.fillText(i,x,height);
        }
        
        //drawPoint
        var max = Math.max.apply(null,value)
        
        var pointers = [];
        
        value.forEach(function(d,i){
            
            var x = i*(width/2-5) + 5;
            var aMax = Math.ceil(max)+.5;
            
            var y = startY - startY * d / aMax;
            
            pointers.push({
                x:x,
                y:y
            });
        });
        
        ctx.strokeStyle = '#42d5c2';
        pointers.forEach(function(d,i){
            if(i!=pointers.length-1){
                ctx.beginPath();
                ctx.moveTo(d.x,d.y);
                ctx.lineTo(pointers[i+1].x,pointers[i+1].y);
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });
        
        ctx.fillStyle = '#c4d0d8';
        ctx.lineWidth = '5';
        ctx.strokeStyle = '#fff';
        
        this_.parents('.pd20').find('.path').empty();
        pointers.forEach(function(d,i){
            var x = d.x,
                y = d.y;
            
            if(i==0){
                this_.parents('.pd20').find('.path').append(`<b class="pointer cur" style="left:${x-10}px;top:${y-10}px;"><span><i></i>${value[i]}</span></b>`);
            }else{
                this_.parents('.pd20').find('.path').append(`<b class="pointer" style="left:${x-10}px;top:${y-10}px;"><span><i></i>${value[i]}</span></b>`);
            }
        });
        
        c(document).on('mouseenter','.pointer',function(){
            c(this).addClass('cur').siblings().removeClass('cur');
        });
    }
    
    function parseSecond(accept){
        if (accept === undefined) {
            accept = {}
        }

        return !isNaN(accept) ? parse(accept) : parse;

        function parse (seconds) {
            var parsed = {
                years: 0,
                weeks: 0,
                days: 0,
                hours: 0,
                minutes: 0
            }

        // Years
        if (accept.years !== false) {
            parsed.years = ~~(seconds / 60 / 60 / 24 / 365)
            seconds -= parsed.years * 60 * 60 * 24 * 365
        }

        // Weeks
        if (accept.weeks !== false) {
            parsed.weeks = ~~(seconds / 60 / 60 / 24 / 7)
            seconds -= parsed.weeks * 60 * 60 * 24 * 7
        }

        // Days
        if (accept.days !== false) {
            parsed.days = ~~(seconds / 60 / 60 / 24)
            seconds -= parsed.days * 60 * 60 * 24
        }

        // Hours
        if (accept.hours !== false) {
            parsed.hours = ~~(seconds / 60 / 60)
            seconds -= parsed.hours * 60 * 60
        }

        // Minutes
        if (accept.minutes !== false) {
            parsed.minutes = ~~(seconds / 60)
            seconds -= parsed.minutes * 60
        }

        // Seconds
        parsed.seconds = seconds

        return parsed
        }
    }
    
    //generator input
    c.fn.gInput = function(tar){
        var self = c(this),
            target = c(tar),
            val = '';
        
        self.on('click',function(){
            val = target.html();
            
            c('body').append(`
                <div class="gennerator_input">
                    <div class="gennerator_input_entry">
                        <div class="pd20">
                            <textarea class="insert">${val}</textarea>
                            <div class="gennerator_input_sure">确定</div><div class="gennerator_input_cancel">取消</div>
                        </div>
                    </div>
                </div>
            `);
        });
        
        c(document).on('click','.gennerator_input_cancel',function(){
            c('.gennerator_input').remove();
        });
        
        c(document).on('click','.gennerator_input_sure',function(){
            target.html(c('.gennerator_input_entry .insert').val());
            c('.gennerator_input').remove();
        });
    }
    
    //client script start
    
    c(function(){
        init();
        
        function getAvg(){
            c.get('/panel/avg',function(data){
                var d = eval(data);
                c('#drawavg').drawCanvas(d);
            });
        }
        
        function uptimeStr(uptime){
            var date = parseSecond(uptime);
            //console.log(date);
            c('.uptime').html(`${date.days}天${date.hours}小时${date.minutes}分${date.seconds}秒`);
        }
        
        function initCategories(){
            c('.new_group').attr('data-index',0);
            categories.datas.forEach(function(d,i){
                c('.new_group').append(`
                    <div class="category">
                        <div class="pd15">
                            <h2>${d.name}</h2>
                            <h2>${d.router}</h2>
                        </div>
                    </div>
                `);
            });
        }
        
        function eventAttach(){
            
            //media search
            c(document).on('click','.media_search_submit',function(){
                var val = c(this).parents('.media_search').find('input[name="keywords"]').val();

                query['keywords'] = val;
                var url = '';
                var idx = 0;
                for(var key in query){
                    url += (idx == 0 ? `?${key}=${query[key]}` : `&${key}=${query[key]}` )
                    idx++;
                }

                location.href = `/panel/contents/media/${url}`;
            });

            c('.media_search input').on('keyup',function(e){
                if(e.keyCode==13){
                    var val = c(this).val();
                    query['keywords'] = val;
                    var url = '';
                    var idx = 0;
                    for(var key in query){
                        url += (idx == 0 ? `?${key}=${query[key]}` : `&${key}=${query[key]}` )
                        idx++;
                    }

                    location.href = `/panel/contents/media/${url}`;
                }
            });
            
            //media select
            c(document).on('click','.media_file_f i',function(e){
                e.preventDefault();
                c(this).parents('.media_file_f').find('.insert').select();
                dialog('复制到剪贴板');
            });
            
            //upload event
            c(document).on('change','#uploadmedia',function(e){
                var self = this;
                
                var src = e.target || window.event.srcElement;
                var file = src.files[0];
                var formData = new FormData(c(this).parents('form')[0]);
                
                c.ajax({
                    url: "/panel/contents/media/upload",
                    type: "POST",
                    data: formData,
                    async:true,
                    processData: false,
                    contentType: false,
                    success:function(data){
                        if(data.msg){
                            return dialog(data.msg);
                        }
                        
                        var icon = '';
                        if(data.type.indexOf('video')>-1){
                            icon = 'slideshow';
                        }
                        if(data.type.indexOf('image')>-1){
                            icon = 'photo';
                        }
                        if(data.type.indexOf('audio')>-1){
                            icon = 'music_video';
                        }
                        
                        c('.mediaframe .pd20').prepend(`<div class="media_file" data-id="${data.id}">
                            <div class="media_file_h">
                                <div class="media_file_type">
                                    <i class="material-icons">${icon}</i>
                                </div>
                                <h4>名称: ${data.name}</h4>
                            </div>
                            <div class="media_file_f">
                                <input class="insert" value="${data.url}" type="text" /><i class="material-icons">link</i>
                            </div>
                        </div>`);
                        
                        dialog('上传成功');
                    },
                    error:function(res){
                        dialog('上传失败');
                    }
                });
            });
            
            //play event
            var play_id = null;
            c(document).on('click','.media_file_type',function(){
                if(c(this).parents('.media_selector').length>0){
                    return ;
                }
                
                var id = play_id = c(this).parents('.media_file').attr('data-id');
                var type = '',
                    typeStr = '';
                
                c('.play_remove').attr('data-id',id);
                
                c.get(`/panel/contents/getmedia/${id}`,function(data){
                    if(data.type.indexOf('video')>-1){
                        type = 'video';
                        typeStr = '视频';
                    }
                    if(data.type.indexOf('image')>-1){
                        type = 'image';
                        typeStr = '图片';
                    }
                    if(data.type.indexOf('audio')>-1){
                        type = 'audio';
                        typeStr = '音频';
                    }
                    
                    switch(type){
                        case 'image':
                            {
                                c('.play_area_tr').html(`<img src="${data.link}" />`);
                            }
                            break;
                        case 'video':
                            {
                                c('.play_area_tr').html(`<video id="my-video" class="video-js" controls preload="auto" poster="" data-setup='{"example_option":false}' style="width:400px;height:225px;"></video>`);
                                
                                videojs(document.getElementById('my-video'), {}, function() {
                                    this.src({'type':data.type,src:data.link});
                                });
                            }
                            break;
                        case 'audio':
                            {
                                c('.play_area_tr').html(`<audio src="${data.link}" controls></audio>`);
                            }
                            break;
                    }
                    
                    c('.play_info h3').html(`名称：${data.name}`);
                    c('.play_info h4').html(`类型：${typeStr}`);
                    c('.play_info p').html(`<span>描述：</span><em>${data.description || typeStr}<i class="material-icons">border_color</i></em>`);
                    c('.edit_description_port textarea').val(`${data.description || ''}`);
                    c('#play').addClass('open');
                });
            });
            
            c(document).on('click','.play_area_tr img',function(){
                window.open(c(this).attr('src'));
            });
            
            c(document).on('click','.play_close',function(){
                c('#play').removeClass('open');
            });
            
            c(document).on('click','.play_remove',function(){
                if(!play_id){
                    return ;
                }
                play_id = c(this).attr('data-id');
                c('.remove_this').addClass('check');
            });
            
            c(document).on('click','.remove_cancel',function(){
                c('.remove_this').removeClass('check');
            });
            
            c(document).on('click','.play_container .remove_check',function(){
                if(!play_id){
                    return ;
                }
                
                c.post('/panel/remove',{id:play_id},function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }
                    
                    c(`.media_file[data-id="${play_id}"]`).remove();
                    
                    c('.remove_this').removeClass('check');
                    c('#play').removeClass('open');
                    
                    dialog('删除成功');
                });
            });
            
            c(document).on('click','.play_info i',function(){
                c('.edit_description').addClass('edit');
            });
            
            c(document).on('click','.edit_description_cancel',function(){
                c('.edit_description').removeClass('edit');
            });
            
            c(document).on('click','.edit_description_sure',function(){
                var str = c('.edit_description_port textarea').val();
                
                c.post('/panel/editdescription',{
                    id:play_id,
                    str:str
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }
                    dialog('修改成功');
                    c('.edit_description').removeClass('edit');
                    c('.play_info p').html(`<span>描述：</span><em>${str}<i class="material-icons">border_color</i></em>`);
                });
                
            });


            //media input
            var mediaId = null;
            c('.media_input').each(function(){
                c(this).attr('data-id',~~(Math.random() * 100000));
            });

            c(document).on('click','.media_input_btn',function(){
                if(c('.media_selector').length){
                    c('.media_selector').remove();
                }

                mediaId = c(this).parents('.media_input').attr('data-id');

                c('body').append(`
                    <div class="media_selector">
                        <div class="media_selector_preload">
                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="30px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xml:space="preserve">
                                <rect x="0" y="7.22222" width="4" height="15.5556" fill="#fff" opacity="0.2">
                                  <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>
                                  <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>
                                  <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>
                                </rect>
                                <rect x="8" y="5.27778" width="4" height="19.4444" fill="#fff" opacity="0.2">
                                  <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>
                                  <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>
                                  <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>
                                </rect>
                                <rect x="16" y="7.77778" width="4" height="14.4444" fill="#fff" opacity="0.2">
                                  <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>
                                  <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>
                                  <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>
                                </rect>
                              </svg>
                        </div>
                        <i class="media_selector_close material-icons">close</i>
                        <div class="viewmore"><a target="_blank" href="/panel/contents/media">移动至媒体库</a></div>
                    </div>
                `);

                var datas = [];
                
                /*
                ( () => new Promise( (resolve,reject)=>{
                    setTimeout(resolve,100);
                } ) )().then( () => new Promise( (resolve,reject)=>{
                    c('.media_selector').addClass('open');
                    c.post('/panel/contents/media',function(data){
                        datas = data.result;
                        resolve();
                    });
                } ) ).then( () => new Promise( (resolve,reject)=>{
                    c('.media_selector_preload').animate({opacity:0},resolve);
                } ) ).then( () => new Promise( (resolve,reject)=>{
                    c('.media_selector_preload').remove();
                    c('.media_selector').prepend(`<div class="play_container"><div class="pd20"></div></div>`);

                    datas.forEach(function(d){
                        var str = '';
                        if(d.type.indexOf('video')>-1){
                            str = 'slideshow';
                        }
                        if(d.type.indexOf('image')>-1){
                            str = 'photo';
                        }
                        if(d.type.indexOf('audio')>-1){
                            str = 'music_video';
                        }

                        c('.media_selector .pd20').append(`
                            <div class="media_file" data-id="${d.id}" data-link="${d.link}">
                                <div class="media_file_h">
                                    <div class="media_file_type">
                                        <i class="material-icons">${str}</i>
                                        ${d.type.indexOf('image')>-1 ? `<img src="${d.link}" />` : '' }
                                    </div>
                                    <h4>名称: ${d.name}</h4>
                                </div>
                            </div>
                        `);
                    });
                } ) );
                */
                
                (function(){
                    return new Promise(function(resolve,reject){
                        setTimeout(resolve,100);
                    })
                })().then(function(){
                    return new Promise(function(resolve,reject){
                        c('.media_selector').addClass('open');
                        c.post('/panel/contents/media',function(data){
                            datas = data.result;
                            resolve();
                        });
                    })
                }).then(function(){
                    return new Promise(function(resolve,reject){
                        c('.media_selector_preload').animate({opacity:0},resolve);
                    })
                }).then(function(){
                    return new Promise(function(resolve,reject){
                        c('.media_selector_preload').remove();
                        c('.media_selector').prepend(`<div class="play_container"><div class="pd20"></div></div>`);

                        datas.forEach(function(d){
                            var str = '';
                            if(d.type.indexOf('video')>-1){
                                str = 'slideshow';
                            }
                            if(d.type.indexOf('image')>-1){
                                str = 'photo';
                            }
                            if(d.type.indexOf('audio')>-1){
                                str = 'music_video';
                            }

                            c('.media_selector .pd20').append(`
                                <div class="media_file" data-id="${d.id}" data-link="${d.link}">
                                    <div class="media_file_h">
                                        <div class="media_file_type">
                                            <i class="material-icons">${str}</i>
                                            ${d.type.indexOf('image')>-1 ? `<img src="${d.link}" />` : '' }
                                        </div>
                                        <h4>名称: ${d.name}</h4>
                                    </div>
                                </div>
                            `);
                        });
                    })
                });

            });

            c(document).on('click','.media_selector .media_file',function(){
                if(c(this).hasClass('selected')){
                    var link = c(this).attr('data-link');
                    c(`.media_input[data-id="${mediaId}"] input`).val(link);
                    c('.media_selector').removeClass('open');
                    setTimeout(function(){
                        c('.media_selector').remove();
                    },400);
                }else{
                    c(this).addClass('selected').siblings().removeClass('selected');
                }
            });

            c(document).on('click','.media_selector_close',function(){
                c('.media_selector').removeClass('open');
                setTimeout(function(){
                    c('.media_selector').remove();
                },400);
            });

            //remove model
            var removeModel = null;

            c(document).on('click','.remove_model',function(e){
                e.preventDefault();
                removeModel = c(this).attr('data-del');

                c('body').append(`
                    <div class="remove_model_m">
                        <div class="remove">
                            <p>确定要删除该模型吗？</p>
                            <div class="remove_check">确定</div><div class="remove_cancel">取消</div>
                        </div>
                    </div>
                `);
            });

            c(document).on('click','.remove_model_m .remove_cancel',function(){
                c('.remove_model_m').remove();
            });

            c(document).on('click','.remove_model_m .remove_check',function(){
                if(!removeModel){
                    return dialog('错误,请重试');
                }

                c.get(`/panel/contents/model/remove?guid=${removeModel}`,function(data){
                    if(data.msg){
                        return dialog('错误,请重试');
                    }
                    location.href = '/panel/contents/model';
                });
            });


            //edit model
            c(document).on('click','.options_t',function(){
                if(c(this).parents('.options').hasClass('open')){
                    c(this).parents('.options').removeClass('open');
                }else{
                    c('.options').removeClass('open');
                    c(this).parents('.options').addClass('open');
                }
            });

            c(document).on('click','.form_check i',function(e){
                e.preventDefault();
                if(c(this).hasClass('sl')){
                    c(this).removeClass('sl');
                }else{
                    c(this).addClass('sl');
                }
                
                var index = c(this).parents('.form_check').index();
                
                if(c(this).parents('.field_type').length>0){
                    c(this).parents('.field_type').find('h4 .green em').html(index);
                }
            });

            c(document).on('click','.options_d li',function(){
                var type = c(this).attr('data-type');
                c(this).parents('.options').removeClass('open');
                c(this).parents('.options').find('.options_t_w').html(c(this).find('.options_d_li').html());

                switch(type){
                    case 'form' : 
                        {
                            c(this).parents('dl').find('dd').html(`
                                <div class="pd15" data-s="form">
                                    <input class="insert" value="" placeholder="名称" type="text" /><div class="form_check" data-type="search"><i class="sl"><b></b></i><span>搜索</span></div><div class="remove_btn"><i class="material-icons">remove</i></div>
                                </div>
                            `);
                        }
                    break;

                    case 'd-form' : 
                        {
                            c(this).parents('dl').find('dd').html(`
                                <div class="pd15" data-s="d-form">
                                    <input class="insert d_value" value="" placeholder="名称" type="text" /><input class="insert d_unit" value="" placeholder="单位" type="text" /><div class="form_check" data-type="sort"><i class="sl"><b></b></i><span>排序</span></div><div class="remove_btn"><i class="material-icons">remove</i></div>
                                </div>
                            `);
                        }
                    break;

                    case 'media' : 
                        {
                            c(this).parents('dl').find('dd').html(`
                                <div class="pd15" data-s="media">
                                    <input class="insert" value="" placeholder="名称" type="text" /><div class="remove_btn"><i class="material-icons">remove</i></div>
                                </div>
                            `);
                        }
                    break;

                    case 'media-l' : 
                        {
                            c(this).parents('dl').find('dd').html(`
                                <div class="pd15" data-s="media-l">
                                    <input class="insert" value="" placeholder="名称" type="text" /><div class="remove_btn"><i class="material-icons">remove</i></div>
                                </div>
                            `);
                        }
                    break;

                    case 'checkbox' : 
                        {
                            c(this).parents('dl').find('dd').html(`
                                <div class="pd15" data-s="checkbox">
                                    <div class="checkbox_name">
                                        <input class="insert" value="" placeholder="名称" type="text" /><div class="remove_btn"><i class="material-icons">remove</i></div>
                                    </div>
                                    <div class="checkbox_options">
                                        <div class="checkbox_options_add">
                                            <i class="material-icons">add</i><span>添加选项</span>
                                        </div>
                                        <div class="form_check" data-type="filter"><i class="sl"><b></b></i><span>筛选</span></div>
                                    </div>
                                </div>
                            `);
                        }
                    break;

                    case 'options' : 
                        {
                            c(this).parents('dl').find('dd').html(`
                                <div class="pd15" data-s="options">
                                    <div class="checkbox_name">
                                        <input class="insert" value="" placeholder="名称" type="text" /><div class="remove_btn"><i class="material-icons">remove</i></div>
                                    </div>
                                    <div class="checkbox_options">
                                        <div class="checkbox_options_add">
                                            <i class="material-icons">add</i><span>添加选项</span>
                                        </div>
                                    </div>
                                </div>
                            `);
                        }
                    break;

                    case 'content' : 
                        {
                            c(this).parents('dl').find('dd').html(`
                                <div class="pd15" data-s="content">
                                    <input class="insert" value="" placeholder="名称" type="text" /><div class="remove_btn"><i class="material-icons">remove</i></div>
                                </div>
                            `);
                        }
                    break;
                }

            });

            c(document).on('click','.model_new_btn',function(){
                c('.model_new_f').before(`
                    <dl>
                        <dt>
                            <div class="options">
                                <div class="options_t">
                                    <div class="options_t_w">
                                        <i class="material-icons">insert_drive_file</i><span>表单</span>
                                    </div><i class="material-icons">keyboard_arrow_down</i>
                                </div>
                                <div class="options_d">
                                    <ul>
                                        <li data-type="form">
                                            <div class="options_d_li">
                                                <i class="material-icons">insert_drive_file</i><span>表单</span>
                                            </div>
                                        </li>
                                        <li data-type="d-form">
                                            <div class="options_d_li">
                                                <i class="material-icons">insert_drive_file</i><span>复表单</span>
                                            </div>
                                        </li>
                                        <li data-type="media">
                                            <div class="options_d_li">
                                                <i class="material-icons">photo</i><span>媒体</span>
                                            </div>
                                        </li>
                                        <li data-type="media-l">
                                            <div class="options_d_li">
                                                <i class="material-icons">perm_media</i><span>媒体集</span>
                                            </div>
                                        </li>
                                        <li data-type="checkbox">
                                            <div class="options_d_li">
                                                <i class="material-icons">radio_button_checked</i><span>单选</span>
                                            </div>
                                        </li>
                                        <li data-type="options">
                                            <div class="options_d_li">
                                                <i class="material-icons">check_box</i><span>多选</span>
                                            </div>
                                        </li>
                                        <li data-type="content">
                                            <div class="options_d_li">
                                                <i class="material-icons">content_paste</i><span>内容</span>
                                            </div>
                                        </li>

                                    </ul>
                                </div>
                            </div>
                        </dt><dd>
                            <div class="pd15" data-s="form">
                                <input class="insert" value="" placeholder="名称" type="text" /><div class="form_check" data-type="search"><i class="sl"><b></b></i><span>搜索</span></div><div class="remove_btn"><i class="material-icons">remove</i></div>
                            </div>

                        </dd>
                        <div class="clear"></div>
                    </dl>
                `);
            });

            c(document).on('click','.checkbox_options_add',function(){
                c(this).parents('.checkbox_options').before(`<div class="checkbox_options"><input class="insert" value="" placeholder="选项" type="text"><div class="remove_btn"><i class="material-icons">close</i></div></div>`);
            });

            c(document).on('click','.remove_btn',function(){
                c(this).parents('.checkbox_options').remove();
            });

            c(document).on('click','.remove_btn',function(){
                c(this).parents('dl').remove();
            });

            function newModelData(){
                var arr = [];

                c('.model_editor .pd15').each(function(){
                    var this_ = c(this);
                    var dataType = this_.attr('data-s');

                    switch(dataType){

                        case 'form':
                            {
                                arr.push({
                                    name:this_.find('input').val(),
                                    value:null,
                                    type:'form',
                                    search:this_.find('.form_check i').hasClass('sl') ? 1 : 0,
                                    sort:0,
                                    filter:0
                                });
                            }
                            break;

                        case 'd-form':
                            {
                                arr.push({
                                    name:this_.find('.d_value').val(),
                                    value:this_.find('.d_unit').val(),
                                    type:'d-form',
                                    search:0,
                                    sort:this_.find('.form_check i').hasClass('sl') ? 1 : 0,
                                    filter:0
                                });
                            }
                            break;

                        case 'media':
                            {
                                arr.push({
                                    name:this_.find('.insert').val(),
                                    value:null,
                                    type:'media',
                                    search:0,
                                    sort:0,
                                    filter:0
                                });
                            }
                            break;

                        case 'media-l':
                            {
                                arr.push({
                                    name:this_.find('.insert').val(),
                                    value:null,
                                    type:'media-l',
                                    search:0,
                                    sort:0,
                                    filter:0
                                });
                            }
                            break;

                        case 'checkbox':
                            {
                                var ar = [];
                                this_.find('.checkbox_options').each(function(){
                                    ar.push(c(this).find('.insert').val());
                                });

                                arr.push({
                                    name:this_.find('.insert').val(),
                                    value:ar.join(','),
                                    type:'checkbox',
                                    search:0,
                                    sort:0,
                                    filter:this_.find('.form_check i').hasClass('sl') ? 1 : 0
                                });
                            }
                            break;

                        case 'options':
                            {
                                var ar = [];
                                this_.find('.checkbox_options').each(function(){
                                    ar.push(c(this).find('.insert').val());
                                });

                                arr.push({
                                    name:this_.find('.insert').val(),
                                    value:ar.join(','),
                                    type:'options',
                                    search:0,
                                    sort:0,
                                    filter:0
                                });
                            }
                            break;

                        case 'content':
                            {
                                arr.push({
                                    name:this_.find('.insert').val(),
                                    value:null,
                                    type:'content',
                                    search:0,
                                    sort:0,
                                    filter:0
                                });
                            }
                            break;
                    }

                });

                return arr;
            }

            c(document).on('click','.model_new .submit .newmodel',function(){
                var name,
                    guid;

                c('.model_editor .pd15').each(function(){
                    var this_ = c(this);
                    var dataType = this_.attr('data-s');

                    switch(dataType){
                        case 'name':
                            {
                                name = this_.find('.insert').val();
                            }
                            break;

                        case 'guid':
                            {
                                guid = this_.find('.insert').val();
                            }
                            break;
                    }
                });

                var arr = newModelData();

                if(!name || !guid){
                    return dialog('名称或GUID不能为空.');
                }

                c.post('/panel/contents/model/new',{
                    name:name,
                    guid:guid,
                    datas:JSON.stringify(arr)
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }

                    location.href = '/panel/contents/model';
                });
            });


            //update model
            c(document).on('click','.model_new .submit .updatemodel',function(){
                var name,
                    guid;

                c('.model_editor .pd15').each(function(){
                    var this_ = c(this);
                    var dataType = this_.attr('data-s');

                    switch(dataType){
                        case 'name':
                            {
                                name = this_.find('.insert').val();
                            }
                            break;

                        case 'guid':
                            {
                                guid = this_.find('.insert').val();
                            }
                            break;
                    }
                });

                var arr = newModelData();

                if(!name || !guid){
                    return dialog('名称或GUID不能为空.');
                }

                c.post('/panel/contents/model/edit',{
                    name:name,
                    guid:guid,
                    datas:JSON.stringify(arr)
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }

                    location.href = '/panel/contents/model';
                });
            });


            //export model
            c(document).on('click','.model_edit_actions_export',function(){
                var guid = c(this).attr('data-export');
                window.open(`/panel/contents/model/export/${guid}`);
            });

            //import model
            c(document).on('change','.model_btn_import input',function(e){
                var src = e.target || window.event.srcElement;
                var file = src.files[0];
                var formData = new FormData(c(this).parents('form')[0]);

                c.ajax({
                    url: "/panel/contents/model/import",
                    type: "POST",
                    data: formData,
                    async:true,
                    processData: false,
                    contentType: false,
                    success:function(data){
                        if(data.msg){
                            return dialog(data.msg);
                        }

                        location.href = '/panel/contents/model';
                    },
                    error:function(res){
                        dialog('导入失败');
                    }
                });
            });

            //new post
            c(document).on('click','.items_a',function(){
                c('.items').removeClass('selected');
                c(this).parents('.items').addClass('selected');
            });

            //new post next

            //select categories
            var ct_selected = [];

            if(typeof categories != 'undefined'){
                //init
                try{
                    c('.select_categories').html(`<dl class="ct_group"><dt><span>${categories.datas[0].name}</span><i class="material-icons">keyboard_arrow_down</i></dt><dd><ul></ul></dd></dl>`);
                    categories.datas.forEach(function(d){
                        c('.select_categories dd ul').append(`<li>${d.name}</li>`);
                    });
                }catch(e){
                    console.log(e);
                    dialog('读取分类错误或已变动,请重新选择分类.#1');
                    ct_selected = [0];
                    
                    if(!c('.categories_actions_del')[0]){
                        c('.select_categories').html(`<dl class="ct_group"><dt><span>${categories.datas[0].name}</span><i class="material-icons">keyboard_arrow_down</i></dt><dd><ul></ul></dd></dl>`);
                        categories.datas.forEach(function(d){
                            c('.select_categories dd ul').append(`<li>${d.name}</li>`);
                        });
                    }
                }

                c(document).on('click','.select_categories dt',function(){
                    if(c(this).parents('.ct_group').hasClass('open')){
                        c(this).parents('.ct_group').removeClass('open');
                    }else{
                        c(this).parents('.ct_group').addClass('open');
                    }
                });

                c(document).on('click','.select_categories li',function(){
                    var index = c(this).index(),
                        sIndex = c(this).parents('.ct_group').index();

                    c(`.select_categories .ct_group:gt(${sIndex})`).remove();

                    var val = c(this).html();

                    ct_selected.splice(sIndex+1,(ct_selected.length - sIndex - 1));
                    ct_selected[sIndex] = index;

                    c(this).parents('.open').removeClass('open').find('dt span').html(val);

                    var chunk = '';

                    for(var i = -1;i<sIndex;i++){
                        chunk += `.datas[${ct_selected[i+1]}]`;
                    }

                    var tar = eval(`categories${chunk}`);

                    if(tar.datas.length){
                        c(`.select_categories`).append(`<dl class="ct_group"><dt><span>${tar.datas[0].name}</span><i class="material-icons">keyboard_arrow_down</i></dt><dd><ul></ul></dd></dl>`);


                        tar.datas.forEach(function(d){
                            c('.select_categories .ct_group').eq(sIndex+1).find('dd ul').append(`<li>${d.name}</li>`);
                        });
                    }

                    c('.select_categories_info').html(`您已选择<b>${tar.name}</b>`);
                });
            }

            if(typeof category != 'undefined'){
                try{
                    var categoryArr = category.split(',');

                    //try the categories
                    var chunkC = '';
                    categoryArr.forEach(function(d){
                        chunkC += `.datas[${d}]`;
                    })
                    eval(`categories${chunkC}`);

                    //init categories
                    c('.select_categories').empty();

                    var chunk = '';
                    var chunkB = '';

                    categoryArr.forEach(function(d,i){

                        chunkB += `.datas[${d}]`;
                        var tarB = eval(`categories${chunkB}`);

                        var tar = eval(`categories${chunk}`);

                        c('.select_categories').append(`<dl class="ct_group"><dt><span>${tarB.name}</span><i class="material-icons">keyboard_arrow_down</i></dt><dd><ul></ul></dd></dl>`);

                        tar.datas.forEach(function(p){
                            c('.select_categories .ct_group dd ul').eq(i).append(`<li>${p.name}</li>`);
                        });

                        chunk += `.datas[${d}]`;
                    });

                    ct_selected = categoryArr;

                    var tarB = eval(`categories${chunkB}`);
                    c('.select_categories_info').html(`您已选择<b>${tarB.name}</b>`);

                }catch(e){
                    dialog('读取分类错误或已变动,请重新选择分类.#2');
                    ct_selected = [0];
                    c('.select_categories').html(`<dl class="ct_group"><dt><span>${categories.datas[0].name}</span><i class="material-icons">keyboard_arrow_down</i></dt><dd><ul></ul></dd></dl>`);
                    categories.datas.forEach(function(d){
                        c('.select_categories dd ul').append(`<li>${d.name}</li>`);
                    });
                }
            }

            c(document).on('click','.new_model_next .blue_btn',function(e){
                e.preventDefault();
                var guid = c(this).attr('data-guid'),
                    model = c('.selectmodel .items.selected').attr('data-guid');
                location.href = `/panel/contents/postnew/?guid=${guid}&model=${model}`;
            });

            c(document).on('click','.remove_btn_d',function(){
                c(this).parents('.media_input').remove();
            });

            c(document).on('click','.media_add',function(){
                c('.media_options').before(`
                    <div class="media_input small" data-id="${~~(Math.random() * 100000)}">
                        <input class="insert" name="icon" type="text" placeholder="从媒体库中选择文件" value="">
                        <div class="media_input_btn"><i class="material-icons">subscriptions</i></div>
                        <div class="remove_btn_d"><i class="material-icons">remove</i></div>
                    </div>
                `);
            });

            c(document).on('click','.post_new .pd15[data-s="checkbox"] .form_check i',function(){
                c(this).parents('*[data-s="checkbox"]').find('.form_check').each(function(){
                    c(this).find('i').removeClass('sl');
                });
                c(this).addClass('sl');
            });

            c(document).on('click','.li_close',function(){
                c(this).parents('li').remove();
            });

            c(document).on('blur','.pd15[data-s="keywords"] .insert',function(){
                if(c(this).val()==''){
                    return ;
                }
                c(this).before(`<li><span>${c(this).val()}</span><span class="li_close"><i class="material-icons">close</i></span></li>`);
                c(this).val('');
            });

            var tree = [];
            var categoriesSelected = [];

            c(document).on('click','.category',function(){
                var pIdx = c(this).parents('.new_group').attr('data-index') * 1,
                    idx = c(this).index();

                var chunk = ``;

                tree[pIdx] = idx;
                categoriesSelected = [pIdx,idx];

                //init
                c(`.categories`).html(`<div class="new_group" data-index="0"></div>`);

                categories.datas.forEach(function(d,i){
                    c('.new_group').append(`
                        <div class="category${tree[0]==i ? ' last':''}">
                            <div class="pd15">
                                <h2>${d.name}</h2>
                                <h2>${d.router}</h2>
                            </div>
                        </div>
                    `);
                });

                for(var i = -1;i<pIdx;i++){
                    chunk += `.datas[${tree[i+1]}]`;

                    c(`.categories`).append(`<div class="new_group" data-index="${i+2}"></div>`);

                    var tar = null;

                    try{
                        tar = eval(`categories${chunk}`);
                    }catch(e){
                        tar = null;
                    }

                    if(!tar){
                        return ;
                    }

                    tar.datas.forEach(function(d,j){
                        c(`.new_group[data-index="${i+2}"]`).append(`
                            <div class="category">
                                <div class="pd15">
                                    <h2>${d.name}</h2>
                                    <h2>${d.router}</h2>
                                </div>
                            </div>
                        `);
                    });
                }

                c('.category').removeClass('selected');
                c('.category').removeClass('last');
                c(`.new_group[data-index="${pIdx}"]`).find('.category').eq(idx).addClass('selected');

                c('.new_group').each(function(ix){
                    if(ix==c('.new_group').length-1){
                        return ;
                    }
                    c(`.new_group[data-index="${ix}"]`).find('.category').eq(tree[ix]).addClass('last');
                });
            });

            //remove group

            c(document).on('click','.categories_actions_del',function(){
                //categoriesSelected
                c('body').append(`
                    <div class="remove_group">
                        <div class="remove">
                            <p>确定要删除该分类吗？</p>
                            <div class="remove_check">确定</div><div class="remove_cancel">取消</div>
                        </div>
                    </div>
                `);

                c('.remove_cancel').on('click',function(){
                    c('.remove_group').remove();
                });

            });

            c(document).on('click','.remove_group .remove_check',function(){
                var chunk = '';

                for(var i = -1;i<categoriesSelected[0]-1;i++){
                    chunk += `.datas[${tree[i+1]}]`;
                }

                eval(`categories${chunk}.datas.splice(${categoriesSelected[1]}, 1)`);

                //init
                c(`.categories`).html(`<div class="new_group" data-index="0"></div>`);

                categories.datas.forEach(function(d,i){
                    c('.new_group').append(`
                        <div class="category">
                            <div class="pd15">
                                <h2>${d.name}</h2>
                                <h2>${d.router}</h2>
                            </div>
                        </div>
                    `);
                });

                c.post('/panel/contents/categories',{
                    datas:JSON.stringify(categories)
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }

                    dialog('修改成功');
                    tree = [];
                    categoriesSelected = [];
                    c('.remove_group').remove();
                });

            });

            c(document).on('click','.categories_actions_add',function(){
                c('body').append(`
                    <div class="insert_group">
                        <div class="insert_gp">
                            <div class="insert_text">
                                <input class="insert" type="text" name="name" placeholder="名称" />
                                <input class="insert" type="text" name="router" placeholder="路由" />
                            </div>
                            <div class="insert_check">确定</div><div class="insert_cancel">取消</div>
                        </div>
                    </div>
                `);
            });

            c(document).on('click','.insert_cancel',function(){
                c('.insert_group').remove();
            });

            c(document).on('click','.insert_check',function(){
                var name = c('.insert_text input[name="name"]').val(),
                    router = c('.insert_text input[name="router"]').val();


                if(!name || !router){
                    return dialog('请填写名称以及路由,路由用于url分配,只能是唯一英文标识');
                }

                var parttern = /[0-9a-z\-]+$/;
                if(!parttern.test(router)){
                    return dialog('标识只能由小写字母数字以及-横线组成');
                }

                var chunk = '';

                for(var i = -1;i<categoriesSelected[0];i++){
                    chunk += `.datas[${tree[i+1]}]`;
                }

                var cts = eval(`categories${chunk}`);

                var con = false;
                cts.datas.forEach(function(d){
                    if(d.router==router){
                        con = true;
                    }
                });

                if(con){
                    return dialog('同组分类路由不能有重');
                }

                eval(`categories${chunk}.datas.splice(categories${chunk}.datas.length,0,{name:"${name}",router:"${router}",datas:[]})`);

                //init
                c(`.categories`).html(`<div class="new_group" data-index="0"></div>`);

                categories.datas.forEach(function(d,i){
                    c('.new_group').append(`
                        <div class="category">
                            <div class="pd15">
                                <h2>${d.name}</h2>
                                <h2>${d.router}</h2>
                            </div>
                        </div>
                    `);
                });

                c.post('/panel/contents/categories',{
                    datas:JSON.stringify(categories)
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }

                    dialog('修改成功');
                    tree = [];
                    categoriesSelected = [];
                    c('.insert_group').remove();
                });

            });

            function offlineContent(postObj,callback){
                //check

                if(!ct_selected){
                    return dialog('请选择分类');
                }

                postObj['category'] = ct_selected;

                var title = c('div[data-s="title"] input').val();

                if(!title){
                    return dialog('请填写标题');
                }

                postObj['title'] = title;

                var date = c('div[data-s="date"] input').val();

                if(!date){
                    return dialog('请填写时间');
                }

                postObj['postdate'] = date;

                var router = c('div[data-s="router"] input').val();

                var parttern = /[0-9a-z\-]+$/;
                if(router && !parttern.test(router)){
                    return dialog('标识只能由小写字母数字以及-横线组成');
                }

                postObj['router'] = router;

                var up = new Date().getTime();

                postObj['guid'] = guid;

                postObj['up'] = up;

                postObj['views'] = 1;

                //custom field
                c('.custom_field').each(function(){
                    var self = c(this);
                    var index = self.attr('data-id');
                    var type = self.find('.field_type').attr('data-s');

                    switch(type){
                        case 'form':
                            {
                                var val = self.find('.field_type input').val();
                                if(val){
                                    postObj[`field_${index}`] = val;
                                }
                            }
                            break;

                        case 'd-form':
                            {
                                var val = self.find('.field_type .d_value').val();
                                if(val){
                                    postObj[`field_${index}`] = val;
                                }
                            }
                            break;

                        case 'media':
                            {
                                var val = self.find('.field_type .media_input input').val();
                                if(val){
                                    postObj[`field_${index}`] = val;
                                }
                            }
                            break;

                        case 'media-l':
                            {
                                var val = [];

                                self.find('.media_input').each(function(){
                                    val.push(c(this).find('input').val());
                                });

                                if(val.length){
                                    postObj[`field_${index}`] = val;
                                }
                            }
                            break;

                        case 'media':
                            {
                                var val = self.find('.field_type .media_input input').val();
                                if(val){
                                    postObj[`field_${index}`] = val;
                                }
                            }
                            break;

                        case 'checkbox':
                            {
                                var val = [];
                                self.find('.form_check').each(function(){
                                    var value = c(this).find('i').hasClass('sl') ? 1 : 0;
                                    val.push(value);
                                });

                                if(val){
                                    postObj[`field_${index}`] = val;
                                }
                            }
                            break;

                        case 'options':
                            {
                                var val = [];
                                self.find('.form_check').each(function(){
                                    var value = c(this).find('i').hasClass('sl') ? 1 : 0;
                                    val.push(value);
                                });

                                if(val){
                                    postObj[`field_${index}`] = val;
                                }
                            }
                            break;

                        case 'content':
                            {
                                var val = self.find('.wang_editor').html();

                                if(val){
                                    postObj[`field_${index}`] = val;
                                }
                            }
                            break;
                    }
                });

                var keywords = [];

                c('div[data-s="keywords"] li').each(function(){
                    keywords.push(c(this).find('span').eq(0).html());
                });

                postObj['tags'] = keywords;

                callback && callback(postObj);
            }

            //post new content
            c(document).on('click','.post_new .submit .newpost_btn',function(){
                var postObj = {};
                if(!ct_selected.length){
                    return dialog('请先选择分类');
                }
                
                /*
                ( () => new Promise( (resolve,reject) => {
                    offlineContent(postObj,resolve);
                } ) )().then( ()=> new Promise( () => {
                    //post postObj to server => 
                    if(!guid || !model){
                        return dialog('提交失败,页面缺少必要参数');
                    }
                    
                    c.post('/panel/contents/postnew',{
                        guid:guid,
                        model:model,
                        datas:JSON.stringify(postObj)
                    },function(data){
                        if(data.msg){
                            return dialog(data.msg);
                        }
                        location.href = `/panel/contents/collectionsview/?guid=${guid}`;
                    });
                } ) )
                */
                
                (function(){
                    return new Promise(function(resolve,reject){
                        offlineContent(postObj,resolve);
                    })
                })().then(function(){
                    return new Promise(function(resolve,reject){
                        //post postObj to server => 
                        if(!guid || !model){
                            return dialog('提交失败,页面缺少必要参数');
                        }

                        c.post('/panel/contents/postnew',{
                            guid:guid,
                            model:model,
                            datas:JSON.stringify(postObj)
                        },function(data){
                            if(data.msg){
                                return dialog(data.msg);
                            }
                            location.href = `/panel/contents/collectionsview/?guid=${guid}`;
                        });
                    })
                });

            });

            //edit content
            c(document).on('click','.post_new .submit .editpost_btn',function(){
                var postObj = {};

                /*
                ( () => new Promise( (resolve,reject) => {
                    offlineContent(postObj,resolve);
                } ) )().then( ()=> new Promise( (resolve,reject) => {
                    //post postObj to server => edit
                    if(!guid || !model || !id){
                        return dialog('提交失败,页面缺少必要参数');
                    }

                    c.post('/panel/contents/update',{
                        guid:guid,
                        model:model,
                        id:id,
                        datas:JSON.stringify(postObj)
                    },function(data){
                        if(data.msg){
                            return dialog(data.msg);
                        }

                        location.href = `/panel/contents/collectionsview/?guid=${guid}`;
                    });
                } ) )
                */
                
                (function(){
                    return new Promise(function(resolve,reject){
                        offlineContent(postObj,resolve);
                    })
                })().then(function(){
                    return new Promise(function(resolve,reject){
                        //post postObj to server => edit
                        if(!guid || !model || !id){
                            return dialog('提交失败,页面缺少必要参数');
                        }

                        c.post('/panel/contents/update',{
                            guid:guid,
                            model:model,
                            id:id,
                            datas:JSON.stringify(postObj)
                        },function(data){
                            if(data.msg){
                                return dialog(data.msg);
                            }

                            location.href = `/panel/contents/collectionsview/?guid=${guid}`;
                        });
                    });
                })
                
            });

            //remove content
            c(document).on('click','.content_edit_remove',function(){
                var self = c(this);

                if(self.attr('data-guid')){
                    guid = self.attr('data-guid');
                }

                if(self.attr('data-model')){
                    model = self.attr('data-model');
                }

                if(self.attr('data-id')){
                    id = self.attr('data-id');
                }

                c('body').append(`
                    <div class="remove_content">
                        <div class="remove">
                            <p>确定要删除该内容吗？</p>
                            <div class="remove_check">确定</div><div class="remove_cancel">取消</div>
                        </div>
                    </div>
                `);

                c('.remove_cancel').on('click',function(){
                    c('.remove_content').remove();
                });
            });

            c(document).on('click','.remove_content .remove_check',function(){

                //post postObj to server => remove
                if(!guid || !model || !id){
                    return dialog('提交失败,页面缺少必要参数');
                }

                c.post('/panel/contents/collections/remove',{
                    guid:guid,
                    model:model,
                    id:id
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }

                    location.href = `/panel/contents/collectionsview/?guid=${guid}`;
                });
            });


            //lists event
            c(document).on('click','.collections_search_submit',function(){
                var val = c(this).parents('.collections_search').find('input[name="keywords"]').val();

                query['keywords'] = val;
                var url = '';
                var idx = 0;
                for(var key in query){
                    url += (idx == 0 ? `?${key}=${query[key]}` : `&${key}=${query[key]}` )
                    idx++;
                }

                location.href = `/panel/contents/collectionsview/${url}`;
            });

            c('.collections_search input').on('keyup',function(e){
                if(e.keyCode==13){
                    var val = c(this).val();
                    query['keywords'] = val;
                    var url = '';
                    var idx = 0;
                    for(var key in query){
                        url += (idx == 0 ? `?${key}=${query[key]}` : `&${key}=${query[key]}` )
                        idx++;
                    }

                    location.href = `/panel/contents/collectionsview/${url}`;
                }
            });

            c(document).on('click','.new_collection_next .blue_btn',function(e){
                e.preventDefault();
                var guid = c('.selectmodel .selected').attr('data-guid');
                location.href = `/panel/contents/collections/new/?model=${guid}`;
            });
            
            //new collection
            c(document).on('click','.new_collection .new_collection_submit .blue_btn',function(e){
                e.preventDefault();
                
                if(!model){
                    return dialog('请先选择模型');
                }
                
                var obj = {};
                
                c('.new_collection_editor dl').each(function(){
                    var self = c(this),
                        type = self.attr('data-key');
                    
                    switch(type){
                        case 'name' :
                            {
                                obj['name'] = self.find('.insert').val();
                            }
                            break ;
                            
                        case 'guid' :
                            {
                                obj['guid'] = self.find('.insert').val();
                            }
                            break ;
                            
                        case 'styles' :
                            {
                                obj['styles'] = self.find('.menu_selected dt').attr('data-value');
                            }
                            break ;

                    }
                });
                
                if(!obj['name'] || !obj['guid'] || !obj['styles']){
                    return dialog('缺少必要参数#1');
                }
                
                var parttern = /[0-9a-z\-]+$/;
                if(!parttern.test(obj['guid'])){
                    return dialog('guid只能由小写字母数字以及-横线组成');
                }
                
                c.post('/panel/contents/collections/new',{
                    model:model,
                    datas:JSON.stringify(obj)
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }
                    
                    location.href = '/panel/contents/collections';
                });
                
            });
            
            //edit collection
            c(document).on('click','.edit_collection .new_collection_submit .blue_btn',function(e){
                e.preventDefault();
                
                var obj = {};
                
                c('.new_collection_editor dl').each(function(){
                    var self = c(this),
                        type = self.attr('data-key');
                    
                    switch(type){
                        case 'name' :
                            {
                                obj['name'] = self.find('.insert').val();
                            }
                            break ;
                            
                        case 'guid' :
                            {
                                obj['guid'] = self.find('.insert').val();
                            }
                            break ;
                            
                        case 'styles' :
                            {
                                obj['style'] = self.find('.menu_selected dt').attr('data-value');
                            }
                            break ;
                            
                        case 'model' :
                            {
                                obj['defaultmodel'] = self.find('.menu_selected dt').attr('data-value');
                            }
                            break ;
                            
                    }
                });
                
                if(!obj['defaultmodel']){
                    return dialog('请先选择模型');
                }
                
                if(!obj['name'] || !obj['guid'] || !obj['style']){
                    return dialog('缺少必要参数#2');
                }
                
                var parttern = /[0-9a-z\-]+$/;
                if(!parttern.test(obj['guid'])){
                    return dialog('guid只能由小写字母数字以及-横线组成');
                }
                
                c.post('/panel/contents/collections/edit',obj,function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }
                    
                    location.href = '/panel/contents/collections';
                });
                
            });
            
            //remove collection
            c(document).on('click','.remove_collection',function(e){
                e.preventDefault();
                
                var guid = c(this).attr('data-guid');
                
                c('body').append(`
                    <div class="remove_collection_check" data-guid = ${guid}>
                        <div class="remove">
                            <p>确定要删除该列表集吗？</p>
                            <div class="remove_check">确定</div><div class="remove_cancel">取消</div>
                        </div>
                    </div>
                `);
            });
            
            c(document).on('click','.remove_cancel',function(){
                c('.remove_collection_check').remove();
            });
            
            c(document).on('click','.remove_collection_check .remove_check',function(){
                var guid = c(this).parents('.remove_collection_check').attr('data-guid');
                
                c.post('/panel/contents/collections/removecollection',{
                    guid:guid
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }
                    
                    location.href = '/panel/contents/collections';
                })
            });
            

            c(document).on('click','a[data-type="up"]',function(e){
                e.preventDefault();
                var id = c(this).attr('data-id'),
                    model = c(this).attr('data-model');

                c.post(`/panel/contents/up`,{
                    id:id,
                    model:model
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }

                    dialog('置顶成功');
                });
            });

            //post new group
            function getRoles(){
                var arr = [];
                c('.groups_role_row').each(function(){
                    var arr1 = [],
                        self = c(this);

                    self.find('li').each(function(){
                        var val = c(this).find('i').hasClass('sl') ? 1 : 0;
                        arr1.push(val);
                    });

                    arr.push(arr1);
                });

                return arr;
            }

            c(document).on('click','.groups_new .groups_submit',function(){
                var roles = getRoles();

                var name,
                    guid;

                c('.groups_editor dl').each(function(){
                    var key = c(this).attr('data-key');

                    switch(key){
                        case 'name': 
                            {
                                name = c(this).find('input').val();
                            }
                            break;

                        case 'guid':
                            {
                                guid = c(this).find('input').val();
                            }
                            break;
                    }
                });

                if(!name || !guid || !roles){
                    return dialog('提交失败,页面缺少必要参数');
                }

                var parttern = /[0-9a-z\-]+$/;
                if(!parttern.test(guid)){
                    return dialog('标识只能由小写字母数字以及-横线组成');
                }

                c.post('/panel/groups/new',{
                    name:name,
                    guid:guid,
                    roles:JSON.stringify(roles)
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }

                    location.href = '/panel/groups';
                });

            });

            //edit group

            c(document).on('click','.groups_edit .groups_submit',function(){
                var roles = getRoles();

                var name,
                    guid;

                c('.groups_editor dl').each(function(){
                    var key = c(this).attr('data-key');

                    switch(key){
                        case 'name': 
                            {
                                name = c(this).find('input').val();
                            }
                            break;

                        case 'guid':
                            {
                                guid = c(this).find('input').val();
                            }
                            break;
                    }
                });

                if(!name || !guid || !roles){
                    return dialog('提交失败,页面缺少必要参数');
                }

                var parttern = /[0-9a-z\-]+$/;
                if(!parttern.test(guid)){
                    return dialog('标识只能由小写字母数字以及-横线组成');
                }

                c.post('/panel/groups/edit',{
                    name:name,
                    guid:guid,
                    roles:JSON.stringify(roles)
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }

                    location.href = '/panel/groups';
                });

            });

            //remove group
            c(document).on('click','.remove_gp',function(e){
                e.preventDefault();
                var guid = c(this).attr('data-guid');

                c('body').append(`
                    <div class="remove_group_makesure" data-guid = ${guid}>
                        <div class="remove">
                            <p>确定要删除该文件吗？</p>
                            <div class="remove_check">确定</div><div class="remove_cancel">取消</div>
                        </div>
                    </div>
                `);
            });

            c(document).on('click','.remove_group_makesure .remove_check',function(){
                var guid = c(this).parents('.remove_group_makesure').attr('data-guid');
                if(!guid){
                    return dialog('guid不能为空,删除失败');
                }

                c.post('/panel/groups/remove',{
                    guid:guid,
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }

                    location.href = '/panel/groups';
                });
            });

            c(document).on('click','.remove_group_makesure .remove_cancel',function(){
                c('.remove_group_makesure').remove();
            });
            
            //remove_comment
            c(document).on('click','.remove_comment',function(){
                var guid = c(this).attr('data-guid');

                c('body').append(`
                    <div class="remove_comment_makesure" data-guid = ${guid}>
                        <div class="remove">
                            <p>确定要删除该评论吗？</p>
                            <div class="remove_check">确定</div><div class="remove_cancel">取消</div>
                        </div>
                    </div>
                `);
            });
            
            c(document).on('click','.remove_comment_makesure .remove_check',function(){
                var guid = c(this).parents('.remove_comment_makesure').attr('data-guid');
                if(!guid){
                    return dialog('guid不能为空,删除失败');
                }

                c.post('/panel/contents/comments/removeall',{
                    id:guid,
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }

                    location.href = '/panel/contents/comments';
                });
            });
            
            c(document).on('click','.remove_comment_makesure .remove_cancel',function(){
                c('.remove_comment_makesure').remove();
            });

            //avatar upload
            c(document).on('change','#uploadavatar',function(e){
                var src = e.target || window.event.srcElement;
                var file = src.files[0];
                var formData = new FormData(c(this).parents('form')[0]);

                c.ajax({
                    url: `/panel/users/upload/-common`,
                    type: "POST",
                    data: formData,
                    async: true,
                    contentType: false,
                    processData: false,
                    success:function(data){
                        if(data.msg){
                            return dialog(data.msg);
                        }

                        c('.user_avatar img').attr('src',data.result);
                        c('.user_avatar img').attr('data-src',data.result);

                        dialog('上传头像成功');
                    },
                    error:function(res){
                        dialog('导入失败');
                    }
                });
            });

            
            
            function getUser(isNew){
                
                var obj = {};
                
                c('.groups_editor dl[data-key]').each(function(){
                    var self = c(this),
                        type = self.attr('data-key');
                    
                    switch(type){
                        case 'username' : 
                            {
                                
                                obj['username'] = self.find('.insert').val();
                                
                            }
                            
                        break;
                            
                        case 'nickname' : 
                            {
                                
                                obj['nickname'] = self.find('.insert').val();
                                
                            }
                            
                        break;
                            
                        case 'groups' : 
                            {
                                
                                obj['groups'] = self.find('.menu_selected dt').attr('data-value');
                                
                            }
                            
                        break;
                            
                        case 'styles' : 
                            {
                                
                                obj['styles'] = self.find('.menu_selected dt').attr('data-value');
                                
                            }
                            
                        break;
                            
                        case 'email' : 
                            {
                                
                                if(isNew){
                                    obj['email'] = self.find('.insert').val();
                                }else{
                                    obj['email'] = self.find('.user_email span').html();
                                }
                                
                            }
                            
                        break;
                        
                        case 'avatar' : 
                            {
                                
                                obj['avatar'] = self.find('.user_avatar img').attr('data-src') || null;
                                
                            }
                            
                        break;
                            
                        case 'password' : 
                            {
                                var val = self.find('.insert[placeholder="密码"]').val();
                                
                                if( val && val == self.find('.insert[placeholder="重复密码"]').val() ){
                                    obj['password'] = val;
                                }
                                
                            }
                            
                        break;
                            
                    }
                    
                });
                
                
                return obj;
            }
            
            //user new
            c(document).on('click','.user_new .groups_submit .blue_btn',function(e){
                e.preventDefault();
                
                var obj = getUser(!0);
                
                //check form
                var parttern = /[0-9a-zA-Z\-]+$/;
                if(!parttern.test(obj['username'])){
                    return dialog('用户名称只能由字母数字以及-横线组成');
                }
                
                if(obj['username'] && obj['username'].length < 3){
                    return dialog('用户名称长度不能小于3');
                }
                
                var passVal = c('dl[data-key="password"] input[placeholder="密码"]').val(),
                    rPassval = c('dl[data-key="password"] input[placeholder="重复密码"]').val();
                
                if(passVal!=rPassval){
                    return dialog('两次密码不一样');
                }
                
                if(!obj['password']){
                    return dialog('请输入密码');
                }
                
                if(obj['password'].length<6){
                    return dialog('密码长度不能小于6');
                }
                
                if(!obj['nickname'] || !obj['groups'] || !obj['styles'] || !obj['email']){
                    return dialog('缺少必填参数');
                }
                
                //post obj to server
                c.post('/panel/users/new',obj,function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }
                    
                    location.href = '/panel/users';
                });
                
            });
            
            //user editor
            c('.user_email i').gInput('.user_email span');
            
            c(document).on('click','.user_edit .groups_submit .blue_btn',function(e){
                e.preventDefault();
                
                var obj = getUser();
                
                //check form
                var parttern = /[0-9a-zA-Z\-]+$/;
                if(!parttern.test(obj['username'])){
                    return dialog('用户名称只能由字母数字以及-横线组成');
                }
                
                var passVal = c('dl[data-key="password"] input[placeholder="密码"]').val(),
                    rPassval = c('dl[data-key="password"] input[placeholder="重复密码"]').val();
                
                if(passVal!=rPassval){
                    return dialog('两次密码不一样');
                }
                
                if(obj['password'] && obj['password'].length<6){
                    return dialog('密码长度不能小于6');
                }
                
                //post obj to server
                c.post('/panel/users/edit',obj,function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }
                    
                    location.href = '/panel/users';
                });
                
            });
            
            //user remove
            c(document).on('click','.remove_user',function(e){
                e.preventDefault();
                
                var username = c(this).attr('data-username');
                
                c('body').append(`
                    <div class="remove_user_check" data-username = ${username}>
                        <div class="remove">
                            <p>确定要删除该用户吗？</p>
                            <div class="remove_check">确定</div><div class="remove_cancel">取消</div>
                        </div>
                    </div>
                `);
            });
            
            c(document).on('click','.remove_user_check .remove_cancel',function(){
                c('.remove_user_check').remove();
            });
            
            c(document).on('click','.remove_user_check .remove_check',function(){
                var username = c(this).parents('.remove_user_check').attr('data-username');
                
                c.post(`/panel/users/remove`,{
                    username:username
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }
                    
                    location.href = '/panel/users/';
                });
            });

            //new style
            c(document).on('click','.styles_new .styles_new_submit .blue_btn',function(){
                var obj = {};
                
                c('.styles_new dl[data-key]').each(function(){
                    var self = c(this),
                        type = self.attr('data-key');
                    
                    obj[type] = self.find('.insert').val();
                    
                });
                
                //check obj
                if(!obj['guid'] || !obj['name'] || !obj['entry'] || !obj['author']){
                    return dialog('缺少必要参数');
                }
                
                var parttern = /[0-9a-z\-]+$/;
                if(!parttern.test(obj['guid'])){
                    return dialog('标识只能由小写字母数字以及-横线组成');
                }
                
                c.post('/panel/styles/new',obj,function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }
                    
                    location.href = '/panel/styles/complete';
                });
            });
            
            //edit style
            c(document).on('click','.styles_edit_submit',function(){
                var obj = {};
                c('.groups_editor dl').each(function(){
                    var type = c(this).attr('data-key'),
                        value = c(this).find('.insert').val();
                    
                    obj[type] = value;
                });
                
                if(!obj['guid'] || !obj['name'] || !obj['entry'] || !obj['author']){
                    return dialog('缺少必填字段');
                }
                
                c.post('/panel/styles/edit',obj,function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }
                    
                    location.href = '/panel/styles';
                });
            });
            
            //remove sytle
            c(document).on('click','.remove_style',function(e){
                e.preventDefault();
                var guid = c(this).attr('data-guid');
                
                c('body').append(`
                    <div class="remove_style_makesure" data-guid = ${guid}>
                        <div class="remove">
                            <p>确定要删除该样式吗？</p>
                            <div class="remove_check">确定</div><div class="remove_cancel">取消</div>
                        </div>
                    </div>
                `);
            });
            
            c(document).on('click','.remove_style_makesure .remove_cancel',function(){
                c('.remove_style_makesure').remove();
            });
            
            c(document).on('click','.remove_style_makesure .remove_check',function(e){
                e.preventDefault();
                var guid = c(this).parents('.remove_style_makesure').attr('data-guid');
                
                c.post('/panel/styles/remove',{
                    guid:guid
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }
                    
                    location.href = '/panel/styles';
                });
            });
            
            //add style
            var addStyleLock = true;
            
            c(document).on('click','.add_style',function(e){
                e.preventDefault();
                
                dialog('正在添加中,请等待');
                
                if(!addStyleLock){
                    return dialog('正在添加中,请勿重复操作');
                }
                
                var guid = c(this).attr('data-guid');
                addStyleLock = false;
                
                c.post('/panel/styles/center/get',{
                    guid:guid
                },function(data){
                    if(data.msg){
                        addStyleLock = true;
                        return dialog(data.msg);
                    }
                    
                    location.href = '/panel/styles';
                });
                
            });
            
            //extensions
            
            //add extensions
            var addExtensionsLock = true;
            
            c(document).on('click','.add_extension',function(e){
                e.preventDefault();
                if(!addExtensionsLock){
                    return dialog('添加成功后会有提示,请等待');
                }
                
                dialog('正在添加中,请等待');
                addExtensionsLock = false;
                
                var guid = c(this).attr('data-guid');
                c.post('/panel/extensions/center/add',{
                    guid:guid
                },function(data){
                    if(data.msg){
                        addExtensionsLock = true;
                        return dialog(data.msg);
                    }
                    
                    addExtensionsLock = true;
                    
                    location.href = '/panel/extensions';
                });
            });
            
            //remove extensions
            c(document).on('click','.rm_extensions',function(){
                var guid = c(this).attr('data-guid');
                
                c('body').append(`
                    <div class="remove_extensions_makesure" data-guid = ${guid}>
                        <div class="remove">
                            <p>确定要删除该拓展吗？</p>
                            <div class="remove_check">确定</div><div class="remove_cancel">取消</div>
                        </div>
                    </div>
                `);
            });
            
            c(document).on('click','.remove_extensions_makesure .remove_cancel',function(){
                c('.remove_extensions_makesure').remove();
            });
            
            c(document).on('click','.remove_extensions_makesure .remove_check',function(e){
                e.preventDefault();
                var guid = c(this).parents('.remove_extensions_makesure').attr('data-guid');
                
                c.post('/panel/extensions/remove',{
                    guid:guid
                },function(data){
                    if(data.msg){
                        return dialog(data.msg);
                    }
                    
                    location.href = '/panel/extensions';
                });
            });
            
            //generator menu
            c(document).on('click','.menu_selected dt',function(){
                var self = c(this),
                    gp = c(this).parents('.menu_selected').find('.ct_group');
                
                if(gp.hasClass('open')){
                    gp.removeClass('open');
                }else{
                    gp.addClass('open');
                }
            });
            
            c(document).on('click','.menu_selected li',function(){
                var self = c(this);
                var val = c(this).attr('data-value');
                var content = c(this).html();
                
                self.parents('.menu_selected').find('dt').attr('data-value',val);
                self.parents('.menu_selected').find('dt span').html(content);
                
                self.parents('.ct_group').removeClass('open');
                
                var bind = self.parents('.menu_selected').attr('data-bind');
                
                if(bind){
                    c(bind).val(val);
                }
            });
            
            
            
        }
        
        function init(){
            if(typeof uptime!='undefined'){
                getAvg();
                setInterval(getAvg,15 * 1000 * 60);
                setInterval(function(){
                    uptimeStr(uptime+=1);
                },1000);
            }
            
            if(typeof categories!='undefined'){
                initCategories();
            }
            
            eventAttach();
        }
    });
}(jQuery,window.global || {}))