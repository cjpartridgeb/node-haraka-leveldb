exports.hook_rcpt = function(next, connection, params) {
  var rcpt = params[0];
  if(!rcpt.host) return next();
	if(!rcpt.user) return next();

	var notes = connection.notes;
  var host = rcpt.host.toLowerCase();
	var mailbox = rcpt.user.toLowerCase();
	var mailboxes = connection.server.notes.mailboxes;

	if(!notes.recipients)
		notes.recipients = [];

	if(!mailboxes[host])
		return next();

 	if(mailboxes[host].indexOf(mailbox) < 0)
		return next();

	notes.recipients.push({
		host: host,
		mailbox: mailbox
	});

	next(OK);
}

