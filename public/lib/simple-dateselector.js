/*
    @Name Simple Date Selector
    @Author chenxianming
    @Date 2017/2/21
    @Example 
        
        var els = document.getElementsByClassName('simpledateselector')[0],
            selector = new simpleDateSelector(els);
            selector.init('pass time to input');
    
*/

function simpleDateSelector(element){
    this.element = element;
    this.input = this.element.getElementsByTagName('input')[0];
    this.selector = document.createElement('div');
    this.year = '';
    this.month = '';
    this.day = '';
}

simpleDateSelector.prototype = {
    init:function(passTime){
        var self = this;
        this.passTime = passTime || null;
        
        var initDate = new Date();
        
        var selector = this.selector;
        selector.setAttribute('class','dateselector');
        selector.style.display = 'none';
        self.selector.innerHTML = `
                <div class="dateselector_display">
                    <div class="display_year">
                        <i class="prev icon-keyboard_arrow_left"></i><span>${initDate.getFullYear()}年</span><i class="next icon-keyboard_arrow_right"></i>
                    </div><div class="display_month">
                        <i class="prev icon-keyboard_arrow_left"></i><span>${initDate.getMonth()+1}月</span><i class="next icon-keyboard_arrow_right"></i>
                    </div>
                </div>
                <div class="dateselector_weeks">
                    <ul>
                        <li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li class="weekend">六</li><li class="weekend">日</li>
                    </ul>
                </div>
                <div class="dateselector_date">
                    <ul></ul>
                </div>
        `;
        
        this.element.appendChild(selector);
        this.updateDate(new Date());
        
        var y = this.element.getElementsByClassName('display_year')[0],
            m = this.element.getElementsByClassName('display_month')[0];
        
        var arr = [
            {
                name:'prevYear',
                t:y,
                type:'year',
                class:'prev'
            },
            {
                name:'nextYear',
                t:y,
                type:'year',
                class:'next'
            },
            {
                name:'prevMonth',
                t:m,
                type:'month',
                class:'prev'
            },
            {
                name:'nextMonth',
                t:m,
                type:'month',
                class:'next'
            }
        ];
        
        arr.forEach(function(d){
            d.element = d.t.getElementsByClassName(d.class)[0];
            d.element.addEventListener('click',self.switchEvent.bind(self,d.type,d.class),false);
        });
        
        self.element.getElementsByTagName('input')[0].addEventListener('click',function(){
            selector.style.display = 'block';
        },false);
    },
    getMaxDay:function(date){
        var day = (date.getDate()<28) ? (new Date(date.getFullYear(),date.getMonth(),0).getDate()) : (date.getDate());
        return day;
    },
    lastMonth:function(date){
        var dt = date,
            d = new Date(dt.setDate(0) - 100),
            lastMonth = new Date(d.getFullYear(),d.getMonth()+1,0);
        return lastMonth;
    },
    monthFirstDay:function(date){
        var d = new Date(date.getFullYear(),date.getMonth(),1);
        return d.getDay();
    },
    updateDate:function(d){
        var _nowYear = d.getFullYear(),
            _nowMonth = d.getMonth() + 1,
            _nowDay = d.getDate();
        
        var self = this;
        
        self.year = _nowYear;
        self.month = _nowMonth;
        
        var y = self.selector.getElementsByClassName('display_year')[0],
            m = self.selector.getElementsByClassName('display_month')[0];
        
        y.getElementsByTagName('span')[0].innerHTML = `${_nowYear}年`;
        m.getElementsByTagName('span')[0].innerHTML = `${_nowMonth}月`;
        
        var days = self.selector.getElementsByClassName('dateselector_date')[0],
            daysUl = days.getElementsByTagName('ul')[0];
        daysUl.innerHTML = '';
        
        var nowMonth = new Date(_nowYear,_nowMonth,0),
            nowMonthStart = self.monthFirstDay(nowMonth),
            nowMonthMaxDay = self.getMaxDay(nowMonth);
        var lastMonths = self.lastMonth(new Date(_nowYear,_nowMonth,0));
        
        if(nowMonthStart==0){
            nowMonthStart = 7;
        }else{
            nowMonthStart = nowMonthStart;
        }
        
        for(var i = 1;i<nowMonthStart;i++){
            var j = self.getMaxDay(lastMonths),
                b = j+1 - nowMonthStart;
            
            var li = document.createElement('li');
            li.setAttribute('class','gray');
            li.innerHTML = `
                <span>${(b+i)}</span><b class="dateselector_date_r"></b><b class="dateselector_date_t"></b>
            `;
            daysUl.appendChild(li);
        }
        
        for(var i = 1;i<=nowMonthMaxDay;i++){
            var li = document.createElement('li');
            if(i==_nowDay){
                li.setAttribute('class','cur');
            }
            
            li.innerHTML = `
                <span>${(i)}</span><b class="dateselector_date_r"></b><b class="dateselector_date_t"></b>
            `;
            li.addEventListener('click',self.selectEvent.bind(this,i),false);
            daysUl.appendChild(li);
        }

        var len = daysUl.getElementsByTagName('li').length,
            fixed;
        
        for(var i = 5;i<len;i+=7){
            if(!daysUl.getElementsByTagName('li')[i].getAttribute('class')) daysUl.getElementsByTagName('li')[i].setAttribute('class','weekend');
            
            if(daysUl.getElementsByTagName('li')[i+1] && !daysUl.getElementsByTagName('li')[i+1].getAttribute('class')){
                daysUl.getElementsByTagName('li')[i+1].setAttribute('class','weekend');
            }
        }
        
        if(len > 35) fixed = 42-len;
        if(len < 35) fixed = 35-len;
        
        for(var i = 1;i<fixed+1;i++){
            var li = document.createElement('li');
            li.setAttribute('class','gray');
            li.innerHTML = `
                <span>${(i)}</span><b class="dateselector_date_r"></b><b class="dateselector_date_t"></b>
            `;
            
            daysUl.appendChild(li);
        }
    },
    selectEvent:function(i){
        this.day = (i < 10) ? ('0'+i) : i;
        var month = (this.month < 10) ? ('0'+this.month) : this.month;
        
        var dateFormat = this.year+'-'+month+'-'+this.day;
        
        if(this.passTime){
            var d = new Date(),
                h = d.getHours() < 10 ? '0'+d.getHours() : d.getHours(),
                m = d.getMinutes() < 10 ? '0'+d.getMinutes() : d.getMinutes();
            
            dateFormat += ' '+h+':'+m;
        }
        
        this.input.value = dateFormat;
        this.selector.style.display = 'none';
    },
    switchEvent:function(type,className,e){
        var self = this;
        
        switch(type){
            case 'year':
                {
                    if(className=='prev'){
                        var dateStr = (self.year-1)+'-1-1 00:00:00';
                        this.updateDate(new Date(dateStr));
                    }
                    
                    if(className=='next'){
                        var dateStr = (self.year+1)+'-1-1 00:00:00';
                        this.updateDate(new Date(dateStr));
                    }
                }
            break;
                
            case 'month':
                {
                    if(className=='prev'){
                        var dateStr = '';
                        if( (self.month-1) < 1){
                            dateStr = `${(self.year-1)}-12-1 00:00:00`;
                        }else{
                            dateStr = `${self.year}-${self.month-1}-1 00:00:00`;
                        }
                        
                        this.updateDate(new Date(dateStr));
                    }
                    
                    if(className=='next'){
                        if( (self.month+1) > 12){
                            dateStr = `${(self.year+1)}-1-1 00:00:00`;
                        }else{
                            dateStr = `${self.year}-${self.month+1}-1 00:00:00`;
                        }
                        
                        this.updateDate(new Date(dateStr));
                    }
                }
            break;

        }
    }
}