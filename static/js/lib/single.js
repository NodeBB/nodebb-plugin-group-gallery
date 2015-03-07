"use strict";

(function(GroupGallery) {

	var Single = {},
		currentImageId;

	Single.init = function() {
		console.log('Single init');
		var imageId = parseInt(ajaxify.variables.get('image_id'), 10);
		if (!isNaN(imageId)) {
			if (currentImageId !== imageId) {
				GroupGallery.comments.clear();
				GroupGallery.comments.unbindEvents();
			}

			GroupGallery.comments.load(imageId);
			GroupGallery.comments.bindEvents();
			currentImageId = imageId;
		}
	};

	GroupGallery.single = Single;

})(GroupGallery);