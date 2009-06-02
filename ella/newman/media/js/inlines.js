(function($) {
    
    function add_inline($template, no) {
        $template.before(
            $template.html()
            .replace(/<!--|-->/g, '')
            .replace(/-#-/g, '--')
            .replace(/__NO__/g, no)
        ).parent().trigger('content_added');
    }
    $('.remove-inline-button').live('click', function(evt) {
        if (evt.button != 0) return;
        $(this).closest('.inline-item').remove();
    });

    //// listings
    $('.add-listing-button').live('click', function(evt) {
        if (evt.button != 0) return;
        var no = $('.listing-row').length + 1;
        var $template = $('.listing-row-template:first');
        add_inline($template, no);
    });

    //// gallery items
    function max_order() {
        return Math.max.apply(this, $.map( $.makeArray( $('.gallery-items-sortable input.item-order') ), function(e) {
            var n = new Number( $(e).val() );
            if (n > 0) return n;
            else return 0;
        }));
    }
    
    $('.add-gallery-item-button').live('click', function(evt) {
        if (evt.button != 0) return;
        var $last_item = $('.gallery-items-sortable .inline-related:last');
        var $new_item = $last_item.clone(true);
        var no_items = $('.gallery-items-sortable input.target_id').length;
        $last_item.removeClass('last-related');
        
        $new_item.find('*').each( function() {
            var no_re = /galleryitem_set-(\d+)-/g;
            var oldno;
            if (oldno = no_re.exec( this.name )) {
                var newname = this.name.replace(no_re, 'galleryitem_set-'+no_items+'-');
                $(this).attr({name: newname});
            }
            if (oldno = no_re.exec( this.id )) {
                var newid = this.id.replace(no_re, 'galleryitem_set-'+no_items+'-');
                $(this).attr({id: newid});
            }
            
            // init values
            if ($(this).is('.target_id' )) $(this).val('');
            if ($(this).is('.item-order')) $(this).val( max_order() + 1 );
            if ($(this).is('img.thumb'  )) $(this).attr({src:'', alt:''});
        });
        $new_item.find('h4').remove();
        $new_item.insertAfter( $last_item );
        var $no_items = $('#id_galleryitem_set-TOTAL_FORMS');
        $no_items.val( no_items+1 );
    });

    // check for unique photo ID and strip all unused input rows
    function check_gallery_changeform( $form ) {
        var used_ids = {};
        var rv = true;
        $form.find('.gallery-item .target_id').each( function() {
            if (rv == false) return;
            var val = $(this).val();
            if (val == '') return;
            if (used_ids[ val ]) {
                alert(gettext('Duplicate photo')+' #'+val);
                $(this).focus();
                rv = false;
                return;
            }
            used_ids[ val ] = 1;
        });
        
        // If the form validates, strip off all gallery-item's that contain a valueless input.target_id
        if (rv) {
            $('.gallery-items-sortable .inline-related').filter( function() {
                return $(this).find('input.target_id').val() == ''
            }).remove();
        }
        
        return rv;
    }
    $('#gallery_form').data('validation', check_gallery_changeform);
    
    function init_gallery(root) {
        if ( ! root ) root = document;
        var $sortables = $(root).find('.gallery-items-sortable').not('ui-sortable');
        if ($sortables.length == 0) return;
        $sortables.children().filter( function() {
            return $(this).find('input.target_id').val();
        }).addClass('sortable-item');
        $sortables.sortable({
            distance: 20,
            items: '.sortable-item',
            update: function(evt, ui) {
                var $target = $( evt.target );
                $target.find('input.item-order').each( function(i) {
                    var ord = i+1;
                    $(this).val( ord ).change();
                    $(this).siblings('h4:first').find('span:first').text( ord );
                });
                $target.children().removeClass('last-related');
                $target.children(':last').addClass('last-related');
            }
        });
        
        // make sure only the inputs with a selected photo are sortable
        $(root).find('input.target_id').change( function() {
            if ($(this).val()) $(this).closest('.inline-related').addClass('sortable-item');
        });
        
        // initialize order for empty listing
        $sortables.find('.item-order').each( function() {
            if ( ! $(this).val() ) $(this).val( max_order() + 1 );
        });
        
        // update the preview thumbs and headings
        $(root).find('input.target_id').not('.js-updates-thumb').addClass('js-updates-thumb').change( function() {
            var $input = $(this);
            var id = $input.val();
            
            var $img     = $input.siblings('img:first');
            var $heading = $input.siblings('h4:first');
            if ($heading.length == 0) {
                $heading = $('<h4>#<span></span> &mdash; <span></span></h4>').insertAfter($img);
            }
            $img.attr({
                src: '',
                alt: ''
            });
            $heading.find('span').empty();
            
            if (!id) {
                $heading.remove();
                return;
            }
            
            $.ajax({
                url: BASE_PATH + '/photos/photo/' + id + '/thumb/',
                success: function(response_text) {
                    var res;
                    try { res = JSON.parse(response_text); }
                    catch(e) {
                        carp('thumb update error: successful response container unexpected text: ' + response_text);
                    }
                    
                    // thumbnail
                    var thumb_url = res.data.thumb_url;
                    var title     = res.data.title;
                    $img.attr({
                        src: thumb_url,
                        alt: title
                    });
                    
                    // heading
                    var order = $( '#' + $input.attr('id').replace(/-target_id$/, '-order') ).val();
                    $heading.find('span:first').text( order );
                    $heading.find('span:eq(1)').text( title );
                },
            });
        });
    }
    init_gallery();
    
    $(document).bind('content_added', function(evt) {
        $('#gallery_form').removeData('validation').data('validation', check_unique_photo);
        init_gallery( evt.target );
    });
    
})(jQuery);
