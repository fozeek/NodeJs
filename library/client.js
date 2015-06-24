var Storage = require('./storage');

function client(pseudo) {
    this.storage = new Storage('storage/' + pseudo);
}

client.prototype = {
    getStorage: function() {
        return this.storage;
    }
};

module.exports = client;