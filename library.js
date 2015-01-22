"use strict";

var NodeBB = require('./lib/nodebb'),
	Groups = NodeBB.Groups,
	Plugins = NodeBB.Plugins,
	UploadsController = NodeBB.UploadsController,
	ControllerHelpers = NodeBB.ControllerHelpers,

	Config = require('./lib/config'),
	Gallery = require('./lib/gallery'),

	GroupGallery = {},
	app;

GroupGallery.init = function(params, callback) {
	var router = params.router,
		middleware = params.middleware,
		multipartMiddleware = require('connect-multiparty')();

	router.get('/api/groups/:name/images', middleware.checkGlobalPrivacySettings, groupExists, renderImages);
	router.post('/groups/:name/images/upload', multipartMiddleware, middleware.applyCSRF,
		middleware.authenticate, middleware.checkGlobalPrivacySettings, groupExists, uploadImage);

	NodeBB.SocketAdmin[Config.plugin.id] = Config.adminSockets;
	NodeBB.SocketPlugins[Config.plugin.id] = require('./lib/sockets');

	app = params.app;

	callback();
};

GroupGallery.defineWidget = function(widgets, callback) {
	widgets.push({
		name: Config.plugin.name,
		widget: Config.plugin.id,
		description: Config.plugin.description,
		content: ''
	});

	callback(null, widgets);
};

GroupGallery.renderWidget = function(widget, callback) {
	if (widget.area.template.indexOf('groups') === 0) {
		var parts = decodeURIComponent(widget.area.url).split('/');
		if (Array.isArray(parts) && parts.length) {
			// I have been assured by baris and julian that this is solid enough.
			var groupName = parts[parts.length - 1];
			Gallery.getImagesByGroupName(groupName, 0, 10, function(err, images) {
				app.render('group-gallery/widget', {images: images}, callback);
			});
		} else {
			callback(null, '<div class="alert alert-warning">An error occurred trying to render this widget.</div>');
		}
	} else {
		NodeBB.User.isAdministrator(widget.uid, function(err, isAdmin) {
			var html = '';
			if (isAdmin) {
				html = '<div class="alert alert-warning">The Group Gallery widget only works on group pages. <br><a href="/admin/extend/widgets">&#187; Widget settings</a></a></div>';
			}

			callback(null, html);
		});
	}
};

GroupGallery.groupRename = function(data) {
	Gallery.renameGroup(data.old, data.new);
};

function renderImages(req, res, next) {
	Gallery.getImagesByGroupName(req.params.name, 0, -1, function(err, images) {
		res.render('group-gallery/page', {
			images: images
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
					group: req.params.name
				}, function(err, image) {
					NodeBB.SocketIndex.server.sockets.emit('event:group-gallery.newImage', image);
					next(err, data);
				});
			});
		} else {
			next(new Error('no-upload-plugin'))
		}
	}, next);
}

function groupExists(req, res, next) {
	Groups.exists(req.params.name, function(err, exists) {
		if (err || !exists) {
			ControllerHelpers.notFound(req, res);
		} else {
			next();
		}
	});
}

module.exports = GroupGallery;