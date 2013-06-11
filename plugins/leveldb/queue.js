var buffers = require('buffers');

exports.hook_queue = function(next, connection) {

	var inserts = [];
	var level = connection.server.notes.level;
	var body = connection.transaction.body;
	var recipients = connection.notes.recipients;
	var attachments = connection.notes.attachments;
	var headers = body.header.headers_decoded;

	var bodies = getBodies(body.children);
	if(body.ct && body.bodytext) {
		var body_headers = {'content-type': [body.ct]};
		bodies.push({body: body.bodytext, headers: body_headers});
	}

	var message = {
		to: headers['to'] ? headers['to'][0] : null,
		from: headers['from'] ? headers['from'][0] : null,
		subject: headers['subject'] ? headers['subject'][0] : null,
		headers: headers
	};

	for(var i=0; i<recipients.length; i++) {

		var host = recipients[i].host;
		var mailbox = recipients[i].mailbox;
		var prefix = level.sublevel('mailbox:' + host + ':' + mailbox);

		inserts.push({
			type: 'put',
			key: connection.uuid,
			value: message,
			prefix: prefix
		});
	}

	level.batch(inserts, function(err) {
		if(err) return next(err);
		return next(OK);
	});
};

function getBodies(children, parent) {
	var result = [];

  children.forEach(function(child) {

    var data = {
      body: child.bodytext,
      headers: child.header.headers_decoded
    };

    if(child.children.length > 0) {
			data.children = [];
			getBodies(child.children, data);
		}
		
		if(!data.body && !child.children && !child.children.length) return;
		if(parent) return parent.children.push(data);
		result.push(data);
  });

	return result;
}

exports.hook_data = function(next, connection) {
	connection.transaction.parse_body = 1;
	connection.notes.attachments = [];
	connection.transaction.attachment_hooks(onAttachment(connection));
 	next();
}

function onAttachment(connection) {
	var transaction = connection.transaction;
	var notes = connection.notes;

	return function(content_type, filename, body, stream) {
		var start = new Date().getTime();
		var attachment = {};
		var bufs = buffers();
	
		attachment.filename = filename;
		attachment.content_type = content_type;

		stream.on('data', function(data) {
			bufs.push(data);
		});

		stream.on('end', function() {
			var b = bufs.toBuffer();
			attachment.data = b.toString('base64');
  		notes.attachments.push(attachment);
		});
	};
}
