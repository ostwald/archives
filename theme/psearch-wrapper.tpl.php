<script>
// global vars - defined in psearch.module, then made available here
// via template_preprocess_psearch_wrapper

var ASPACE_UI = '<?php echo $PSEARCH_ASPACE_URL ?>';
// ASPACE_API NOT USED in javascript (because we are using PROXY)
// var ASPACE_API = '<?php echo $PSEARCH_ASPACE_API ?>';
var ASPACE_PROXY = '/psearch/aspace';

// OPENSKY_API NOT USED in javascript (because we are using PROXY)
// var OPENSKY_API = '<?php $PSEARCH_OSWS_API ?>';
var OPENSKY_UI = '<?php echo $PSEARCH_OPENSKY_URL ?>';
var OPENSKY_PROXY = '/psearch/opensky';

var ARCHIVE_IT_API = '/psearch/archive-it';
var ARCHIVE_IT_UI = '<?php echo $PSEARCH_ARCHIVE_IT_URL ?>';

var RESULTS_TO_SHOW = 5;


</script>

<?php

/* js added here in template loads before js attached to forms
   (although drupal_add_js is depreciated
*/

// dpm($variables);
$js_path = drupal_get_path('module','psearch') . '/js';

drupal_add_js("$js_path/base-script-for-drupal.js", 'file');

$block = module_invoke('psearch', 'block_view', 'psearch_search_form_block');
print render($block['content']);

if ($is_psearch_page) {
    $block = module_invoke('psearch', 'block_view', 'psearch_search_results_block');
    print render($block['content']);
}

?>

<script>
// we can put javascript here (we can also attach it to form, etc)
(function($) {
    log ('jQuery version: ' + $.fn.jquery);
    log ('href: ' + window.location.href);

    var query = "<?php echo $query ?>";
    var is_psearch_page = "<?php echo $is_psearch_page ?>" != '0';
    log ("query is: " + query);
    log ("is_psearch_page: " + is_psearch_page);

    $('#edit-q').val("<?php echo $query ?>");

    
}(jQuery));
</script>