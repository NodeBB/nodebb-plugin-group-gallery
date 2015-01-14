<button data-func="group-gallery.modal.open" class="btn btn-default" type="button">Open</button>
<button data-func="group-gallery.upload" class="btn btn-default" type="button">Upload</button>
<hr>
<div class="row group-gallery-widget">
<!-- BEGIN images -->
    <div class="col-xs-3">
        <a class="group-gallery-widget-image" href="{images.url}"
           data-group-gallery-id="{images.id}" data-func="group-gallery.modal.open">
            <div class="crop" style="background-image: url({images.url})"></div>
        </a>
    </div>
<!-- END images -->
</div>