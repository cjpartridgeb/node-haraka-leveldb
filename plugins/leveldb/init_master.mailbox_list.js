exports.hook_init_master = function(next, server) {

  var completed = 0;
  var level = server.notes.level;
  var hosts = server.notes.hosts;
  var mailboxes = server.notes.mailboxes = {};

  for(var i=0; i<hosts.length; i++) {
    var host = hosts[i];
    mailboxes[host] = [];

    var stream = level
      .sublevel('mailboxes:' + hosts[i])
      .createKeyStream();

    stream.on('data', streamData(host));
    stream.on('end', streamEnd);
  }

  function streamData(host) {
    return function(mailbox) {
      mailboxes[host].push(mailbox);
    };
  }

  function streamEnd() {
    if(++completed === hosts.length) {
      server.logdebug(JSON.stringify(mailboxes));
      next();
    }
  }
};