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


var routes = require('./routes');

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

// On créer les routes
routes(app);

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

