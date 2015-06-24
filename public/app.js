var http = require('http');
var express = require('express');
var Client = require('../library/client');

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

var server = app.listen(3000);