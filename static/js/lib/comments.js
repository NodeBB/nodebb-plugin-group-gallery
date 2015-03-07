"use strict";

(function(GroupGallery) {

	var Comments = {},
		currentImageId,
		socketEvents = {
			newComment: 'event:group-gallery.newComment',
			removeComment: 'event:group-gallery.removeComment',
			editComment: 'event:group-gallery.editComment'
		};

	Comments.load = function(id) {
		socket.emit('plugins.group-gallery.getComments', {imageId: id}, function(err, comments) {
			currentImageId = id;
			Comments.add(comments);
		});
	};

	Comments.add = function(comments) {
		comments = comments.map(function(el) {
			el.isMod = parseInt(app.user.uid, 10) === parseInt(el.uid, 10) || app.user.isAdmin;
			return el;
		});

		templates.parse('group-gallery/comments', {
			comments: comments.reverse()
		}, function(html) {
			$('.group-gallery-comments').prepend(html);
		});
	};

	Comments.send = function(comment) {
		if (!isNaN(currentImageId)) {
			socket.emit('plugins.group-gallery.addComment', {
				imageId: currentImageId,
				comment: comment
			});
		}
	};

	Comments.remove = function(id) {
		if (!isNaN(parseInt(id, 10))) {
			socket.emit('plugins.group-gallery.removeComment', {
				commentId: id
			});
		}
	};

	Comments.edit = function(id, content) {
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
					.on('keypress.group-gallery', '#group-gallery-comment-input-edit', function(e) {
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
	};

	Comments.clear = function() {
		$('.group-gallery-comments').html('');
		currentImageId = null;
	};

	Comments.bindEvents = function() {
		var commentInput = $('#group-gallery-comment-input'),
			commentButton = $('[data-func="group-gallery.comment"]'),
			commentsDiv = $('.group-gallery-comments'),
			editCommentButtonSelector = '[data-func="group-gallery.comment.edit"]',
			removeCommentButtonSelector = '[data-func="group-gallery.comment.remove"]';

		commentInput.on('keypress.group-gallery', function(e) {
			if (e.which === 13 && !e.shiftKey) {
				Comments.send(commentInput.val());
				commentInput.val('');
			}
		});

		commentButton.on('click.group-gallery', function(e){
			Comments.send(commentInput.val());
			commentInput.val('');
			return false;
		});

		commentsDiv.on('click.group-gallery', editCommentButtonSelector, function(e) {
			var commentId = $(e.currentTarget).parents('[data-comment-id]').data('commentId');
			Comments.edit(commentId);

			e.preventDefault();
			return false;
		});

		commentsDiv.on('click.group-gallery', removeCommentButtonSelector, function(e) {
			var commentId = $(e.currentTarget).parents('[data-comment-id]').data('commentId');
			Comments.remove(commentId);

			e.preventDefault();
			return false;
		});

		socket.on(socketEvents.newComment, function(data) {
			if (parseInt(data[0].image, 10) === currentImageId) {
				Comments.add(data);
			}
		});

		socket.on(socketEvents.removeComment, function(id) {
			$('[data-comment-id="' + id + '"]').remove();
		});

		socket.on(socketEvents.editComment, function(data) {
			var comment = data[0];
			$('[data-comment-id="' + comment.id + '"] .group-gallery-comment-content').html(comment.content);
		});
	};

	Comments.unbindEvents = function() {
		var commentInput = $('#group-gallery-comment-input'),
			commentButton = $('[data-func="group-gallery.comment"]'),
			commentsDiv = $('.group-gallery-comments'),
			editCommentButtonSelector = '[data-func="group-gallery.comment.edit"]',
			removeCommentButtonSelector = '[data-func="group-gallery.comment.remove"]';

		commentInput.off('keypress.group-gallery');
		commentButton.off('click.group-gallery');
		commentsDiv.off('click.group-gallery', editCommentButtonSelector);
		commentsDiv.off('click.group-gallery', removeCommentButtonSelector);

		socket.off(socketEvents.newComment);
		socket.off(socketEvents.removeComment);
	};

	GroupGallery.comments = Comments;

})(GroupGallery);