exports.hook_rcpt = function(next, connection, params) {
  var rcpt = params[0];
  if (!rcpt.host) return next();

  var domain = rcpt.host.toLowerCase();
  var hosts = connection.server.notes.hosts;

  connection.logdebug(JSON.stringify(hosts));

  if(hosts.indexOf(domain) < 0)
    return next(DENY, "We don't deliver mail for this domain");

  connection.logdebug(this, "Found host in hostlist, " + domain);
  next();
};