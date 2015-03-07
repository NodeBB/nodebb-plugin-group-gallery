<!-- BEGIN comments -->
<div class="group-gallery-comment" data-comment-id="{comments.id}">
    <div class="group-gallery-comment-user" data-uid="{comments.user.uid}">
        <img src="{comments.user.picture}" class="group-gallery-comment-userimage"/>
        <a href="/user/{comments.user.slug}" class="group-gallery-comment-username">{comments.user.username}</a>
    </div>
    <!-- IF comments.isMod -->
    <div class="pull-right group-gallery-comment-options">
        <a href="#" class="fa fa-pencil" data-func="group-gallery.comment.edit"></a>
        <a href="#" class="fa fa-times" data-func="group-gallery.comment.remove"></a>
    </div>
    <!-- ENDIF comments.isMod -->
    <span class="group-gallery-comment-content">{comments.content}</span>
</div>
<!-- END comments -->