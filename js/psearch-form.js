/*
  psearch.js - attached by psearch form
*/


(function ($) {

    $(function () { // wait for DOM to load ...
    
	$('#psearch-search-form')

	    // SUBMIT HANDLER
	    .submit (function (event) {
		log ("SUBMINT!");
		//		alert ('no you dont');
		var query = $('input#edit-q').val();

		// we will trap empty query only when no source is specified
		if (false && !query) {
		    alert('please enter a search term');
		    return false;
		}

		log ('psearch-search-form SUBMIT');
		log ($('#psearch-search-form').serialize());
		var scope = $('input[name="scope"]:checked', '#psearch-search-form').val();

		log ('scope: '  + scope);
		log ("query: " + query);

		if (scope != '0') {
		    // let drupal form_submit handle request
		    return
		}

		// empty query with "all" (i.e., no source specified)
		if (!query) {
		    alert('Please enter a search term');
		    return false;
		}
		
		// we have a search term and we are doing psearch
		event.preventDefault();
		window.location = 'psearch?query=' + query;
	    })

	$("#edit-submit").button()
    })

}(jQuery));
