"use strict";

var NodeBB = require('./nodebb'),
	db = NodeBB.db,

	async = require('async'),

	Gallery = {};

Gallery.addImage = function(params, callback) {
	if (!params || !params.group || !params.url || !params.uid) {
		callback(new Error('invalid-data'));
	} else {
		db.incrObjectField('group-gallery', 'nextImageId', function(err, nextImageId) {
			var image = {
				id: nextImageId,
				group: params.group,
				uid: params.uid,
				url: params.url,
				timestamp: Date.now()
			};

			async.parallel([
				function(next) {
					db.setObject('group-gallery:images:' + nextImageId, image, next);
				},
				function(next) {
					db.sortedSetAdd('group-gallery:group:' + params.group, image.timestamp, nextImageId, next);
				}
			], function(err) {
				callback(err, nextImageId);
			});
		});
	}
};

Gallery.getImagesByGroupName = function(params, callback) {
	if (!params || !params.group) {
		callback(new Error('invalid-data'), []);
	} else {
		var groupName = params.group,
			start = parseInt(params.start, 10),
			end = parseInt(params.end, 10);

		db.getSortedSetRange('group-gallery:group:' + groupName,
			isNaN(start) ? 0 : start, isNaN(end) ? 20 : end, function(err, ids) {
				if (err) {
					callback(err, []);
				} else {
					getImages(ids, callback);
				}
			}
		);
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

module.exports = Gallery;