var mongo = require('mongodb');
var monk = require('monk');

function database(name) {
    this.db = monk("node.dev/"+name);
    //this.db.get('User').drop();

    // this.db.get('User').find({}, function(e, users){
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
    updateRessource: function(path) {

    },
    getRessource: function(path, cb) {
        this.db.get('Ressource').find({path:path}, function(e, docs){
            cb(docs);
        });
    }
}

module.exports = database;