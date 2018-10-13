'use strict';
module.exports = function(app) {
  var ytApi = require('../controllers/ytapiController');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Routes
  app.route('/songs')
    .get(ytApi.makeThings);

};