var fs = require('graceful-fs');
var rmdir = require('rimraf');

function cron(path, ttl, repeat) {
    function run() {
        var now = Date.now();
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
    }

    setInterval(run, repeat);
}

module.exports = cron;