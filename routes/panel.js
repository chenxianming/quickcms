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

//login
router.get('/login',require(`${__dirname}/admin/login`).login);

router.post('/login',require(`${__dirname}/admin/login`).loginPost);

//middle ware for login
router.use(require(`${__dirname}/admin/middleware`).login);

//middle ware for roles
router.use(require(`${__dirname}/admin/middleware`).roles);

//middle ware for update dymicRoutes
router.use(require(`${__dirname}/admin/middleware`).updateDymicRoutes);

//index
router.get('/',require(`${__dirname}/admin/index`).panel);
router.get('/avg', (req, res, next) => res.send(os.loadavg()) );


//system
router.get('/system',require(`${__dirname}/admin/system`).system);
router.post('/system',require(`${__dirname}/admin/system`).systemPost);

//contents
router.get('/contents',require(`${__dirname}/admin/contents`).contents);
router.get('/contents/media',require(`${__dirname}/admin/contents`).media);
router.post('/contents/media',require(`${__dirname}/admin/contents`).mediaPost);

//upload
router.post('/contents/media/upload',multipartMiddleware,require(`${__dirname}/admin/contents`).upload);

//getmedia
router.get('/contents/getmedia/:id',require(`${__dirname}/admin/contents`).getMedia);

//remove
router.post('/remove',require(`${__dirname}/admin/contents`).remove);

//edit description
router.post('/editdescription',require(`${__dirname}/admin/contents`).editdescription);

//collections
router.get('/contents/collections',require(`${__dirname}/admin/contents`).collections);

router.get('/contents/collectionsview',require(`${__dirname}/admin/contents`).collectionsview);

//edit detail
router.get('/contents/collectionsdetail',require(`${__dirname}/admin/contents`).collectionsdetail);

//up content
router.post('/contents/up',require(`${__dirname}/admin/contents`).upcontent);

router.get('/contents/postnew',require(`${__dirname}/admin/contents`).postnew);

//recivepostobject
router.post('/contents/postnew',require(`${__dirname}/admin/contents`).recivepostobject);

//update post
router.post('/contents/update',require(`${__dirname}/admin/contents`).updatepost);

//remove collections
router.post('/contents/collections/remove',require(`${__dirname}/admin/contents`).removecollections);

//model
router.get('/contents/model',require(`${__dirname}/admin/contents`).model);

//model new
router.get('/contents/model/new',require(`${__dirname}/admin/contents`).modelnew);
router.post('/contents/model/new',require(`${__dirname}/admin/contents`).modelnewPost);

//model edit
router.get('/contents/model/edit',require(`${__dirname}/admin/contents`).modelEdit);

//model update
router.post('/contents/model/edit',require(`${__dirname}/admin/contents`).modelUpdate);

//model remove
router.get('/contents/model/remove',require(`${__dirname}/admin/contents`).modelRemove);

//model export
router.get('/contents/model/export/:guid',require(`${__dirname}/admin/contents`).modelExport);

//import model
router.post('/contents/model/import',multipartMiddlewareTemp,require(`${__dirname}/admin/contents`).importModel);

//collections new
router.get('/contents/collections/new',require(`${__dirname}/admin/contents`).collectionsNew);
router.post('/contents/collections/new',require(`${__dirname}/admin/contents`).collectionsNewPost);

//edit collection
router.get('/contents/collections/edit',require(`${__dirname}/admin/contents`).editCollection);
router.post('/contents/collections/edit',require(`${__dirname}/admin/contents`).editCollectionPost);

//remove collection
router.post('/contents/collections/removecollection',require(`${__dirname}/admin/contents`).removeCollection);

//categories
router.get('/contents/categories',require(`${__dirname}/admin/contents`).categories);
router.post('/contents/categories',require(`${__dirname}/admin/contents`).categoriesPost);

//comments
router.get('/contents/comments',require(`${__dirname}/admin/contents`).comments);

//comments detail
router.get('/contents/comments/detail',require(`${__dirname}/admin/contents`).commentsDetail);

//comments remove
router.get('/contents/comments/remove',require(`${__dirname}/admin/contents`).commentsRemove);

router.post('/contents/comments/removeall',require(`${__dirname}/admin/contents`).removeall);

//users
router.get('/users',require(`${__dirname}/admin/users`).users);

//user new
router.get('/users/new',require(`${__dirname}/admin/users`).userNew);
router.post('/users/new',require(`${__dirname}/admin/users`).userNewPost);

//user edit
router.get('/users/edit',require(`${__dirname}/admin/users`).userEdit);
router.get('/users/person',require(`${__dirname}/admin/users`).person);

//user remove
router.post('/users/remove',require(`${__dirname}/admin/users`).userRemove);

//upload avatar
router.post('/users/upload/:username',multipartMiddlewareAvatar,require(`${__dirname}/admin/users`).uploadAvatar);

//update profile
router.post('/users/edit',require(`${__dirname}/admin/users`).updateProfile);

//groups
router.get('/groups',require(`${__dirname}/admin/users`).groups);

//groups new
router.get('/groups/new',require(`${__dirname}/admin/users`).groupsNew);
router.post('/groups/new',require(`${__dirname}/admin/users`).groupsNewPost);

//groups edit
router.get('/groups/edit',require(`${__dirname}/admin/users`).groupsEdit);
router.post('/groups/edit',require(`${__dirname}/admin/users`).groupsEditPost);

//groups remove
router.post('/groups/remove',require(`${__dirname}/admin/users`).groupsRemove);

//styles
router.get('/styles',require(`${__dirname}/admin/styles`).styles);
router.get('/styles/setdefault',require(`${__dirname}/admin/styles`).setdefault);
router.get('/styles/canceldefault',require(`${__dirname}/admin/styles`).canceldefault);
router.get('/styles/new',require(`${__dirname}/admin/styles`).new);
router.post('/styles/new',require(`${__dirname}/admin/styles`).post);
router.get('/styles/complete',require(`${__dirname}/admin/styles`).complete);
router.get('/styles/edit',require(`${__dirname}/admin/styles`).edit);
router.post('/styles/edit',require(`${__dirname}/admin/styles`).editPost);
router.post('/styles/remove',require(`${__dirname}/admin/styles`).remove);
router.get('/styles/share',require(`${__dirname}/admin/styles`).share);
router.get('/styles/center',require(`${__dirname}/admin/styles`).center);
router.post('/styles/center/get',require(`${__dirname}/admin/styles`).get);

//extensions
router.get('/extensions',require(`${__dirname}/admin/extensions`).extensions);
router.get('/extensions/view',require(`${__dirname}/admin/extensions`).view);
router.get('/extensions/set',require(`${__dirname}/admin/extensions`).set);
router.post('/extensions/remove',require(`${__dirname}/admin/extensions`).remove);
router.get('/extensions/actions',require(`${__dirname}/admin/extensions`).actions);
router.post('/extensions/actions',require(`${__dirname}/admin/extensions`).actionsPost);
router.post('/extensions/upload/:guid',multipartMiddlewareTemp,require(`${__dirname}/admin/extensions`).upload);
router.get('/extensions/center',require(`${__dirname}/admin/extensions`).center);
router.post('/extensions/center/add',require(`${__dirname}/admin/extensions`).add);

//logout
router.get('/logout',require(`${__dirname}/admin/login`).logout);

module.exports = router;
