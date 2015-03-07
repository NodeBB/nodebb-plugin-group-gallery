"use strict";

(function(window) {

	$(window).on('action:ajaxify.end', function(event, data) {
		var groupName = ajaxify.variables.get('group_name');
		if (groupName && groupName.length) {
			GroupGallery.init(utils.slugify(groupName));
		}
	});

	var GroupGallery = {};

	GroupGallery.vars = {
		page: '',
		groupName: null,
		groupImages: null,
		indexLookup: {},
		idLookup: [],
		lightboxImages: null,
		lightboxOptions: {
			index: 0,
			tpl: null,
			mouseWheel: false,
			helpers: {
				title: null
			}
		}
	};

	GroupGallery.init = function(groupName, callback) {
		var self = this;

		function load() {
			self.vars.page = ajaxify.variables.get('group_gallery_page') || 'group';

			if (self.vars.page === 'group' && !self.vars.lightboxOptions.tpl) {
				loadTemplate();
				return;
			}

			if (self.vars.page !== 'overview' && (groupName !== self.vars.groupName || !self.vars.groupImages)) {
				self.vars.groupName = groupName;
				loadImages();
				return;
			}

			self.bindEvents();
			self.checkPage();

			if (callback) callback();
		}

		function loadTemplate() {
			templates.parse('group-gallery/modal/wrap', {}, function(wrapHtml) {
				self.vars.lightboxOptions.tpl = {
					wrap: wrapHtml
				};
				load();
			});
		}

		function loadImages() {
			if (!self.vars.groupName) {
				self.vars.groupImages = [];
				return;
			}

			$.ajax({
				url: '/api/groups/' + self.vars.groupName + '/gallery',
				success: function(result) {
					self.addImages(result.images);
				},
				error: function() {
					self.vars.groupImages = [];
				},
				complete: function() {
					load();
				}
			});
		}

		load();
	};

	GroupGallery.addImages = function(images) {
		if (!Array.isArray(this.vars.groupImages)) {
			this.vars.groupImages = [];
		}

		this.vars.groupImages = this.vars.groupImages.concat(images);
		this.indexImages();
	};

	GroupGallery.indexImages = function() {
		var self = this;

		this.vars.indexLookup = {};
		this.vars.idLookup = [];
		this.vars.lightboxImages = this.vars.groupImages.map(function(el, index) {
			self.vars.indexLookup[el.id] = index;
			self.vars.idLookup[index] = el.id;
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
			var index = GroupGallery.vars.indexLookup[image[0].id];

			if (parseInt(image[0].uid, 10) === parseInt(app.uid, 10)) {
				GroupGallery.modal.openOnIndex(index);
			} else if ($.fancybox.current !== null) {
				$.fancybox.current.group.push(GroupGallery.vars.lightboxImages[index]);
			}
		});

		var clickEvent = 'click.group-gallery';
		$(document.body)
			.off(clickEvent, '[data-func="group-gallery.modal.open"]')
			.off(clickEvent, '[data-func="group-gallery.upload"]')
			.on(clickEvent, '[data-func="group-gallery.modal.open"]', GroupGallery.modal.open)
			.on(clickEvent, '[data-func="group-gallery.upload"]', GroupGallery.uploader.open);
	};

	GroupGallery.checkPage = function() {
		if (this.vars.page && this.vars.page.length && this[this.page]) {
			this[this.page].init();
		}
	};

	window.GroupGallery = GroupGallery;

})(window);