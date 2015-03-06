"use strict";

var NodeBB = require('./nodebb'),

	async = require('async'),

	Gallery = {};

Gallery.addImage = function(params, callback) {
	if (!params || !params.group || !params.url || !params.uid) {
		callback(new Error('invalid-data'));
	} else {
		var groupSlug = NodeBB.utils.slugify(params.group);
		NodeBB.db.incrObjectField('group-gallery', 'nextImageId', function(err, nextImageId) {
			var image = {
				id: nextImageId,
				group: groupSlug,
				caption: params.caption || '',
				uid: params.uid,
				url: params.url,
				timestamp: Date.now(),
				viewcount: 0
			};

			async.parallel([
				function(next) {
					NodeBB.db.setObject('group-gallery:images:' + nextImageId, image, next);
				},
				function(next) {
					NodeBB.db.sortedSetAdd('group-gallery:group:' + groupSlug + ':images', image.timestamp, nextImageId, next);
				}
			], function(err, result) {
				getImages([nextImageId], callback);
			});
		});
	}
};

Gallery.removeImage = function(uid, imageId, callback) {
	async.parallel({
		image: function(next) {
			NodeBB.db.getObject('group-gallery:images:' + imageId, next);
		},
		isAdmin: function(next) {
			NodeBB.User.isAdministrator(uid, next);
		}
	}, function(err, result) {
		if (err || !result.image) {
			callback(err);
			return;
		}

		if (parseInt(result.image.uid, 10) === parseInt(uid, 10) || result.isAdmin) {
			async.parallel([
				function(next) {
					NodeBB.db.delete('group-gallery:images:' + imageId, next);
				},
				function(next) {
					NodeBB.db.sortedSetRemove('group-gallery:group:' + result.image.group + ':images', imageId, next);
				}
			], callback);
		}
	});
};

Gallery.getGroupImageCount = function(group, callback) {
	if (!group) {
		callback(new Error('invalid-data'), []);
	} else {
		group = NodeBB.utils.slugify(group);

		NodeBB.db.sortedSetCard('group-gallery:group:' + group + ':images', function(err, result) {
			callback(err, result ? result : 0);
		});
	}
};

Gallery.getImagesByGroupName = function(group, start, end, callback) {
	if (!group) {
		callback(new Error('invalid-data'), []);
	} else {
		group = NodeBB.utils.slugify(group);
		start = parseInt(start, 10);
		end = parseInt(end, 10);

		NodeBB.db.getSortedSetRevRange('group-gallery:group:' + group + ':images',
			isNaN(start) ? 0 : start, isNaN(end) ? -1 : end, function(err, ids) {
				if (err) {
					callback(err, []);
				} else {
					getImages(ids, callback);
				}
			}
		);
	}
};

Gallery.getImagesByIds = function(ids, callback) {
	if (!ids || !Array.isArray(ids)) {
		callback(new Error('invalid-data'), []);
	} else {
		getImages(ids, callback);
	}
};

function getImages(ids, callback) {
	var keys = ids.map(function(id) {
		return 'group-gallery:images:' + id;
	}), userFields = ['uid', 'username', 'userslug'], uids;

	NodeBB.db.getObjects(keys, function(err, images) {
		if (err) {
			callback(err, []);
		} else {
			// Get a list of unique uids of the users
			uids = images.map(function(i) {
				return i.uid;
			}).filter(function(uid, index, self) {
				return self.indexOf(uid) === index;
			});

			NodeBB.User.getMultipleUserFields(uids, userFields, function(err, usersData) {
				if (err) return callback(err, []);

				async.map(images, function(image, next) {
					NodeBB.db.sortedSetCard('group-gallery:images:' + image.id + ':comments', function(err, commentCount) {
						image.author = usersData[uids.indexOf(parseInt(image.uid, 10))];
						image.commentcount = commentCount || 0;
						image.caption = image.caption || 'No caption';

						next(null, image);
					});
				}, callback);
			});
		}
	});
}

Gallery.renameGroup = function(oldName, newName) {
	async.parallel([
		function(next) {
			NodeBB.db.rename(
				'group-gallery:group:' + NodeBB.utils.slugify(oldName) + ':images',
				'group-gallery:group:' + NodeBB.utils.slugify(newName) + ':images',
				next
			);
		},
		function(next) {
			NodeBB.db.rename(
				'group-gallery:group:' + NodeBB.utils.slugify(oldName),
				'group-gallery:group:' + NodeBB.utils.slugify(newName),
				next
			);
		}
	]);

};

Gallery.increaseViewCount = function(id, callback) {
	NodeBB.db.incrObjectField('group-gallery:images:' + id, 'viewcount', callback);
};

module.exports = Gallery;