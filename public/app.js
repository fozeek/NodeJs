var http = require('http');
var upload = require('../library/upload');
var express = require('express');
//var template = require('../templates');

var app = express();

app.set('views', '../templates');
app.set('view engine', 'jade');

app.get('/', function(req, res){
    res.render('index');
});

var server = app.listen(3000);