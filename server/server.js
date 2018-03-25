#!/usr/bin/env node

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
    res.status(404).sendFile(publicPath + '/html/404.html');
});
// 500 errors
server.use(function(req, res) {
    res.status(500).sendFile(publicPath + '/html/500.html');
});

server.listen(3333, 'localhost', function() {
    console.log('Listening on port 3333');
});
