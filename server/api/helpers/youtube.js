const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');


function exists(filename, cb) {
  fs.access(filename, fs.F_OK, (err) => {
    if (!err) {
      cb(true);
    } else {
      cb(false);
    }
  });
}

function download(url, options = {
  path: 'downloads',
  audioOnly: true
}) {

  return new Promise((resolve, reject) => {
    let format = 'mp4';
    if (options.audioOnly) {
      format = 'mp3';
    }



  var videoReadableStream = ytdl('http://www.youtube.com/watch?v=A02s8omM_hI', { filter: 'audioonly' });

  resolve(videoReadableStream);


  





    // ytdl.getInfo('http://www.youtube.com/watch?v=A02s8omM_hI', function (err, info) {
    //     var videoName = info.title.replace('|', '').toString('ascii');

    //     var videoWritableStream = fs.createWriteStream(videoName + '.mp3');

    //     var stream = videoReadableStream.pipe(videoWritableStream);


    //     stream.on('finish', function () {

    //         resolve(stream);

    //         // res.writeHead(200, {
    //         //     "Content-Type": "application/octet-stream",
    //         //     "Content-Disposition": "attachment; filename=" + videoName
    //         // });
    //         // fs.createReadStream(filePath).pipe(response);

    //         // //  res.end();


    //     });
    // });          








  });

}

module.exports = {
  download
};