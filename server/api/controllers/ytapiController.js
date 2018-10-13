'use strict';
const ytdl = require('ytdl-core');
exports.makeThings = function(req, response) {

    const ytlnk = req.query.ytlnk;


    const urlLib = require('url');
    const https = require('https');

   // response.set('Content-Type', 'arraybuffer');
    var videoReadableStream = ytdl(ytlnk, { filter: 'audioonly' }).on('info', (info, format) => {
        var parsed = urlLib.parse(format.url);
        parsed.method = 'HEAD';
        https.request(parsed, (res) => {
            response.setHeader("content-length", res.headers['content-length']);
        }).end();
    })
    .pipe(response);

    videoReadableStream.on('end', response.end);
   
};


