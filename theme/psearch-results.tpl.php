<?php
   /*
   load javascript and style sheets necessary to display parallel search results

   variables
   - $query - the search term
   */


   $js_path = drupal_get_path('module','psearch') . '/js';
   $css_path = drupal_get_path('module','psearch') . '/css';
   $js_files = array (
       'config.js',
       'aspace-model.js',
       'aspace-script.js',
       'opensky-model.js',
       'opensky-script.js',
       'opensky-proxy-script.js',
       'archive-it-script.js',
   );

   foreach ($js_files as $js_file) {
       // dpm ($js_file);
       drupal_add_js("$js_path/$js_file", 'file');
   }

   drupal_add_css ("$css_path/psearch-results.css");

?>

<div id="psearch-results-wrapper">
  
  <div id="aspace-wrapper" class="repo-wrapper" style="display:none">
    <button id="aspace-see-all-button" class="see-all-button">See all results</button>
    <div class="source-label">Collection Inventories</div>
    <div class="repo-desc">
       Inventories and guides to all NCAR Archives collections
    </div>
    
    <ol id="aspace-results" class="results-list"></ol>
  </div>
  
  <div id="opensky-wrapper" class="repo-wrapper" style="display:none">
    <button id="opensky-see-all-button" class="see-all-button">See all results</button>
    <div class="source-label">Digital Collections</div>
    <div class="repo-desc">
       Digital objects from the NCAR Archives collections
    </div>
    
    <ol id="opensky-results" class="results-list"></ol>
  </div>
  
  <div id="archive-it-wrapper" class="repo-wrapper" style="display:none">
    <button id="archive-it-see-all-button" class="see-all-button">See all results</button>
    <div class="source-label">Archived Websites</div>
    <div class="repo-desc">
       Preserved UCAR/NCAR websites
    </div>
    
    <ol id="archive-it-results" class="results-list">
       <li class="results-msg">Searching ... </li>
    </ol>
  </div>
  
</div> <!-- results-wrapper-->

<script>
    (function($) {

	// log ('jQuery version: ' + $.fn.jquery); // 1.4.4!
	// log ('href: ' + window.location.href);

	// After dom loads ...
	$(function() {

	    // query is the value of the search box (edit-q);
	    var query = $('#edit-q').val();

	    if (typeof (OPENSKY_UI) == 'undefined') {
            alert ('WARNING: Configs aparently not loadedd');
	    }
	    
	    // var OPENSKY = new OpenSkyController(OPENSKY_API, OPENSKY_UI);
        var OPENSKY = new OpenSkyProxyController(OPENSKY_PROXY, OPENSKY_UI);
	    
	    // var ASPACE = new AspaceController(ASPACE_API, ASPACE_UI);
	    var ASPACE = new ProxiedAspaceController(ASPACE_PROXY, ASPACE_UI);
	    
	    var ARCHIVEIT = new ArchiveItController(ARCHIVE_IT_API, ARCHIVE_IT_UI);

	    function search () {
            $('.see-all-button').hide();
            $('.repo-wrapper').show();
            OPENSKY.search();
            ASPACE.doSearch();
            ARCHIVEIT.search();
	    }

        // log ("QUERY: " + query);
        
	    if (query) {
            setTimeout(search, 500);
	    }
	    else if (0) {  // debugging auto query
		
            // $('#edit-q').val('Staff Notes Volume 43 Issue 3');
            //	      $('#edit-q').val('Atmosphere');
            $('#edit-q').val('tamex');
            // $('#edit-q').val('NCAR gets new fast computer');
            setTimeout(search, 500);
	    }
	});
	
    }(jQuery));

</script>
