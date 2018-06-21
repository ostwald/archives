<?php

/* js added here in template loads before js attached to forms
   (although drupal_add_js is depreciated
*/
// tester.js doesn't do anything (but it does load)
    $js_path = drupal_get_path('module','psearch') . '/js';
    $css_path = drupal_get_path('module','psearch') . '/css';
//    dpm ('template: ' . $js_path);
//    dpm($variables);
    drupal_add_js("$js_path/base-script-for-drupal.js", 'file');
    drupal_add_js("$js_path/tester.js", 'file');

if ($is_psearch_page) {
    // dpm ("loading javascript pages");
    $js_files = array (
        'config.js',
        'aspace-model.js',
        'aspace-script.js',
        'opensky-model.js',
        'mods-model.js',
        'opensky-script.js',
        'archive-it-script.js',
    );

    foreach ($js_files as $js_file) {
        // dpm ($js_file);
        drupal_add_js("$js_path/$js_file", 'file');        
    }

    drupal_add_css ("$css_path/psearch-results.css");
        
}


?>

<?php
$block = module_invoke('psearch', 'block_view', 'psearch_search_form_block');
print render($block['content']);
?>

<?php if ($is_psearch_page): ?>

<?php endif; ?>

<script>
// we can put javascript here (we can also attach it to form, etc)
(function($) {

    log ('jQuery version: ' + $.fn.jquery);
    log ('href: ' + window.location.href);
    
    var query = "<?php echo $query ?>";
    var is_psearch_page = "<?php echo $is_psearch_page ?>" != '0';
    log ("query is: " + query);
    log ("is_psearch_page: " + is_psearch_page);
    
    // After dom loads ...
    $(function() {

        if (query) {
            $('#edit-q').val(query);
        }
        
        if (is_psearch_page) {
            
            if (typeof (OPENSKY_API) == 'undefined') {
                alert ('WARNING: Configs not configedededed');
            }

            log ("trying to instantiate OPENSKY");
            var OPENSKY = new OpenSkyController(OPENSKY_API, OPENSKY_UI);

            // var ASPACE = new AspaceController(ASPACE_API, ASPACE_UI);
            var ASPACE = new ProxiedAspaceController(ASPACE_PROXY, ASPACE_UI);

            var ARCHIVEIT = new ArchiveItController(ARCHIVE_IT_API, ARCHIVE_IT_UI);
            log ("ArchiveItController instantiated");
            function search () {
                $('.see-all-button').hide();
                $('.repo-wrapper').show();
                OPENSKY.search();
                ASPACE.doSearch();
                ARCHIVEIT.search();
                
            }

            if (query) {
                setTimeout(search, 500);
            }

                
            else if (1) {  // debugging auto query
                
                var q = $('#edit-q').val();
                if (!q) {
                    
                    // $('#edit-q').val('Staff Notes Volume 43 Issue 3');
                    //            $('#edit-q').val('Atmosphere');
                    $('#edit-q').val('tamex');
                    // $('#edit-q').val('NCAR gets new fast computer');
                    setTimeout(search, 500);
                }
            }
        }
        
    });

}(jQuery));

</script>