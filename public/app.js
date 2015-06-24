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

app.set('views', 'templates');

app.set('view engine', 'ejs');

//var parser = require('bodyParser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());

//Acces aux objets statiques
//app.use(express.static(path.join(__dirname, 'views')));

app.get('/', function(req, res){
    res.render('index.ejs');
});

app.get('/:user', function(req, res){
    var user = new Client(req.params.user);
    user.getStorage().list(function(files) {
        res.render('account', {user: user, files: files, path:req.originalUrl});
    });
});

app.get('/d/:hash', function(req, res){
    var hash = new Storage(req.params.hash);
    user.getStorage().list(function(files) {
        res.render('account', {user: user, files: files, path:req.originalUrl});
    });
});

app.get('/', function(req, res){
    var user = req.params.user;
    res.download('path/to/file.pdf');
});

var server = app.listen(3000);