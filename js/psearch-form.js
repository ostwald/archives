/*
  psearch.js - attached by psearch form
*/


(function ($) {

    $(function () { // wait for DOM to load ...
    
	$('#psearch-search-form')

	    // SUBMIT HANDLER
	    .submit (function (event) {
		//		alert ('no you dont');
		var query = $('input#edit-q').val();

		if (!query) {
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

		// we have a search term and we are doing psearch
		event.preventDefault();
		window.location = 'psearch?query=' + query;
	    })

	$("#edit-submit").button()
    })

}(jQuery));
