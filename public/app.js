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

app.get('/test', function(req, res){
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
    blob = req.params[0];
    res.render('file', {file: blob});
});
app.get('/nodes/:hash/download/*', function(req, res){
    var storage = new Storage(req.params.hash);
    storage.download(req.params[0], function(file, tmp){
        res.download(file, function() {
            if(tmp) fs.unlink(file);
        });
    });
});

var server = app.listen(3000);