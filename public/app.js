var http = require('http');
var express = require('express');
var Client = require('../library/client');
var Storage = require('../library/storage');
var fs = require('graceful-fs');


//Access DB
var mongo = require('mongodb');
var monk = require('monk');
var db = monk("localhost:27017/db");

var app = express();

app.set('views', 'templates');

app.set('view engine', 'ejs');

//var parser = require('bodyParser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());

//Acces aux objets statiques
//app.use(express.static(path.join(__dirname, 'views')));

//var collection = db.get("User");

app.use(function(req,res,next){
    req.db = db;
    next();
});

app.get('/', function(req, res){
    res.render('index.ejs');
});

app.post('/account', function(req, res){
    var db = req.db;
    var collection = db.get('User');
    collection.find({},{},function(e,docs){
        res.render('test.ejs', {
            "userlist" : docs
        });
    });
});

app.get('/nodes', function(req, res){
    var user = new Client(req.params.user);
    user.getStorage().list(function(files) {
        res.render('account', {user: user, files: files, path:req.originalUrl});
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
    if(stats.isFile()) {
        fs.readFile(path, "utf8", function(err, data) {
            if (err) console.error(err);
            else res.render('file', {storage: storage, data: data});
        })
    } else {
        console.log('lol');
        storage.list(blob, function(files) {
            res.render('list', {storage: storage, files: files});
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