"use strict";

(function(GroupGallery) {

	var socketEvents = {
			removeImage: 'event:group-gallery.removeImage'
		},

		Modal = {};

	Modal.open = function(event) {
		var el = $(event.currentTarget),
			id = el.data('group-gallery-id'),
			index = parseInt(GroupGallery.vars.indexLookup[id], 10);

		Modal.openOnIndex(index);

		event.preventDefault();
		return false;
	};

	Modal.openOnIndex = function(index) {
		GroupGallery.vars.lightboxOptions.index = isNaN(index) || index < 0 ? 0 : index;
		GroupGallery.vars.lightboxOptions.beforeShow = beforeShow;
		GroupGallery.vars.lightboxOptions.afterShow = afterShow;
		GroupGallery.vars.lightboxOptions.beforeClose = beforeClose;
		$.fancybox(GroupGallery.vars.lightboxImages, GroupGallery.vars.lightboxOptions);
	};

	function beforeShow() {
		GroupGallery.comments.clear();
	}

	function afterShow() {
		var id = parseInt(GroupGallery.vars.idLookup[this.index], 10);
		if (!isNaN(id)) {
			var _setDimension = $.fancybox._setDimension;
			$.fancybox._setDimension = function() {
				_setDimension();
				GroupGallery.comments.load(id);
				$.fancybox._setDimension = _setDimension;
			};

			unbindEvents.apply(this);
			bindEvents.apply(this, [id]);
		}
	}

	function beforeClose() {
		unbindEvents.apply(this);
	}

	function removeImage(id) {
		if (!isNaN(id)) {
			socket.emit('plugins.group-gallery.removeImage', {imageId: id});
		}
	}

	function bindEvents(id) {
		var removeImageButton = $('[data-func="group-gallery.remove"]'),
			self = this;

		if (parseInt(GroupGallery.vars.groupImages[this.index].uid, 10) === parseInt(app.user.uid, 10) || app.user.isAdmin) {
			removeImageButton.removeClass('hidden');
		} else {
			removeImageButton.addClass('hidden');
		}

        removeImageButton.on('click.group-gallery', function(e) {
            removeImage.apply(self, [id]);

            e.preventDefault();
            return false;
        });

		socket.on(socketEvents.removeImage, function(imageId) {
			var index = GroupGallery.vars.indexLookup[parseInt(imageId, 10)];

			if (!isNaN(index)) {
				// Remove image from the image list, reindex them
				GroupGallery.vars.groupImages.splice(index, 1);
				GroupGallery.indexImages();
				self.group.splice(index, 1);

				if (parseInt(imageId, 10) === id) {
					if (self.group.length < 1) {
						$.fancybox.close();
					} else {
						// We also removed it from the fancybox list, so the same index will be the next image
						$.fancybox.jumpto(index);
					}
				}
			}
		});

		GroupGallery.comments.bindEvents();
	}

	function unbindEvents() {
		var	removeImageButton = $('[data-func="group-gallery.remove"]');

		removeImageButton.off('click.group-gallery');

		socket.off(socketEvents.removeImage);

		GroupGallery.comments.unbindEvents();
	}

	GroupGallery.modal = Modal;

})(GroupGallery);