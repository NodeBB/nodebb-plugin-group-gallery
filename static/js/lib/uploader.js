"use strict";

(function(GroupGallery) {

	var Uploader = {},
		uploaderModule = null;

	Uploader.open = function() {
		if (GroupGallery.groupName) {
			if (uploaderModule === null) {
				loadUploaderModule();
			} else {
				if ($.fancybox.current !== null) {
					$.fancybox.close();
				}

				var route = '/groups/' + GroupGallery.groupName + '/images/upload';
				uploaderModule.open(route, {}, null, function(image) {});
			}
		}
	};

	function loadUploaderModule() {
		require(['uploader'], function(module) {
			uploaderModule = module;
			Uploader.open();
		});
	}

	GroupGallery.uploader = Uploader;

})(GroupGallery);