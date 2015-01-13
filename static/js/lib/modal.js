"use strict";

(function(GroupGallery) {

	var socketEvents = {
			newComment: 'event:group-gallery.newComment',
			removeComment: 'event:group-gallery.removeComment',
			editComment: 'event:group-gallery.editComment'
		},

		Modal = {};

	Modal.open = function(event) {
		var el = $(event.currentTarget),
			id = el.data('group-gallery-id'),
			index = parseInt(GroupGallery.indexLookup[id], 10);

		if (!isNaN(index) && index > -1) {
			GroupGallery.lightboxOptions.index = index;
			GroupGallery.lightboxOptions.beforeLoad = beforeLoad;
			GroupGallery.lightboxOptions.afterLoad = afterLoad;
			GroupGallery.lightboxOptions.beforeClose = beforeClose;
			$.fancybox(GroupGallery.groupImages, GroupGallery.lightboxOptions);
		}

		event.preventDefault();
		return false;
	};

	Modal.clearComments = function() {
		$('.group-gallery-comments').html('');
	};

	Modal.addComments = function(comments) {
		comments = comments.map(function(el) {
			el.isMod = parseInt(app.uid, 10) === parseInt(el.uid, 10) || app.isAdmin;
			return el;
		});

		templates.parse('group-gallery/modal/comments', {
			comments: comments.reverse()
		}, function(html) {
			$('.group-gallery-comments').prepend(html);
		});
	};

	function beforeLoad() {
		Modal.clearComments.apply(this);
	}

	function afterLoad() {
		var id = parseInt(GroupGallery.idLookup[this.index], 10);
		if (!isNaN(id)) {
			loadComments.apply(this, [id]);
			unbindEvents.apply(this);
			bindEvents.apply(this, [id]);
		}
	}

	function beforeClose() {
		unbindEvents.apply(this);
	}

	function loadComments(id) {
		socket.emit('plugins.group-gallery.getComments', {imageId: id}, function(err, comments) {
			Modal.addComments(comments);
		});
	}

	function sendComment(comment) {
		var id = parseInt(GroupGallery.idLookup[$.fancybox.current.index], 10);
		if (!isNaN(id)) {
			socket.emit('plugins.group-gallery.addComment', {
				imageId: id,
				comment: comment
			});
		}
	}

	function removeComment(id) {
		if (!isNaN(parseInt(id, 10))) {
			socket.emit('plugins.group-gallery.removeComment', {
				commentId: id
			});
		}
	}

	function editComment(id, content) {
		if (!isNaN(parseInt(id, 10))) {
			socket.emit('plugins.group-gallery.getRawComment', {commentId: id}, function(err, result) {
				var commentEl = $('[data-comment-id="' + id + '"]'),
					el = commentEl.find('.group-gallery-comment-content'),
					current = result[0].content,
					currentHtml = el.html();

				commentEl.find('.group-gallery-comment-options').hide();
				el.html(
						'<div class="form-group">' +
							'<input id="group-gallery-comment-input-edit" type="text" class="form-control" value="' + current + '">' +
						'</div>')
					.on('keypress.edit', '#group-gallery-comment-input-edit', function(e) {
						if (e.which === 13 && !e.shiftKey) {
							socket.emit('plugins.group-gallery.editComment', {
								commentId: id,
								content: e.currentTarget.value
							});
							cleanup();
						} else if (e.which === 0) {
							cancel();
						}
					});

				function cleanup() {
					el.off('keypress.edit', '#group-gallery-comment-input-edit');
					commentEl.find('.group-gallery-comment-options').show();
				}

				function cancel() {
					el.html(currentHtml);
					cleanup();
				}
			});
		}
	}

	function bindEvents(id) {
		var commentInput = $('#group-gallery-comment-input'),
			commentButton = $('[data-func="group-gallery.comment"]'),
			commentsDiv = $('.group-gallery-comments'),
			editButtonSelector = '[data-func="group-gallery.comment.edit"]',
			removeButtonSelector = '[data-func="group-gallery.comment.remove"]';

		commentInput.on('keypress.comment', function(e) {
			if (e.which === 13 && !e.shiftKey) {
				sendComment(commentInput.val());
				commentInput.val('');
			}
		});

		commentButton.on('click.comment', function(e){
			sendComment(commentInput.val());
			commentInput.val('');
			return false;
		});

		commentsDiv.on('click.comment', editButtonSelector, function(e) {
			var id = $(e.currentTarget).parents('[data-comment-id]').data('commentId');
			editComment(id);

			e.preventDefault();
			return false;
		});

		commentsDiv.on('click.comment', removeButtonSelector, function(e) {
			var id = $(e.currentTarget).parents('[data-comment-id]').data('commentId');
			removeComment(id);

			e.preventDefault();
			return false;
		});

		socket.on(socketEvents.newComment, function(data) {
			if (parseInt(data[0].image, 10) === id) {
				Modal.addComments(data);
			}
		});

		socket.on(socketEvents.removeComment, function(id) {
			$('[data-comment-id="' + id + '"]').remove();
		});

		socket.on(socketEvents.editComment, function(data) {
			var comment = data[0];
			$('[data-comment-id="' + comment.id + '"] .group-gallery-comment-content').html(comment.content);
		});
	}

	function unbindEvents() {
		var commentInput = $('#group-gallery-comment-input'),
			commentButton = $('[data-func="group-gallery.comment"]'),
			commentsDiv = $('.group-gallery-comments'),
			editButtonSelector = '[data-func="group-gallery.comment.edit"]',
			removeButtonSelector = '[data-func="group-gallery.comment.remove"]';

		commentInput.off('keypress.comment');
		commentButton.off('click.comment');
		commentsDiv.off('click.comment', editButtonSelector);
		commentsDiv.off('click.comment', removeButtonSelector);

		socket.off(socketEvents.newComment);
		socket.off(socketEvents.removeComment);
	}

	GroupGallery.modal = Modal;

})(GroupGallery);