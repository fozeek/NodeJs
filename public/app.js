var http = require('http');
var Client = require('../library/client');


var client1 = new Client('fozeek');

var client2 = new Client('muusha');
// client2.getStorage().mkdir('lolilol');
// client2.getStorage().mkdir('lolilol/1');
// client2.getStorage().rmdir('lolilol/1');
client2.getStorage().write('lolilol/2/monfichier.txt', 'COUCOUCOUCOUC');
// client2.getStorage().write('lolilol/2/monfichier2.txt', 'COUCOUCOUCOUC33333');
// client2.getStorage().write('lolilol/2/monfichier3.txt', 'COUCOUCOUCOUC5555555');
// client2.getStorage().remove('lolilol/2/monfichier3.txt');
client1.getStorage().write('mon/path/monfichier.txt', 'ANNNH');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8000, '127.0.0.1');



console.log('Server running at http://127.0.0.1:1337/');