"use strict";

(function(window) {

	$(window).on('action:ajaxify.end', function(event, data) {
		// TODO: reliably get the group name
		var results = /^groups\/(\w+)(?:$|\/)/.exec(data.url);
		if (results && results.length > 1) {
			GroupGallery.init(results[1]);
		}
	});

	var GroupGallery = {
		groupName: null,
		groupImages: null,
		indexLookup: [],
		idLookup: [],
		lightboxOptions: {
			index: 0,
			tpl: null,
			helpers: {
				title: null
			}
		}
	};

	GroupGallery.init = function(groupName) {
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

			$('[data-func="modal.open"]').off('click.group-gallery').on('click.group-gallery', GroupGallery.modal.open);
			//console.log('[nodebb-plugin-group-gallery] Successfully loaded with ' + self.groupImages.length + ' images.');
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
					self.groupImages = result.images.map(function(el, index) {
						self.indexLookup[el.id] = index;
						self.idLookup[index] = el.id;
						return {
							href: el.url,
							title: ''
						};
					});
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

	window.GroupGallery = GroupGallery;

})(window);