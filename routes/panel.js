var express = require('express');
var router = express.Router();

var fs = require('fs');
var code = fs.readFileSync(__dirname+'/common.js','utf8');
eval(code);

var installLock = `${__dirname.replace('routes','utils/install/lock.js')}`;
if(fs.existsSync(installLock)){
    //auto run
    var autoRun = require(`${__dirname.replace('routes','')}/utils/paneltasks`);
    autoRun();
    setInterval(autoRun,20 * 60 * 1000);//20 * 60 * 1000 (20minutes)
}

const panelRouters = {
    login:require(`${__dirname}/admin/login`),
    middleware:require(`${__dirname}/admin/middleware`),
    index:require(`${__dirname}/admin/index`),
    system:require(`${__dirname}/admin/system`),
    contents:require(`${__dirname}/admin/contents`),
    users:require(`${__dirname}/admin/users`),
    styles:require(`${__dirname}/admin/styles`),
    extensions:require(`${__dirname}/admin/extensions`)
}

//login
router.get('/login',panelRouters.login.login);

router.post('/login',panelRouters.login.loginPost);

//middle ware for login
router.use(panelRouters.middleware.login);

//middle ware for roles
router.use(panelRouters.middleware.roles);

//middle ware for update dymicRoutes
router.use(panelRouters.middleware.updateDymicRoutes);

//index
router.get('/',panelRouters.index.panel);
router.get('/avg', (req, res, next) => res.send(os.loadavg()) );

//system
router.get('/system',panelRouters.system.system);
router.post('/system',panelRouters.system.systemPost);

//contents
router.get('/contents',panelRouters.contents.contents);
router.get('/contents/media',panelRouters.contents.media);
router.post('/contents/media',panelRouters.contents.mediaPost);

//upload
router.post('/contents/media/upload',multipartMiddleware,panelRouters.contents.upload);

//getmedia
router.get('/contents/getmedia/:id',panelRouters.contents.getMedia);

//remove
router.post('/remove',panelRouters.contents.remove);

//edit description
router.post('/editdescription',panelRouters.contents.editdescription);

//collections
router.get('/contents/collections',panelRouters.contents.collections);

router.get('/contents/collectionsview',panelRouters.contents.collectionsview);

//edit detail
router.get('/contents/collectionsdetail',panelRouters.contents.collectionsdetail);

//up content
router.post('/contents/up',panelRouters.contents.upcontent);

router.get('/contents/postnew',panelRouters.contents.postnew);

//recivepostobject
router.post('/contents/postnew',panelRouters.contents.recivepostobject);

//update post
router.post('/contents/update',panelRouters.contents.updatepost);

//remove collections
router.post('/contents/collections/remove',panelRouters.contents.removecollections);

//model
router.get('/contents/model',panelRouters.contents.model);

//model new
router.get('/contents/model/new',panelRouters.contents.modelnew);
router.post('/contents/model/new',panelRouters.contents.modelnewPost);

//model edit
router.get('/contents/model/edit',panelRouters.contents.modelEdit);

//model update
router.post('/contents/model/edit',panelRouters.contents.modelUpdate);

//model remove
router.get('/contents/model/remove',panelRouters.contents.modelRemove);

//model export
router.get('/contents/model/export/:guid',panelRouters.contents.modelExport);

//import model
router.post('/contents/model/import',multipartMiddlewareTemp,panelRouters.contents.importModel);

//collections new
router.get('/contents/collections/new',panelRouters.contents.collectionsNew);
router.post('/contents/collections/new',panelRouters.contents.collectionsNewPost);

//edit collection
router.get('/contents/collections/edit',panelRouters.contents.editCollection);
router.post('/contents/collections/edit',panelRouters.contents.editCollectionPost);

//remove collection
router.post('/contents/collections/removecollection',panelRouters.contents.removeCollection);

//categories
router.get('/contents/categories',panelRouters.contents.categories);
router.post('/contents/categories',panelRouters.contents.categoriesPost);

//comments
router.get('/contents/comments',panelRouters.contents.comments);

//comments detail
router.get('/contents/comments/detail',panelRouters.contents.commentsDetail);

//comments remove
router.get('/contents/comments/remove',panelRouters.contents.commentsRemove);

router.post('/contents/comments/removeall',panelRouters.contents.removeall);

//users
router.get('/users',panelRouters.users.users);

//user new
router.get('/users/new',panelRouters.users.userNew);
router.post('/users/new',panelRouters.users.userNewPost);

//user edit
router.get('/users/edit',panelRouters.users.userEdit);
router.get('/users/person',panelRouters.users.person);

//user remove
router.post('/users/remove',panelRouters.users.userRemove);

//upload avatar
router.post('/users/upload/:username',multipartMiddlewareAvatar,panelRouters.users.uploadAvatar);

//update profile
router.post('/users/edit',panelRouters.users.updateProfile);

//groups
router.get('/groups',panelRouters.users.groups);

//groups new
router.get('/groups/new',panelRouters.users.groupsNew);
router.post('/groups/new',panelRouters.users.groupsNewPost);

//groups edit
router.get('/groups/edit',panelRouters.users.groupsEdit);
router.post('/groups/edit',panelRouters.users.groupsEditPost);

//groups remove
router.post('/groups/remove',panelRouters.users.groupsRemove);

//styles
router.get('/styles',panelRouters.styles.styles);
router.get('/styles/setdefault',panelRouters.styles.setdefault);
router.get('/styles/canceldefault',panelRouters.styles.canceldefault);
router.get('/styles/new',panelRouters.styles.new);
router.post('/styles/new',panelRouters.styles.post);
router.get('/styles/complete',panelRouters.styles.complete);
router.get('/styles/edit',panelRouters.styles.edit);
router.post('/styles/edit',panelRouters.styles.editPost);
router.post('/styles/remove',panelRouters.styles.remove);
router.get('/styles/share',panelRouters.styles.share);
router.get('/styles/center',panelRouters.styles.center);
router.post('/styles/center/get',panelRouters.styles.get);

//extensions
router.get('/extensions',panelRouters.extensions.extensions);
router.get('/extensions/view',panelRouters.extensions.view);
router.get('/extensions/set',panelRouters.extensions.set);
router.post('/extensions/remove',panelRouters.extensions.remove);
router.get('/extensions/actions',panelRouters.extensions.actions);
router.post('/extensions/actions',panelRouters.extensions.actionsPost);
router.post('/extensions/upload/:guid',multipartMiddlewareTemp,panelRouters.extensions.upload);
router.get('/extensions/center',panelRouters.extensions.center);
router.post('/extensions/center/add',panelRouters.extensions.add);

//logout
router.get('/logout',require(`${__dirname}/admin/login`).logout);

module.exports = router;
