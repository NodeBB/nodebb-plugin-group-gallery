<input type="hidden" template-variable="group_name" value="{group.name}" />
<input type="hidden" template-variable="group_slug" value="{group.slug}" />
<input type="hidden" template-variable="group_gallery_page" value="single" />
<input type="hidden" template-variable="image_id" value="{image.id}" />
<input type="hidden" template-variable="image_uid" value="{image.author.uid}" />

<h1>{group.name} - Photo gallery <button data-func="group-gallery.upload" class="btn btn-default pull-right" type="button">Upload</button></h1>

<div class="panel panel-default group-gallery-single">
    <div class="panel-body">
        <div class="group-gallery-single-left">
            <div class="group-gallery-single-left-more">
                <a href="/groups/{group.slug}/gallery?uid={image.author.uid}">
                    More from this user
                </a>
            </div>
            <div class="group-gallery-single-left-thumbs">
                <!-- IF !nextImages.length -->
                <div class="group-gallery-single-thumb">
                    No more next images
                </div>
                <!-- ENDIF !nextImages.length -->
                <!-- BEGIN nextImages -->
                <div class="group-gallery-single-thumb">
                    <a href="/groups/{group.slug}/gallery/{nextImages.id}">
                        <div class="group-gallery-image-crop" style="background-image: url({nextImages.url})"></div>
                        <h4 class="group-gallery-image-caption">{nextImages.caption}</h4>
                    </a>
                    <div class="group-gallery-image-details">
                        <p>Uploaded by <a href="/user/{nextImages.author.userslug}" class="group-gallery-image-details-author">{nextImages.author.username}</a></p>
                        <p><span class="group-gallery-image-details-views">{nextImages.viewcount} Views</span> | <span class="group-gallery-image-details-comments">{nextImages.commentcount} Comments</span></p>
                    </div>
                </div>
                <!-- END nextImages -->
            </div>
            <div class="group-gallery-single-left-nav">
                <nav>
                    <ul class="pager">
                        <!-- IF prevId -->
                        <li><a href="/groups/{group.slug}/gallery/{prevId}">Previous</a></li>
                        <!-- ENDIF prevId -->
                        <!-- IF nextId -->
                        <li><a href="/groups/{group.slug}/gallery/{nextId}">Next</a></li>
                        <!-- ENDIF nextId -->
                    </ul>
                </nav>
            </div>
        </div>
        <div class="group-gallery-single-right">
            <div class="group-gallery-single-item">
                <img src="{image.url}"/>
                <h4 class="group-gallery-image-caption">{image.caption}</h4>
                <div class="group-gallery-image-details">
                    <p>Uploaded by <a href="/user/{image.author.userslug}" class="group-gallery-image-details-author">{image.author.username}</a></p>
                    <p><span class="group-gallery-image-details-views">{image.viewcount} Views</span> | <span class="group-gallery-image-details-comments">{image.commentcount} Comments</span></p>
                </div>
            </div>
            <div class="group-gallery-single-buttons">
                <button data-func="group-gallery.remove" class="btn btn-danger hidden" type="button">Remove</button>
            </div>
            <hr>
            <h2>Comments</h2>
            <div class="input-group">
                <input id="group-gallery-comment-input" type="text" class="form-control" placeholder="Enter a comment...">
                <span class="input-group-btn">
                    <button class="btn btn-default" type="button" data-func="group-gallery.comment">Submit</button>
                </span>
            </div>
            <hr>
            <div class="group-gallery-comments">

            </div>
        </div>
    </div>
</div>