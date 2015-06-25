var http = require('http');
var express = require('express');
var Client = require('../library/client');
var Storage = require('../library/storage');
var Database = require('../library/database');
var fs = require('graceful-fs');
var rmdir = require('rimraf');
var multer  = require('multer');
var parser = require('body-parser');

//Acces aux objets statiques
//app.use(express.static(path.join(__dirname, 'views')));


//var users = db.get('User');
//users.insert({pseudo:"musha", password:"test"});

var app = express();
app.use(parser.urlencoded({extended:true})); 
app.use(parser.json());
//app.use(express.bodyParser());

app.set('views', 'templates');
app.set('view engine', 'ejs');

app.use(function(req,res,next){
    req.db = new Database('db');
    next();
});
app.use(multer({ dest: './storage/',
    changeDest: function(dest, req, res) {
        console.log(dest + req.body.path);
        console.log(req);
        return dest + req.body.path; 
    }
}));

app.post('/upload',function(req,res){
    res.redirect('/nodes');
});

app.get('/', function(req, res){
    res.render('index');
});

app.route('/signin')
    .get(function(req, res){
        res.render('inscription');
    })
    .post(function(req, res){
        var db = req.db; 

        if (req.body.pseudo != "" && req.body.password != "" && req.body.check != "") {
            if (req.body.password == req.body.check) {
                db.addUser(req.body.pseudo, req.body.password);
                res.redirect('/');
            }
        }

        res.redirect('inscription');
    });
// app.post('/nodes', function(req, res){
//     var db = req.db;
//     var user = db.getUser(req.body.pseudo, req.body.password);

//     if (user!="") {
//         var user = new Client(req.params.user);
//         user.getStorage().list(function(files) {
//             res.render('account', {user: user, files: files, path:req.originalUrl});
//         });
//     }
// });

app.get('/nodes', function(req, res){
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

app.get('/nodes/:hash/blob/*', function(req, res){
    var blob = req.params[0].replace('nodes/' + req.params.hash + '/blob/', '');
    var path = 'storage/' + req.params.hash + '/' + blob;
    var stats = fs.lstatSync(path);
    var storage = new Storage(req.params.hash);
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

