"use strict";

var NodeBB = require('./nodebb'),
	User = NodeBB.User,
	Plugins = NodeBB.Plugins,
	db = NodeBB.db,

	async = require('async'),

	Comments = {};

Comments.addComment = function(imageId, uid, content, callback) {
	db.incrObjectField('group-gallery', 'nextCommentId', function(err, nextCommentId) {
		if (err) {
			callback(err);
		} else {
			var comment = {
				id: nextCommentId,
				image: imageId,
				uid: uid,
				content: content,
				deleted: 0,
				timestamp: Date.now()
			};

			async.parallel([
				function(next) {
					db.setObject('group-gallery:comment:' + nextCommentId, comment, next);
				},
				function(next) {
					db.sortedSetAdd('group-gallery:images:' + imageId + ':comments', comment.timestamp, nextCommentId, next)
				}
			], function(err) {
				if (err) {
					callback(err);
				} else {
					getComments([nextCommentId], function(err, comments) {
						callback(err, comments);
					});
				}
			});
		}
	});
};

Comments.getComments = function(imageId, start, end, callback) {
	db.getSortedSetRange('group-gallery:images:' + imageId + ':comments', start, end, function(err, ids) {
		if (err || !ids || !ids.length) {
			return callback(err, []);
		}

		getComments(ids, callback);
	});
};

Comments.getRawComments = function(ids, callback) {
	var keys = ids.map(function(id) {
		return 'group-gallery:comment:' + id;
	});

	db.getObjects(keys, callback);
};

function getComments(ids, callback) {
	var keys = ids.map(function(id) {
		return 'group-gallery:comment:' + id;
	});

	db.getObjects(keys, function(err, comments) {
		if (err) {
			callback(err);
			return;
		}

		var userData, uids = comments.map(function(c) {
			return parseInt(c.deleted, 10) !== 1 ? parseInt(c.uid, 10) : null;
		}).filter(function(u, index, self) {
			return u === null ? false : self.indexOf(u) === index;
		});

		User.getMultipleUserFields(uids, ['uid', 'username', 'userslug', 'picture'], function(err, usersData) {
			if (err) {
				return callback(err);
			}

			comments = comments.map(function (comment, index) {
				comment.id = ids[index];
				return comment;
			});

			async.map(comments, function(comment, next) {
				if (parseInt(comment.deleted, 10) === 1) {
					next();
					return;
				}

				userData = usersData[uids.indexOf(parseInt(comment.uid))];

				Comments.parse(comment.content, userData, function(err, s) {
					comment.user = s.user;
					comment.content = s.content;

					next(null, comment);
				});
			}, function(err, comments) {
				async.filter(comments, function(item, next) {
					next(!!item);
				}, function(result) {
					callback(err, result);
				});
			});
		});
	});
}

Comments.parse = function(message, userData, callback) {
	Plugins.fireHook('filter:parse.raw', message, function(err, parsed) {
		callback(null, {
			user: userData,
			content: parsed
		});
	});
};

Comments.removeComment = function(uid, commentId, callback) {
	async.parallel({
		comment: function(next) {
			db.getObject('group-gallery:comment:' + commentId, next);
		},
		isAdmin: function(next) {
			User.isAdministrator(uid, next);
		}
	}, function(err, result) {
		if (err) {
			callback(err);
			return;
		}

		if (parseInt(result.comment.uid, 10) === parseInt(uid, 10) || result.isAdmin) {
			db.setObjectField('group-gallery:comment:' + commentId, 'deleted', 1, callback);
		} else {
			callback(new Error('unauthorized'));
		}
	});
};

Comments.editComment = function(uid, commentId, content, callback) {
	async.parallel({
		comment: function(next) {
			db.getObject('group-gallery:comment:' + commentId, next);
		},
		isAdmin: function(next) {
			User.isAdministrator(uid, next);
		}
	}, function(err, result) {
		if (err) {
			callback(err);
			return;
		}

		if (parseInt(result.comment.uit, 10) === parseInt(uid, 10) || result.isAdmin) {
			db.setObjectField('group-gallery:comment:' + commentId, 'content', content, function(err) {
				getComments([commentId], callback);
			});
		} else {
			callback(new Error('unauthorized'));
		}
	})
};

module.exports = Comments;