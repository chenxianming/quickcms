var Scroller = function(el,parm){
	this.el = el;
	this.parm = parm || {};
	this.w = $(window);
}
Scroller.prototype = {
	init:function(){
		//if($(window).scrollTop() != 0) location=location;
		var wrap = $('<div id="viewport"></div>').addClass('fixed')
		this.el.wrap(wrap);
		this.parm.height = this.el.height();
		var layerFill = $('<div id="layerfill"></div>').height(this.parm.height).prependTo($('body'));
		
		this.w.on('scroll',this.onScroll.bind(this)).on('resize',this.onResize.bind(this));
		
		window.addEventListener('mousewheel',this.onWheel.bind(this));
		window.addEventListener('wheel',this.onWheel.bind(this));
		
		this.el.find('.el-fixed').each(function(){
			$(this).data('pt',$(this).offset().top);
		});
		this.el.find('.float').each(function(){
			$(this).data('pt',$(this).offset().top);
		});
		
	},
	onResize:function(){
		//location=location;
        var h = this.el.height();
        this.parm.height = h;
        $('#layerfill').height(this.parm.height);
	},
	onScroll:function(){
		var s = this.w.scrollTop();
		this.parm.s = s;
		_this = this;
		
		TweenLite.to(this.el,this.parm.speed || 1,{
			y:-s,
			force3D:true,
			ease:Expo.easeOut,
			onUpdate:function(){
				_this.el.find('.float').each(function(){
					var t = $(this),
						a = _this.el.offset().top,
						f = t.attr('data-fric');
                    
						TweenLite.to(t,1,{
							y:a * f,
							force3D:true,
							ease:Expo.easeOut
						});
				});
                
                var st = _this.el.position().top;
                _this.el.find('.el-fixed').each(function(){
                    var t = $(this);
                    TweenLite.set(t,{
                        y:-st,
                        force3D:true,
                        ease:Expo.easeOut
                    });
                });
                
				if(_this.onRender) _this.onRender();
			},
			onComplete:this.onComplete.bind(this)
		});
		
	},
	onWheel:function(event){
		var d = event.deltaY > 0 ? 0 : 1;
		if(d){//up
			
		}else{
		
		}
	},
	onRender:function(){

	},
	onComplete:function(){
		
	}
}
$.fn.parallax = function(){
	var _this = $(this);
	$(window).on('mousemove',function(e){
		var x = e.clientX - $(window).width() / 2,
			y = e.clientY - $(window).height() / 2;
		
		_this.find('.ele-parallax').each(function(){
			var t = $(this),
				f = t.attr('data-fric');
			TweenLite.to(t,2,{
				x:-x * f/12,
				y:-y * f/12,
				ease:Expo.easeOut,
				force3D:true
			});
		});
	});
}
requestAnimationFrame = window.requestAnimationFrame
|| window.mozRequestAnimationFrame
|| window.webkitRequestAnimationFrame
|| window.msRequestAnimationFrame
|| window.oRequestAnimationFrame
|| function(callback) {
	setTimeout(callback, 1000 / 60);
};