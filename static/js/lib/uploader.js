"use strict";

(function(GroupGallery) {

	var Uploader = {},
		uploaderModule = null;

	Uploader.open = function() {
		if (GroupGallery.vars.groupName) {
			if (uploaderModule === null) {
				loadUploaderModule();
			} else {
				if ($.fancybox.current !== null) {
					$.fancybox.close();
				}

				var route = '/groups/' + GroupGallery.vars.groupName + '/gallery/upload';
				bootbox.prompt('Image caption', function(caption) {
					if (caption !== null) {
						uploaderModule.open(route, {caption: caption}, null, function(image) {});
					}
				});
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