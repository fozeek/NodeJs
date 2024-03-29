var fs = require('graceful-fs');
var mkdirp = require('mkdirp');
var pathManager = require('path');
var mime = require('mime');
var easyzip = require('easy-zip');
var targz = require('tar.gz');
var rmdir = require('rimraf');

function storage(name) {
    this.path = 'storage/' + name;
    this.fullPath = this.path;
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
    getUrl: function() {
        return '/' + this.name;
    },
    getPath: function() {
        return this.path;
    },
    getFullPath: function() {
        return this.fullPath;
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
    remove: function(path, cb) {
        var fullpath = this.path + '/' +  path;
        var stats = fs.lstatSync(fullpath);
        if(stats.isFile()) {
            this.unlink(path, cb);
        } else {
            this.rmdir(path, cb);
        }
    },
    unlink: function(path, cb) {
        var fullpath = this.path + '/' +  path;
        fs.exists(fullpath, function(exists) {
            if(exists) {
                fs.unlink(fullpath);
                cb();
            }
        });
    },
    rmdir: function(path, cb) {
        var fullPath = this.path + '/' +  path;
        fs.exists(fullPath, function(exists) {
            if(exists) {
                rmdir(fullPath, function(err) {
                    if (err) console.error(err);
                    else cb();
                });
            }
        });
    },
    mkdir: function(path, cb) {
        var fullpath = this.path + '/' +  path;
        fs.exists(fullpath, function(exists) {
            if(!exists) {
                mkdirp(fullpath, function(err) {
                    if (err) console.error(err);
                    if(cb) {
                        cb(false);
                    }
                });
            } else {
                cb("The folder allready exists !");
            }
        });
    },
    list: function(blob, cb) {
        this.fullPath += '/' + blob;
        var pathToCheck = this.name + blob;
        var url = '/' + this.name + '/';
        var urlDownload = '/d/' + this.name + '/';
        var urlRemove = '/r/' + this.name + '/';
        var path = this.path;
        if(cb == undefined) {
            cb = blob;
            blob = '';
        } else {
            path += '/' + blob;
        }
        
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
                    var filePath = url + blob + '/' + file;
                    var fileDownloadPath = urlDownload + blob + '/' + file;
                    var fileRemovePath = urlRemove + blob + '/' + file;
                    return {
                        name: file,
                        stats: stats,
                        mime: mimeclass,
                        url: filePath.replace('//', '/'),
                        urlDl: fileDownloadPath.replace('//', '/'),
                        urlRm: fileRemovePath.replace('//', '/')
                    };
                });
                var paths = files.map(function(path) {
                    return pathToCheck + '/' + path;
                });
                if(cb) cb(stats, paths);
            }
        });
    },
    download: function(blob, cb) {
        var storage = 'storage/' + this.name + blob;
        var stat = fs.lstatSync(storage);
        var that = this;
        if(stat.isFile()) {
            cb(storage, false);
        } else if(stat.isDirectory()) {
            // var zip = new easyzip.EasyZip();
            // zip.zipFolder(storage, function(){
            //     var tmp = 'tmp/'+ that.generate(20) + '.zip';
            //     zip.writeToFile(tmp, function() {
            //         cb(tmp, true);
            //     });
            // });
            var tmp = 'tmp/'+ that.generate(20) + '.tar.gz';
            var compress = new targz().compress(storage, tmp, function(err){
                cb(tmp, true);
            });
        }
    }, 
    generate: function(nbcar) {
        var ListeCar = new Array("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9");
        var Chaine ='';
        for(i = 0; i < nbcar; i++)
        {
            Chaine = Chaine + ListeCar[Math.floor(Math.random()*ListeCar.length)];
        }
        return Chaine;
    }
};


module.exports = storage;