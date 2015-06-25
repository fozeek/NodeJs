var http = require('http');
var express = require('express');
var Client = require('../library/client');
var Storage = require('../library/storage');
var Database = require('../library/database');
var fs = require('graceful-fs');
var rmdir = require('rimraf');
var multer  = require('multer');
var parser = require('body-parser');
var path = require('path');
var session = require('express-session');

//var users = db.get('User');
//users.insert({pseudo:"musha", password:"test"});

var app = express();
app.use(parser.urlencoded({extended:true})); 
app.use(parser.json());
app.use(session({
    secret: 'muusha'
}));
//app.use(express.bodyParser());
//Acces aux objets statiques
app.use(express.static(path.join(__dirname, '../static')));

app.set('views', 'templates');
app.set('view engine', 'ejs');

app.use(function(req,res,next){
    req.db = new Database('db');
    next();
});
app.use(multer({ dest: './storage/',
    rename: function (fieldname, filename) {
        return filename;
    },
    // onFileUploadStart: function (file) {
    //     console.log(file.originalname + ' is starting ...')
    // },
    // onFileUploadComplete: function (file) {
    //     console.log(file.fieldname + ' uploaded to  ' + file.path)
    //     done=true;
    // },
    changeDest: function(dest, req, res) {
        return dest + req._parsedUrl.pathname.replace('/nodes/', '').replace('blob/', '')+ '/';
    }
}));

app.get('/', function(req, res){
    res.render('index', {message:false});
});

app.route('/')
    .get(function(req, res){
        res.render('index', {message:false});
    })
    .post(function(req, res){  
        if (req.body.pseudo != "" && req.body.password != "") {
            var db = req.db;
            db.getUser(req.body.pseudo, req.body.password, function(users){
                if (users.length == 1) {
                    req.session.user = users[0];
                    res.redirect('/nodes');
                } else {
                    var message = 'Utilisateur incorrect.';
                    res.render('index', {message:message});
                } 
            });
        } else {
            message = 'Veuillez remplir les champs.';
            res.render('index', {message:message});
        }
    }); 

app.route('/signin')
    .get(function(req, res){
        res.render('inscription', {message:false});
    })
    .post(function(req, res){
        var db = req.db; 
        var message;

        if (req.body.pseudo != "" && req.body.password != "" && req.body.check != "") {
            if (req.body.password == req.body.check) {
                var send = db.getUser(req.body.pseudo, req.body.password, function(users){
                    if (users.length == 0) {
                        db.addUser(req.body.pseudo, req.body.password);
                        res.redirect('/');
                    } else {
                        message = 'Le pseudo est déjà utilisé.';
                        res.render('inscription', {message:message});
                    } 
                });

                if(send == false){
                    message = 'Le pseudo est déjà utilisé.';
                    res.render('inscription', {message:message});
                }
            } else {
                message = 'Les mots de passe ne sont pas identiques.';
                res.render('inscription', {message:message});
            }
        } else {
            message = 'Veuillez remplir les champs.';
            res.render('inscription', {message:message});
        }
    });

app.get('/nodes', function(req, res){
    console.log(req.session.user);
    fs.readdir('storage/', function(err, folders) {
        if (err) {
            console.error(err);
            if(cb) cb([]);
        }
        else {
            var directories = folders.map(function(folder){
                var stats = fs.lstatSync('storage/' + folder);
                var long = Date.now() - stats.ctime.getTime();
                var time = {
                    hours: Math.floor(long/3600000),
                    minutes: Math.floor((long/60000)%60),
                    secondes: Math.floor((long/1000)%60)
                };
                return {
                    name: folder,
                    stats: stats,
                    url: '/nodes/' + folder + '/blob/',
                    time: time,
                    urlDl: '/nodes/' + folder + '/download/',
                };
            });
            res.render('directories', {directories: directories});
        }
    });
});
app.get('/nodes/:hash', function(req, res){
    var storage = new Storage(req.params.hash);
    storage.list(function(files) {
        res.render('list', {storage: storage, files: files, path:req.originalUrl});
    });
});

app.all('/nodes/:hash/blob/*', function(req, res){
    var blob = req.params[0].replace('nodes/' + req.params.hash + '/blob/', '');
    var path = 'storage/' + req.params.hash + '/' + blob;
    var stats = fs.lstatSync(path);
    var storage = new Storage(req.params.hash);

    var render = function() {
        var url = '/nodes/' + req.params.hash + '/blob/';
        var breadcrumbs = blob.split('/').map(function(name) {
            url += '/' + name;
            return {
                name: name,
                url: url.replace('//', '/')
            }
        });
        if(stats.isFile()) {
            fs.readFile(path, "utf8", function(err, data) {
                if (err) console.error(err);
                else res.render('file', {storage: storage, data: data, breadcrumbs: breadcrumbs});
            })
        } else {
            storage.list(blob, function(files) {
                res.render('list', {storage: storage, files: files, breadcrumbs: breadcrumbs});
            });
        }
    }

    // POST new folder
    if(req.body.name != undefined) {
        storage.mkdir(blob + '/' + req.body.name, render);
    } else {
        render();
    }
});

app.get('/nodes/:hash/download/*', function(req, res){
    var blob = req.params[0].replace("nodes/" + req.params.hash + "/download/", '');
    var storage = new Storage(req.params.hash);
    storage.download(blob, function(file, tmp){
        res.download(file, function() {
            if(tmp) fs.unlink(file);
        });
    });
});

var server = app.listen(3000);

setInterval(cron, 60000);

// Cron de suppression des dossiers
function cron() {
    var path = 'storage/';
    var now = Date.now();
    var ttl = 3600000;
    fs.readdir(path, function(err, folders) {
        if (err) {
            console.error(err);
            if(cb) cb([]);
        }
        else {
            stats = folders.forEach(function(folder){
                var stats = fs.lstatSync(path + folder);
                if(now - stats.ctime.getTime() > ttl) {
                    rmdir(path + folder, function(err) {
                        if (err) console.error(err);
                    });
                }
            });
        }
    });
};

