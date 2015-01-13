"use strict";

var NodeBB = require('./nodebb'),

	Comments = require('./comments'),
	Gallery = require('./gallery'),

	async = require('async'),
	S = require('string'),

	Sockets = {};

Sockets.getComments = function(socket, data, callback) {
	if (socket.uid === 0 || !data || isNaN(parseInt(data.imageId, 10))) {
		callback(new Error('invalid-data'), []);
		return;
	}

	var start = 0, end = -1;
	Comments.getComments(data.imageId, start, end, callback);
};

Sockets.addComment = function(socket, data, callback) {
	if (socket.uid === 0 || !data || isNaN(parseInt(data.imageId, 10))) {
		callback(new Error('invalid-data'));
		return;
	}

	var comment = S(data.comment).stripTags().trim().s;
	if (comment.length) {
		async.waterfall([
			function(next) {
				Gallery.getImagesByIds([data.imageId], next);
			},
			function(image, next) {
				NodeBB.Groups.isMember(socket.uid, image.group, next);
			},
			function(isMember, next) {
				Comments.addComment(data.imageId, socket.uid, comment, next);
			}
		], function(err, result) {
			if (err) {
				callback(err);
				return;
			}

			NodeBB.SocketIndex.server.sockets.emit('event:group-gallery.newComment', result);
			callback(null, result);
		});
	}
};

Sockets.removeComment = function(socket, data, callback) {
	if (socket.uid === 0 || !data || isNaN(parseInt(data.commentId, 10))) {
		callback(new Error('invalid-data'));
		return;
	}

	Comments.removeComment(socket.uid, data.commentId, function(err, result) {
		if (err) {
			callback(err);
			return;
		}

		NodeBB.SocketIndex.server.sockets.emit('event:group-gallery.removeComment', data.commentId);
		callback(null, true);
	});
};

Sockets.editComment = function(socket, data, callback) {
	if (socket.uid === 0 || !data || isNaN(parseInt(data.commentId, 10)) || !data.content) {
		callback(new Error('invalid-data'));
		return;
	}

	Comments.editComment(socket.uid, data.commentId, data.content, function(err, result) {
		if (err) {
			callback(err);
			return;
		}

		NodeBB.SocketIndex.server.sockets.emit('event:group-gallery.editComment', result);
		callback(null, true);
	});
};

Sockets.getRawComment = function(socket, data, callback) {
	if (socket.uid === 0 || !data || isNaN(parseInt(data.commentId, 10))) {
		callback(new Error('invalid-data'));
		return;
	}

	Comments.getRawComments([data.commentId], callback);
};

module.exports = Sockets;