"use strict";

var NodeBB = require('./lib/nodebb'),
	UploadsController = NodeBB.UploadsController,
	ControllerHelpers = NodeBB.ControllerHelpers,

	Config = require('./lib/config'),
	Gallery = require('./lib/gallery'),

	async = require('async'),

	GroupGallery = {},
	app;

GroupGallery.init = function(params, callback) {
	var router = params.router,
		middleware = params.middleware,
		multipartMiddleware = require('connect-multiparty')();

	router.get('/groups/:name/gallery', middleware.checkGlobalPrivacySettings, middleware.buildHeader,
		groupExists, renderImages);
	router.get('/groups/:name/gallery/:image_id', middleware.checkGlobalPrivacySettings, middleware.buildHeader,
		groupExists, increaseViewCount, renderSingleImage);
	router.get('/api/groups/:name/gallery', middleware.checkGlobalPrivacySettings,
		groupExists, renderImages);
	router.get('/api/groups/:name/gallery/:image_id', middleware.checkGlobalPrivacySettings,
		groupExists, increaseViewCount, renderSingleImage);

	router.post('/groups/:name/images/upload', multipartMiddleware, middleware.applyCSRF,
		middleware.authenticate, middleware.checkGlobalPrivacySettings, groupExists, uploadImage);

	NodeBB.SocketAdmin[Config.plugin.id] = Config.adminSockets;
	NodeBB.SocketPlugins[Config.plugin.id] = require('./lib/sockets');

	app = params.app;

	Config.init(callback);
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
			Gallery.getImagesByGroupName(groupName, 0, 2, function(err, images) {
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
	var imagesPerPage = 4;

	async.waterfall([
		function(next) {
			Gallery.getGroupImageCount(req.params.name, next);
		},
		function(imageCount, next) {
			var pageCount = Math.max(1, Math.ceil(imageCount / imagesPerPage));

			if (req.query.page < 1 || req.query.page > pageCount) {
				return ControllerHelpers.notFound(req, res);
			}

			var page = parseInt(req.query.page, 10) || 1;
			var start = (page - 1) * imagesPerPage,
				end = start + imagesPerPage - 1;

			async.parallel({
				images: function(next) {
					Gallery.getImagesByGroupName(req.params.name, start, end, next);
				},
				group: function(next) {
					NodeBB.Groups.getGroupNameByGroupSlug(req.params.name, function(err, groupName) {
						NodeBB.Groups.get(groupName, {}, next);
					});
				}
			}, function(err, results) {
				next(err, {
					pageCount: pageCount,
					currentPage: page,
					images: results.images,
					group: results.group
				});
			});
		}
	], function(err, data) {
		data.pagination = NodeBB.Pagination.create(data.currentPage, data.pageCount);
		res.render('group-gallery/gallery', data);
	});
}

function renderSingleImage(req, res, next) {
	var id = parseInt(req.params.image_id, 10);
	if (isNaN(id)) {
		next(new Error('invalid-image'));
	} else {
		async.parallel({
			image: function(next) {
				Gallery.getImagesByIds([id], next);
			},
			group: function(next) {
				NodeBB.Groups.getGroupNameByGroupSlug(req.params.name, function(err, groupName) {
					NodeBB.Groups.get(groupName, {}, next);
				});
			}
		}, function(err, result) {
			if (err || !result.image.length) {
				next(new Error('invalid-image'));
			} else {
				result.image = result.image[0];
				res.render('group-gallery/single', result);
			}
		});
	}
}

function increaseViewCount(req, res, next) {
	var id = parseInt(req.params.image_id, 10);
	if (isNaN(id)) {
		next(new Error('invalid-image'));
	} else {
		Gallery.increaseViewCount(id, function(err, result) {
			next();
		});
	}
}

function uploadImage(req, res, next) {
	UploadsController.upload(req, res, function(file, next) {
		var params = JSON.parse(req.body.params);
		if (params && params.caption && params.caption.length && NodeBB.Plugins.hasListeners('filter:uploadImage')) {
			NodeBB.Plugins.fireHook('filter:uploadImage', {image: file, uid: req.user.uid}, function(err, data) {
				if (err) {
					return next(err);
				}

				Gallery.addImage({
					uid: req.user.uid,
					url: data.url,
					group: req.params.name,
					caption: params.caption
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
	NodeBB.Groups.exists(req.params.name, function(err, exists) {
		if (err || !exists) {
			ControllerHelpers.notFound(req, res);
		} else {
			next();
		}
	});
}

module.exports = GroupGallery;