var fs = require('graceful-fs');
var mkdirp = require('mkdirp');
var pathManager = require('path');
var mime = require('mime');
var easyzip = require('easy-zip');

function storage(name) {
    this.path = 'storage/' + name;
    this.name = name;
}

storage.type = {
    // '': 'file-archive-o',
    // '': 'file-audio-o',
    'text/css': 'file-code-o',
    'text/csv': 'file-code-o',
    'text/html': 'file-code-o',
    'text/javascript': 'file-code-o',
    'text/xml': 'file-code-o',
    // '': 'file-excel-o',
    'image/gif': 'file-image-o',
    'image/jpeg': 'file-image-o',
    'image/png': 'file-image-o',
    'image/tiff': 'file-image-o',
    'image/vnd.microsoft.icon': 'file-image-o',
    // '': 'file-movie-o (alias)',
    // '': 'file-o',
    'application/pdf': 'file-pdf-o',
    // '': 'file-photo-o (alias)',
    // '': 'file-picture-o (alias)',
    // '': 'file-powerpoint-o',
    'audio/mpeg': 'file-sound-o (alias)',
    'audio/x-ms-wma': 'file-sound-o (alias)',
    'audio/vnd.rn-realaudio': 'file-sound-o (alias)',
    'audio/x-wav': 'file-sound-o (alias)',
    'text/plain': 'file-text',
    'video/mpeg': 'file-video-o',
    'video/mp4': 'file-video-o',
    'video/quicktime': 'file-video-o',
    'video/x-ms-wmv': 'file-video-o',
    'video/x-msvideo': 'file-video-o',
    'video/x-flv': 'file-video-o',
    'video/webm ': 'file-video-o',
    // '': 'file-word-o',
    'application/zip': 'file-zip-o (alias)',
    default: 'file'
};

storage.prototype = {
    getName: function() {
        return this.name;
    },
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
                    var type = mime.lookup(path + '/' + file);
                    if(storage.type[type] != undefined) mimeclass = storage.type[type];
                    else mimeclass = storage.type['default'];
                    var stats = fs.lstatSync(path + '/' + file);
                    if(stats.isDirectory()) {
                        mimeclass = 'folder';
                    }
                    return {
                        name: file,
                        stats: stats,
                        mime: mimeclass
                    };
                });
                if(cb) cb(stats);
            }
        });
    },
    download: function(blob, cb) {
        var storage = 'storage/' + this.name + '/' + blob;
        var stat = fs.lstatSync(storage);
        if(stat.isFile()) {
            cb(storage, false);
        } else if(stat.isDirectory()) {
            var zip = new easyzip.EasyZip();
            zip.zipFolder(storage, function(){
                var folder = 'tmp/' + this.name + '/';
                fs.exists(folder, function(exists) {
                    var tmp = folder + blob + '.zip';
                    if(!exists) {
                        mkdirp(folder, function(err) {
                            if (err) console.error(err);
                            zip.writeToFile(tmp, function() {
                                cb(tmp, true);
                            });
                        });
                    } else {
                        zip.writeToFile(tmp, function() {
                            cb(tmp, true);
                        });
                    }
                });
            });
        }
    }
};


module.exports = storage;