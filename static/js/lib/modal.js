"use strict";

(function(GroupGallery) {

	var Modal = {};

	Modal.open = function(event) {
		var el = $(event.currentTarget),
			id = el.data('group-gallery-id'),
			index = parseInt(GroupGallery.indexLookup[id], 10);

		if (!isNaN(index) && index > -1) {
			GroupGallery.lightboxOptions.index = index;
			GroupGallery.lightboxOptions.beforeLoad = beforeLoad;
			GroupGallery.lightboxOptions.afterLoad = afterLoad;
			$.fancybox(GroupGallery.groupImages, GroupGallery.lightboxOptions);
		}

		event.preventDefault();
		return false;
	};

	Modal.loadComments = function() {
		var id = parseInt(GroupGallery.idLookup[this.current], 10);

		if (!isNaN(id)) {
			// Load comments
		}
	};

	Modal.clearComments = function() {
		$('.group-gallery-comments').html('');
	};

	function beforeLoad() {
		Modal.clearComments();
	}

	function afterLoad() {
		Modal.loadComments();
	}

	GroupGallery.modal = Modal;

})(GroupGallery);