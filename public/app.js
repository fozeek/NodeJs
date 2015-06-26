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
var mkdirp = require('mkdirp');
var mime = require('mime');
var pathManager = require('path');

//var users = db.get('User');
//users.insert({pseudo:"musha", password:"test"});

var app = express();
app.use(parser.urlencoded({extended:true})); 
app.use(parser.json());
app.use(session({
    secret: 'muusha',
    resave: true,
    saveUninitialized: true
}));
//app.use(express.bodyParser());
//Acces aux objets statiques
app.use(express.static(path.join(__dirname, '../static')));

app.set('views', 'templates');
app.set('view engine', 'ejs');

var db = new Database('db');

if(process.argv[2] == '--filldb') {
    console.log('test');
    db.dbFill();
} else if (process.argv[2] == '--resetbase') {
    db.resetBase();
}

db.printContent('Creator');

app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use(multer({ dest: './storage/',
    rename: function (fieldname, filename) {
        return filename;
    },
    // onFileUploadStart: function (file) {
    //     console.log(file.originalname + ' is starting ...')
    // },
    onFileUploadComplete: function (file, req, res) {
        req.db.createRessource(file.path.replace('storage/', ''), req.session.user.pseudo);
    },
    changeDest: function(dest, req, res) {
        return dest + req._parsedUrl.pathname + '/';
    }
}));

app.route('/login')
    .get(function(req, res){
        res.render('index', {message:false});
    })
    .post(function(req, res){  
        if (req.body.pseudo != "" && req.body.password != "") {
            var db = req.db;
            db.getUser(req.body.pseudo, req.body.password, function(users){
                if (users.length == 1) {
                    req.session.user = users[0];
                    res.redirect('/');
                } else {
                    var message = 'Identifiants incorrects.';
                    res.render('index', {message:message});
                } 
            });
        } else {
            message = 'Veuillez remplir les champs.';
            res.render('index', {message:message});
        }
    }); 

app.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
});

app.get('/about', function(req, res){
    req.db.getCreator(function(content){
        res.render('about', {users:content, url:'/img/'});
    });
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

app.all('/', function(req, res){
    var render = function(message) {
        fs.readdir('storage/', function(err, folders) {
            if (err) {
                console.error(err);
            }
            else {
                req.db.getRessources(folders, function(objects) {
                    var directories = folders.map(function(folder){
                        var stats = fs.lstatSync('storage/' + folder);
                        var long = Date.now() - stats.ctime.getTime();
                        var time = {
                            hours: Math.floor(long/3600000),
                            minutes: Math.floor((long/60000)%60),
                            secondes: Math.floor((long/1000)%60)
                        };
                        var db = {};
                        objects.forEach(function(repo) {
                            if(repo.path == folder) {
                                db = repo
                            }
                        });
                        return {
                            name: folder,
                            stats: stats,
                            url: '/' + folder + '/',
                            time: time,
                            urlDl: '/d/' + folder + '/',
                            db: db
                        };
                    });
                    res.render('directories', {directories: directories, user: req.session.user, message: message});
                });
            }
        });
    };

    // POST new folder
    if(req.body.name != undefined) {
        fs.exists('storage/' + req.body.name, function(exists) {
            if(!exists 
                && req.body.name != "img" 
                && req.body.name != "signin"
                 && req.body.name != "login"
                 && req.body.name != "logout"
                 && req.body.name != "d"
                 && req.body.name != "r"
                 && req.body.name != "about"
                 && req.body.name != ""
            ) {
                mkdirp('storage/' + req.body.name, function(err) {
                    if (err) console.error(err);
                    req.db.createRessource(req.body.name, req.session.user.pseudo);
                    render();
                });
            } else {
                render('Repo allready exists !');
            }
        });
    } else {
        render();
    }
});

app.get('/img/*', function (req, res) {
    res.sendFile(pathManager.dirname(__dirname) + '/storage/' +  req.params[0].replace('img/', ''));
});

app.get('/d/:hash*', function(req, res){
    var blob = req.params[0].replace('d/' + req.params.hash, '');
    var storage = new Storage(req.params.hash);
    storage.download(blob, function(file, tmp){
        res.download(file, function() {
            if(tmp) fs.unlink(file);
            req.db.updateRessource(req.params.hash+blob);
            req.db.updateRessource(req.params.hash);
        });
    });
});

app.get('/r/:hash*', function(req, res){
    var blob = req.params[0].replace('d/' + req.params.hash, '');
    var storage = new Storage(req.params.hash);
    storage.remove(blob, function(file, tmp){
        res.redirect('/');
    });
});

app.all('/:hash*', function(req, res){
    var blob = req.params[0].replace(req.params.hash, '');
    var path = 'storage/' + req.params.hash + blob;
    var stats = fs.lstatSync(path);
    var storage = new Storage(req.params.hash);

    var render = function(message) {
        var url = ('/' + req.params.hash).replace('//', '/');
        var breadcrumbs = blob.split('/').filter(function(name) {
            if(name == "") return false;
            else return name;
        }).map(function(name) {
            url += '/' + name;
            return {
                name: name,
                url: url
            }
        });
        if(stats.isFile()) {
            var type = mime.lookup(path);
            fs.readFile(path, "utf8", function(err, data) {
                if (err) console.error(err);
                else res.render('file', {storage: storage, data: data, breadcrumbs: breadcrumbs, stats: stats, mime: type, url: '/img/' + path.replace('storage/', ''), urlDl: '/d/' + path.replace('storage/', '')});
            })
        } else {
            storage.list(blob, function(files, paths) {
                paths.push(req.params.hash+blob) // on ajoute le dossier courant
                req.db.getRessources(paths, function(objects) {
                    var current = {};
                    objects.map(function(o) {
                        if(o.path == req.params.hash+blob) current = o;
                    });
                    var directories = files.map(function(repo) {
                        repo.db = {};
                        objects.forEach(function(object) {
                            if('/' + object.path == repo.url) {
                                repo.db = object;
                            }
                        });
                        return repo;
                    });
                    res.render('list', {storage: storage, files: directories, breadcrumbs: breadcrumbs, user: req.session.user, current: current, message: message});
                });
            });
        }
    }

    // POST new folder
    if(req.body.name != undefined && req.body.name != "") {
        req.db.createRessource(req.params.hash + blob + '/' + req.body.name, req.session.user.pseudo);
        storage.mkdir(blob + '/' + req.body.name, render);
    } else {
        render(false);
    }
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

