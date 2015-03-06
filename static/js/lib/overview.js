"use strict";

(function(window) {

	$(window).on('action:ajaxify.end', function(event, data) {
		var isOverview = ajaxify.variables.get('is_gallery_overview');
		if (isOverview && isOverview.length) {
			require(['forum/pagination'], function(pagination) {
				pagination.init(ajaxify.variables.get('currentPage'), ajaxify.variables.get('pageCount'));
			});
		}
	});

})(window);