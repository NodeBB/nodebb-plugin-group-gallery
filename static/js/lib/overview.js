"use strict";

(function(GroupGallery) {

	var Overview = {};

	Overview.init = function() {
		require(['forum/pagination'], function(pagination) {
			pagination.init(ajaxify.variables.get('currentPage'), ajaxify.variables.get('pageCount'));
		});
	};

	GroupGallery.overview = Overview;

})(GroupGallery);