# QuickCms

>QuickCms致力于开发高端网站,App而设计,推动您的想象力
<br />
<br />
官方网站

[www.quickcms.cn](http://www.quickcms.cn)
<br />
<br />
演示

[test.quickcms.cn](http://test.quickcms.cn/)

管理

[test.quickcms.cn/panel](http://test.quickcms.cn/panel)

用户:admin 密码:123456
<br /><br />

快速安装
    
    git clone https://github.com/chenxianming/quickcms.git
    
    npm install
    
init

    ./bin/quickcms - i 3000
    
直接运行

    npm start
    

QuickCms使用nodejs+mysql编写
如果你安装了forever可以运行

    ./bin/quickcms -s


结束

    ./bin/quickcms -e
    
更新

QuickCms的功能部分为模块化,版本更新为核心代码的维护,所以在核心文件未改动的前提下,使用Git将文件更新,即

进入QuickCms目录下

    git pull
    npm install


<br />
<br />

# 介绍

QuickCms是专为定制高端网站以及App而设计的一款内容管理系统,完全免费,开源

如果您的网站非常炫酷,那么这就是QuickCms的宗旨

<br />

[演示网站(Coldnoir)](http://www.coldnoir.com/)

[演示站点(experimental-pick)](http://experimental-pick.coldnoir.com/)

<br /><br />

# 功能

* 无限制内容分类,并且能自定义路由
* url拥有对应的jsonp地址以及供app调取的api
* 使用者可以自定义内容的字段以及类型
* 内容可以自定义url
* 每篇内容拥有评论功能
* 自定义网站管理者以及用户组权限
* 用户可以选择后台界面
* 可以任意切换网站外观
* 用户可以分享当前网站样式
* 拥有拓展功能 QuickCms会不断为使用者开发新的功能

<br />

# 运行测试

QuickCms仅支持在linux上运行,windows版本敬请期待

经测试 QuickCms能在一台 raspberry pi ( Cpu:ARMv7 Processor rev 4 (v7l) ) 上流畅运行


由于精力有限,该项目不能各方面都很完善,欢迎使用者提出改进
