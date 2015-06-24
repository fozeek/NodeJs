var http = require('http');
var Client = require('../library/client');


var client = new Client('fozeek');
//console.log(File.upload('LAWWWWL'));

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8000, '127.0.0.1');



console.log('Server running at http://127.0.0.1:1337/');