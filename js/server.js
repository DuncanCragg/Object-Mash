#!/usr/bin/node

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

var mimeTypes={
    '.html': 'text/html',
    '.jpeg': 'image/jpeg',
    '.jpg':  'image/jpeg',
    '.ico':  'image/x-icon',
    '.png':  'image/png',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.css':  'text/css'
};

http.createServer(function(req, res) {
    if(req.method !== 'GET'){
        res.writeHead(400);
        res.end();
        console.log('400 '+req.method);
        return;
    }
    var filename = path.join(process.cwd(), url.parse(req.url).pathname);
    var q = filename.indexOf('?');
    if(q>=0) filename = filename.substring(0,q);
    if(filename.endethWith('/')) filename += 'index.html';

    path.exists(filename, function(exists){
        if(!exists) {
            res.writeHead(404);
            res.end();
            console.log('404 '+filename);
            return;
        }
        var mimeType = mimeTypes[path.extname(filename)];
        if(!mimeType) mimeType='text/plain';
        res.writeHead(200, { 'Content-Type': mimeType });

        var fileStream = fs.createReadStream(filename);
        fileStream.setEncoding('utf-8');
        fileStream.on('error', function(){
            res.writeHead(500);
            res.end();
            console.log('500 '+filename);
        });
        fileStream.pipe(res);
        console.log('200 '+filename);
    });

}).listen(8080);

String.prototype.startethWith = function(str){ return this.slice(0, str.length)==str; };
String.prototype.endethWith   = function(str){ return this.slice(  -str.length)==str; };

