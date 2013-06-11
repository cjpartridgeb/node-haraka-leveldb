exports.hook_init_master = function(next, server) {
  var level = server.notes.level;

  var hosts = level.sublevel('hosts');
  var stream = hosts.createKeyStream();

  if(!server.notes.hosts)
    server.notes.hosts = [];

  stream.on('error', next);
  stream.on('data', function(key) {
    server.logdebug('GOT DATA', key);
    server.notes.hosts.push(key);
  });
  stream.on('end', next);
};