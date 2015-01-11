"use strict";

var NodeBB = require('./nodebb'),
	Groups = NodeBB.Groups,
	db = NodeBB.db,

	async = require('async'),

	Gallery = {};

Gallery.addImage = function(params, callback) {
	if (!params || !params.groupName || !params.url || !params.uid) {
		return callback(new Error('invalid-data'));
	}

	var groupName = params.groupName,
		dbNamespace = 'groups:' + groupName;

	db.incrObjectField(dbNamespace + ':gallery', 'nextImageId', function(err, nextImageId) {
		var image = {
			id: nextImageId,
			uid: params.uid,
			url: params.url,
			timestamp: Date.now()
		};

		async.parallel([
			function(next) {
				db.setObject(dbNamespace + ':images:' + nextImageId, image, next);
			},
			function(next) {
				db.sortedSetAdd(dbNamespace + ':images', image.timestamp, nextImageId, next);
			}
		], function(err) {
			callback(err, nextImageId);
		});
	});
};

Gallery.getImagesByGroupName = function(params, callback) {
	if (!params || !params.groupName) {
		return callback(new Error('invalid-data'), []);
	}

	var groupName = params.groupName,
		dbNamespace = 'groups:' + groupName,
		start = parseInt(params.start, 10),
		end = parseInt(params.end, 10);

	Groups.exists(groupName, function(err, exists) {
		if (err || !exists) {
			return callback(err, []);
		}

		db.getSortedSetRange(dbNamespace + ':images',
			isNaN(start) ? 0 : start, isNaN(end) ? 20 : end, function(err, ids) {
				if (err) {
					return callback(err, []);
				}

				getImages(groupName, ids, callback);
			}
		);
	});
};

function getImages(groupName, ids, callback) {
	var keys = ids.map(function(id) {
		return 'groups:' + groupName + ':images:' + id;
	});

	db.getObjects(keys, callback);
}

module.exports = Gallery;