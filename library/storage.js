var fs = require('graceful-fs');
var mkdirp = require('mkdirp');
var pathManager = require('path');

function storage(path) {
    this.path = path;
}

storage.prototype = {
    write: function(file, content) {
        var path = pathManager.dirname(file);
        var file = this.path + '/' + file;
        var that = this;
        fs.exists(this.path + '/' +  path, function(exists) {
            if(!exists) {
                that.mkdir(path, function() {
                    fs.writeFile(file, content, "UTF-8", function(err) {
                        if (err) console.error(err);
                    });
                });
            }
        });
    },
    remove: function(path) {
        var path = this.path + '/' +  path;
        fs.exists(path, function(exists) {
            if(exists) {
                fs.unlink(path);
            }
        });
    },
    mkdir: function(path, cb) {
        var path = this.path + '/' +  path;
        fs.exists(path, function(exists) {
            if(!exists) {
                mkdirp(path, function(err) {
                    if (err) console.error(err);
                    if(cb) {
                        cb();
                    }
                });
            }
        });
    },
    rmdir: function(path) {
        var path = this.path + '/' +  path;
        fs.exists(path, function(exists) {
            if(exists) {
                fs.rmdir(path, function(err) {
                    if (err) console.error(err);
                });
            }
        });
    },
    list: function(cb) {
        var path = this.path;
        fs.readdir(path, function(err, files) {
            if (err) {
                console.error(err);
                if(cb) cb([]);
            }
            else {
                stats = files.map(function(file){
                    return {name: file, stats: fs.lstatSync(path + '/' + file)};
                });
                if(cb) cb(stats);
            }
        });
    }
};


module.exports = storage;