#!/usr/bin/env node

const express = require('express');
const path = require('path');
const server = express();

const publicPath = path.join(__dirname, '..', 'public');

// assets
server.use(express.static(publicPath));

// root
server.get('/', function(req, res) {
    res.sendFile(publicPath + '/html/index.html');
});

// dev
server.get('/dev', function(req, res) {
    res.sendFile(publicPath + '/html/dev.html');
});

// Blackjack
server.get('/blackjack', function(req, res) {
    res.sendFile(publicPath + '/html/blackjack.html');
});

// 404 errors
server.use(function(req, res, next) {
    res.status(404).sendFile(publicPath + '/html/404.html');
});
// 500 errors
server.use(function(err, req, res, next) {
    res.status(500).sendFile(publicPath + '/html/500.html');
});

server.listen(3333, 'localhost', function() {
    console.log('Listening on port 3333');
});
