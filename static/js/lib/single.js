"use strict";

(function(GroupGallery) {

	var Single = {},
		currentImageId;

	Single.init = function() {
		var imageId = parseInt(ajaxify.variables.get('image_id'), 10);
		if (!isNaN(imageId)) {
			if (currentImageId !== imageId) {
				GroupGallery.comments.clear();
				GroupGallery.comments.unbindEvents();
				unbindEvents();
			}

			GroupGallery.comments.load(imageId);
			GroupGallery.comments.bindEvents();
			currentImageId = imageId;

			bindEvents();
		}
	};

	function bindEvents() {
		var removeImageButton = $('[data-func="group-gallery.remove"]');

		if (parseInt(ajaxify.variables.get('image_uid'), 10) === parseInt(app.user.uid, 10) || app.user.isAdmin) {
			removeImageButton.removeClass('hidden');
		} else {
			removeImageButton.addClass('hidden');
		}

		removeImageButton.on('click.group-gallery', function(e) {
			removeImage(currentImageId);

			e.preventDefault();
			return false;
		});

		socket.on('event:group-gallery.removeImage', function(imageId) {
			if (parseInt(imageId, 10) === currentImageId) {
				ajaxify.go('groups/' + ajaxify.variables.get('group_slug') + '/gallery');
			}
		});
	}

	function unbindEvents() {
		var	removeImageButton = $('[data-func="group-gallery.remove"]');

		removeImageButton.off('click.group-gallery');

		socket.off('event:group-gallery.removeImage');
	}

	function removeImage(id) {
		if (!isNaN(id)) {
			socket.emit('plugins.group-gallery.removeImage', {imageId: id});
		}
	}

	GroupGallery.single = Single;

})(GroupGallery);