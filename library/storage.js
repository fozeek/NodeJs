function storage(path) {

    var path = path;
    console.log(path);

    return {
        upload: function(file) {
            console.log("create file " + file);
        },
        remove: function(file) {
            console.log("remove file " + file);
        },
        mkdir: function(folder) {
            console.log("mkdir " + folder);
        },
        rmdir: function(folder) {
            console.log("rmdir " + folder);
        },
    }
}

module.exports = storage;