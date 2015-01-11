"use strict";

var NodeBB = require('./lib/nodebb'),
	SocketAdmin = NodeBB.SocketAdmin,
	Groups = NodeBB.Groups,
	Plugins = NodeBB.Plugins,
	UploadsController = NodeBB.UploadsController,
	ControllerHelpers = NodeBB.ControllerHelpers,

	Config = require('./lib/config'),
	Gallery = require('./lib/gallery'),

	GroupGallery = {};

GroupGallery.init = function(params, callback) {
	var app = params.router,
		middleware = params.middleware,
		multipartMiddleware = require('connect-multiparty')();

	app.get('/admin/plugins/' + Config.plugin.id, middleware.admin.buildHeader, renderAdmin);
	app.get('/api/admin/plugins/' + Config.plugin.id, renderAdmin);
	app.get('/api/groups/:name/images', middleware.checkGlobalPrivacySettings, renderImages);
	app.post('/groups/:name/images/upload', multipartMiddleware, middleware.applyCSRF,
		middleware.authenticate, middleware.checkGlobalPrivacySettings, uploadImage);

	SocketAdmin[Config.plugin.id] = Config.adminSockets;

	callback();
};

GroupGallery.addAdminNavigation = function(header, callback) {
	header.plugins.push({
		route: '/plugins/' + Config.plugin.id,
		icon: Config.plugin.icon,
		name: Config.plugin.name
	});

	callback(null, header);
};

function renderAdmin(req, res, next) {
	res.render('admin/plugins/' + Config.plugin.id, {});
}

function renderImages(req, res, next) {
	Groups.exists(req.params.name, function(err, exists) {
		if (err || !exists) {
			return ControllerHelpers.notFound(req, res);
		}

		Gallery.getImagesByGroupName({
			groupName: req.params.name
		}, function(err, images) {
			res.json(JSON.stringify(images));
		});
	});
}

function uploadImage(req, res, next) {
	UploadsController.upload(req, res, function(file, next) {
		if (Plugins.hasListeners('filter:uploadImage')) {
			Plugins.fireHook('filter:uploadImage', {image: file, uid: req.user.uid}, function(err, data) {
				if (err) {
					return next(err);
				}

				Gallery.addImage({
					uid: req.user.uid,
					url: data.url,
					groupName: req.params.name
				}, function(err, id) {
					console.log("Image saved with id " + id);
					next(err, data);
				});
			});
		} else {
			next(new Error('no-upload-plugin'))
		}
	}, next);
}

module.exports = GroupGallery;