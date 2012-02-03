#!/usr/bin/node

var http = require('http');
var fs = require('fs');
var path = require('path');

http.createServer(function (request, response) {

    var filePath = '.' + request.url;
    var q = filePath.indexOf('?');
    if(q>=0) filePath = filePath.substring(0,q);
    if(filePath.endethWith('/')) filePath += 'index.html';

    path.exists(filePath, function(exists){

        if(exists){
            fs.readFile(filePath, function(error, content) {
                if(!error){
                    response.writeHead(200, { 'Content-Type': contentType(filePath) });
                    response.end(content, 'utf-8');
                    console.log('200 '+filePath);
                }
                else{
                    response.writeHead(500);
                    response.end();
                    console.log('500 '+filePath);
                }
            });
        }
        else{
            response.writeHead(404);
            response.end();
            console.log('404 '+filePath);
        }
    });

}).listen(8080, "127.0.0.1");

function contentType(filePath){
    return filePath.endethWith('.html')? 'text/html':
           filePath.endethWith('.js')?   'application/javascript':
           filePath.endethWith('.css')?  'text/css':
           filePath.endethWith('.json')? 'application/json':
                                         'text/plain';
}

String.prototype.startethWith = function(str){ return this.slice(0, str.length)==str; };
String.prototype.endethWith   = function(str){ return this.slice(  -str.length)==str; };

