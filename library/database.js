var mongo = require('mongodb');
var monk = require('monk');

function database(name) {
    this.db = monk("localhost/"+name);
    //this.db.get('User').drop();

    // this.db.get('Ressource').find({}, function(e, users){
    //     console.log(users);
    // });
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
    createRessource: function(path, pseudo) {
        this.db.get('Ressource').insert({path:path, creator:pseudo, download:0});
    },
    getChild: function(paths, cb) {
        this.db.get('Ressource').find({path: { $regex: '^' + path } }, function(e, users){
            cb(users);
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
    getCreator: function(cb){
        this.db.get('Creator').find({}, {}, function(e, creators){
            cb(creators);
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
    }
}

module.exports = database;