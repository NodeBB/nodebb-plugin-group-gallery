"use strict";

(function() {
	$(document).ready(function() {
		GroupGallery.init();
	});

	window.GroupGallery = {
		init: function() {
			$('.group-gallery-images').fancybox({

			});
		}
	};
}());