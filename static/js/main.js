"use strict";

(function(window) {

	$(window).on('action:ajaxify.end', function(event, data) {
		var groupName = ajaxify.variables.get('group_name');
		if (groupName) {
			GroupGallery.init(groupName);
		}
	});

	var GroupGallery = {
		groupName: null,
		groupImages: null,
		indexLookup: {},
		idLookup: [],
		lightboxImages: null,
		lightboxOptions: {
			index: 0,
			tpl: null,
			fitToView: false,
			helpers: {
				title: null
			}
		}
	};

	GroupGallery.init = function(groupName, callback) {
		var self = this;

		function load() {
			if (!self.lightboxOptions.tpl) {
				loadTemplate();
				return;
			}

			if (groupName !== self.groupName || !self.groupImages) {
				self.groupName = groupName;
				loadImages();
				return;
			}

			self.bindEvents();

			if (callback) callback();
		}

		function loadTemplate() {
			templates.parse('group-gallery/modal/wrap', {}, function(wrapHtml) {
				self.lightboxOptions.tpl = {
					wrap: wrapHtml
				};
				load();
			});
		}

		function loadImages() {
			if (!self.groupName) {
				self.groupImages = [];
				return;
			}

			$.ajax({
				url: '/api/groups/' + self.groupName + '/images',
				success: function(result) {
					self.addImages(result.images);
				},
				error: function() {
					self.groupImages = [];
				},
				complete: function() {
					load();
				}
			});
		}

		load();
	};

	GroupGallery.addImages = function(images) {
		var self = this;

		if (!Array.isArray(this.groupImages)) {
			this.groupImages = [];
		}

		this.groupImages = this.groupImages.concat(images);
		this.lightboxImages = this.groupImages.map(function(el, index) {
			self.indexLookup[el.id] = index;
			self.idLookup[index] = el.id;
			return {
				href: el.url,
				title: ''
			};
		});
	};

	GroupGallery.bindEvents = function() {
		var event = 'event:group-gallery.newImage';
		socket.off(event).on(event, function(image) {
			// Image is an array of length one
			GroupGallery.addImages(image);
			var index = GroupGallery.indexLookup[image[0].id];

			if (parseInt(image[0].uid, 10) === parseInt(app.uid, 10)) {
				GroupGallery.modal.openOnIndex(index);
			} else if ($.fancybox.current !== null) {
				$.fancybox.current.group.push(GroupGallery.lightboxImages[index]);
			}
		});

		var clickEvent = 'click.group-gallery';
		$(document.body)
			.off(clickEvent, '[data-func="group-gallery.modal.open"]')
			.off(clickEvent, '[data-func="group-gallery.upload"]')
			.on(clickEvent, '[data-func="group-gallery.modal.open"]', GroupGallery.modal.open)
			.on(clickEvent, '[data-func="group-gallery.upload"]', GroupGallery.uploader.open);
	};

	window.GroupGallery = GroupGallery;

})(window);