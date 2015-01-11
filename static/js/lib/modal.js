"use strict";

(function(GroupGallery) {

	var Modal = {};

	Modal.open = function(params) {
		if (!params || !params.groupName) {
			return;
		}

		var groupName = params.groupName,
			id = params.id || 0;
	};

	GroupGallery.modal = Modal;

})(GroupGallery);