var http = require('http');
var express = require('express');
var Client = require('../library/client');

var app = express();

var client1 = new Client('fozeek');

var client2 = new Client('muusha');
// client2.getStorage().mkdir('lolilol');
// client2.getStorage().mkdir('lolilol/1');
// client2.getStorage().rmdir('lolilol/1');
client2.getStorage().write('lolilol/2/monfichier.txt', 'COUCOUCOUCOUC');
// client2.getStorage().write('lolilol/2/monfichier2.txt', 'COUCOUCOUCOUC33333');
// client2.getStorage().write('lolilol/2/monfichier3.txt', 'COUCOUCOUCOUC5555555');
// client2.getStorage().remove('lolilol/2/monfichier3.txt');
client1.getStorage().write('mon/path/monfichier.txt', 'ANNNH');

app.set('views', '../templates');
app.set('view engine', 'jade');

app.get('/', function(req, res){
    res.render('index');
});

var server = app.listen(3000);