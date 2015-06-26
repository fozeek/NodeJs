var mongo = require('mongodb');
var monk = require('monk');

function database(name) {
    this.db = monk("localhost/"+name);
}

database.prototype = {
    getUser: function(pseudo, password, cb) {
        this.db.get('User').find({pseudo:pseudo, password:password}, function(e, users){
            cb(users);
        });
    },
    addUser: function(name, pwd) {
        this.db.get('User').insert({pseudo:name, password:pwd});
    },
    createRessource: function(path, pseudo, type) {
        this.db.get('Ressource').insert({path:path, creator:pseudo, download:0, type:type});
    },

    getChild: function(paths, cb) {
        this.db.get('Ressource').find({path: { $regex: '^' + path } }, function(e, users){
            cb(users);
        }); 
    },
    getAllChild: function(cb) {
        this.db.get('Ressource').find({}, {}, function(e, docs){
            var result = [];
            var tmp = docs;
            docs.forEach(function(value){
                if (value.type == "repo") {
                    var repo = value.path;
                    var nbFiles = 0;
                    tmp.forEach(function(line){
                        var regex = new RegExp('^'+repo+'\/');
                        //console.log(regex);
                        if(line.path.match(regex)){
                            nbFiles += 1;
                        }
                    });
                    result.push({name:value.path, nbFile:nbFiles});
                }
            });

            cb(result);
        });
    },
    updateRessource: function(path) {
        var db = this.db;
        this.getRessource(path, function(docs){
            var dl = docs[0].download+1;
            db.get('Ressource').update({path:path}, { $set: {download:dl} });
        })  
    },
    getRessource: function(path, cb) {
        this.db.get('Ressource').find({path:path}, function(e, docs){
            cb(docs);
        });
    },
    deleteRessource: function(path) {
        this.db.get('Ressource').remove({path:path});
    },
    getRessources: function(paths, cb){
        this.db.get('Ressource').find({path: {$in: paths}}, function(e, docs){
            cb(docs);
        });
    },
    getCreator: function(cb) {
        this.db.get('Creator').find({}, {}, function(e, creators){
            cb(creators);
        });
    },
    getStats: function(cb) {
        this.db.get('Ressource').find({}, {}, function(e, ressources){
            var nbRepo = 0;
            var nbFiles = 0;
            var nbDownload = 0;

            ressources.forEach(function(value){
                if(value.type == "repo"){
                    nbRepo += 1;
                    nbDownload = nbDownload + value.download;
                } else if(value.type == "file") {
                    nbFiles += 1;
                }
            });

            cb(nbRepo, nbFiles, nbDownload);
        });
    },
    dbFill: function(){
        this.addUser('musha', 'test');
        this.db.get('Creator').insert({firstname:'Jonathan', name:'BICHEUX', photo:'jonathan.jpeg'});
        this.db.get('Creator').insert({firstname:'Quentin', name:'DENEUVE', photo:'quentin.jpeg'});
    },
    resetBase: function(){
        this.db.get('User').drop();
        this.db.get('Ressource').drop();
        this.db.get('Creator').drop();
    },
    printContent: function(collection) {
        this.db.get(collection).find({}, function(e, users){
            console.log(users);
        });
    }
}

module.exports = database;