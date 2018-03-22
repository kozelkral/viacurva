var express = require('express');
var path = require('path');
var server = express();

var publicPath = path.join(__dirname, '..', 'public');

// assets
server.use(express.static(publicPath));

// root
server.get('/', function(req, res) {
    res.sendFile(publicPath + '/html/index.html');
});

// 404 errors
server.use(function(req, res) {
    res.status(404).send("404: Whoops, You're headed for a dead end!");
});
// 500 errors
server.use(function(req, res) {
    res.status(500).send("500: Sorry, we must have messed something up!");
});

server.listen(3333, 'localhost', function() {
    console.log('Listening on port 3333');
});
