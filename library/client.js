var Storage = require('./storage');

function client(pseudo) {
    this.pseudo = pseudo;
    this.storage = new Storage('storage/' + pseudo);
}

client.prototype = {
    getStorage: function() {
        return this.storage;
    }, 
    getPseudo: function() {
        return this.pseudo;
    }
};

module.exports = client;