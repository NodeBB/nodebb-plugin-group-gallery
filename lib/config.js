"use strict";

var packageInfo = require('../package.json'),
	pluginInfo = require('../plugin.json'),
	pluginId = pluginInfo.id.replace('nodebb-plugin-', ''),

	NodeBB = require('./nodebb'),
	Settings = NodeBB.Settings,

	Config = {};

var adminDefaults = {};

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

Config.global = new Settings(Config.plugin.id, Config.plugin.version, adminDefaults);

module.exports = Config;