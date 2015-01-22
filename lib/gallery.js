"use strict";

var NodeBB = require('./nodebb'),
	db = NodeBB.db,
    utils = NodeBB.utils,

	async = require('async'),

	Gallery = {};

Gallery.addImage = function(params, callback) {
	if (!params || !params.group || !params.url || !params.uid) {
		callback(new Error('invalid-data'));
	} else {
        var groupSlug = utils.slugify(params.group);
		db.incrObjectField('group-gallery', 'nextImageId', function(err, nextImageId) {
			var image = {
				id: nextImageId,
				group: groupSlug,
				uid: params.uid,
				url: params.url,
				timestamp: Date.now()
			};

			async.parallel([
				function(next) {
					db.setObject('group-gallery:images:' + nextImageId, image, next);
				},
				function(next) {
					db.sortedSetAdd('group-gallery:group:' + groupSlug, image.timestamp, nextImageId, next);
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
			db.getObject('group-gallery:images:' + imageId, next);
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
					db.delete('group-gallery:images:' + imageId, next);
				},
				function(next) {
					db.sortedSetRemove('group-gallery:group:' + result.image.group, imageId, next);
				}
			], callback);
		}
	});
};

Gallery.getImagesByGroupName = function(group, start, end, callback) {
	if (!group) {
		callback(new Error('invalid-data'), []);
	} else {
        group = utils.slugify(group);
		start = parseInt(start, 10);
		end = parseInt(end, 10);

		db.getSortedSetRange('group-gallery:group:' + group,
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
	});

	db.getObjects(keys, function(err, result) {
		if (err) {
			callback(err, []);
		} else {
			callback(null, result);
		}
	});
}

Gallery.renameGroup = function(oldName, newName) {
	db.rename('group-gallery:group:' + utils.slugify(oldName), 'group-gallery:group:' + utils.slugify(newName));
};

module.exports = Gallery;