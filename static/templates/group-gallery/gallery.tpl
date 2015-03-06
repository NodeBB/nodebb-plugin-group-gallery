<input type="hidden" template-variable="group_name" value="{group.name}" />
<input type="hidden" template-variable="group_slug" value="{group.slug}" />
<input type="hidden" template-variable="is_gallery_overview" value="1" />
<input type="hidden" template-variable="currentPage" value="{currentPage}" />
<input type="hidden" template-variable="pageCount" value="{pageCount}" />

<button data-func="group-gallery.upload" class="btn btn-default pull-right" type="button">Upload</button>
<h1>{group.name} - Photo gallery</h1>

<div class="panel panel-default">
    <div class="panel-heading">
        <h3 class="panel-title">Title</h3>
    </div>
    <div class="panel-body">
        <div class="group-gallery-overview-pagination">
            <!-- IMPORT partials/paginator.tpl -->
        </div>

        <div class="group-gallery-overview row">
            <!-- BEGIN images -->
            <div class="col-sm-3 group-gallery-overview-item">
                <a href="/groups/{group.slug}/gallery/{images.id}">
                    <div class="group-gallery-image-crop" style="background-image: url({images.url})"></div>
                    <h4 class="group-gallery-overview-caption">{images.caption}</h4>
                </a>
                <div class="group-gallery-overview-details">
                    <p>Uploaded by <a href="/user/{images.author.userslug}" class="group-gallery-overview-details-author">{images.author.username}</a></p>
                    <p><span class="group-gallery-overview-details-views">{images.viewcount} Views</span> | <span class="group-gallery-overview-details-comments">{commentcount} Comments</span></p>
                </div>
            </div>
            <!-- END images -->
        </div>
    </div>
</div>