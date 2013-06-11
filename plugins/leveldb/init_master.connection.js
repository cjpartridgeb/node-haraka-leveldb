var levelup = require('levelup');
var sublevel = require('level-sublevel');

exports.hook_init_master = function(next, server) {
  var config = this.config.get('leveldb.json', 'json');
  var options = config.options || {};
  levelup(config.location, options, function(err, db) {
    if(err) server.logerror(err);
    if(!err) server.notes.level = sublevel(db);
    next(err);
  });
};