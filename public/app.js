var http = require('http');
var express = require('express');
var Client = require('../library/client');
var Storage = require('../library/storage');
var fs = require('graceful-fs');
var easyzip = require('easy-zip');
var mkdirp = require('mkdirp');


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
    var storage = new Storage('storage/' + req.params.hash, req.params.hash);
    storage.list(function(files) {
        res.render('list', {storage: storage, files: files, path:req.originalUrl});
    });
});
app.get('/nodes/:hash/blob/*', function(req, res){
    blob = req.params[0];
    res.render('file', {file: blob});
});
app.get('/nodes/:hash/download/*', function(req, res){
    blob = req.params[0];
    var stat = fs.lstatSync('storage/' + req.params.hash + '/' + blob);
    if(stat.isFile()) {
        res.download('storage/' + req.params.hash + '/' + blob);
    } else if(stat.isDirectory()) {
        var zip = new easyzip.EasyZip();
        var path = 'storage/' + req.params.hash + '/' + blob;
        zip.zipFolder(path, function(){
            var folder = 'tmp/' + req.params.hash + '/';
            fs.exists(folder, function(exists) {
                console.log(exists);
                if(!exists) {
                    mkdirp(folder, function(err) {
                        if (err) console.error(err);
                        zip.writeToFile('tmp/' + req.params.hash + '/' + blob + '.zip', function() {
                            res.download('tmp/' + req.params.hash + '/' + blob + '.zip');
                        });
                    });
                } else {
                    zip.writeToFile('tmp/' + req.params.hash + '/' + blob + '.zip', function() {
                        res.download('tmp/' + req.params.hash + '/' + blob + '.zip');
                    });
                }
            });
        });
    }
});

var server = app.listen(3000);