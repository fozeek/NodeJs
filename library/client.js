var Storage = require('./storage');

function client(pseudo) {

    this.storage = new Storage('../storage/' + pseudo);

    return {
        getStorage: function() {
            return this.storage
        }
    };
}

module.exports = client;