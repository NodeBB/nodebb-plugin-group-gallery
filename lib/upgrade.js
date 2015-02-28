"use strict";

var pjson = require('../package.json'),
	async = require('async'),
	NodeBB = require('./nodebb'),

	Upgrade = {};

Upgrade.doUpgrade = function(oldVersion, newVersion, callback) {
	var thisVersion;

	async.series([
		function(next) {
			thisVersion = '0.0.2';

			if (oldVersion < thisVersion) {
				getAllImageIds(function(err, ids) {
					async.each(ids, function(id, next) {
						async.parallel([
							async.apply(NodeBB.db.setObjectField, 'group-gallery:images:' + id, 'caption', '')
						], next);
					}, next);
				});
			} else {
				next();
			}
		}
	], function(err) {
		if (err) {
			error(err);
		} else {
			done();
		}
	});

	function done() {
		NodeBB.winston.info('[' + pjson.name + '] Upgraded from ' + oldVersion + ' to ' + newVersion);
		callback();
	}

	function error(err) {
		NodeBB.winston.error(err);
		NodeBB.winston.info('[' + pjson.name + '] No upgrade performed, old version was ' + oldVersion + ' and new version is ' + newVersion);
		callback();
	}
};

function getAllImages(fields, callback) {
	getAllImageIds(function(err, ids) {
		if (err || !ids || !ids.length) return callback(err);

		var keys = ids.map(function (id) {
			return 'group-gallery:images:' + id;
		});

		NodeBB.db.getObjectsFields(keys, fields, callback);
	});
}

function getAllImageIds(callback) {
	NodeBB.db.getObjectField('group-gallery', 'nextImageId', function(err, result) {
		var list = [];
		for (var i = 1, l = parseInt(result, 10); i <= l; i++) {
			list.push(i);
		}

		callback(err, list);
	});
}

module.exports = Upgrade;