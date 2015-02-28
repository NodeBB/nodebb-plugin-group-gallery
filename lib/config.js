"use strict";

var packageInfo = require('../package.json'),
	pluginInfo = require('../plugin.json'),
	pluginId = pluginInfo.id.replace('nodebb-plugin-', ''),

	NodeBB = require('./nodebb'),
	Settings = NodeBB.Settings,

	Config = {};

var adminDefaults = {
	version: ''
};

Config.plugin = {
	name: pluginInfo.name,
	description: pluginInfo.description,
	id: pluginId,
	version: packageInfo.version,
	icon: 'fa-picture-o'
};

Config.adminSockets = {
	sync: function() {
		Config.global.sync();
	}
};

Config.init = function(callback) {
	Config.global = new NodeBB.Settings(Config.plugin.id, Config.plugin.version, adminDefaults, function() {
		var oldVersion = Config.global.get('version');

		if (oldVersion < Config.plugin.version || true) {
			Config.global.set('version', Config.plugin.version);
			Config.global.persist(function() {
				require('./upgrade').doUpgrade(oldVersion, Config.plugin.version, callback);
			});
		} else {
			callback();
		}
	});
};

Config.global = {};

module.exports = Config;