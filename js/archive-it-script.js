(function ($) {
    
    var ArchiveItController = Class.extend ({
	
	init:function (api_baseurl, ui_baseurl) {
            this.TOKEN = null;
            this.api_baseurl = api_baseurl;
            this.ui_baseurl = ui_baseurl;
	},
	
	search: function() {
            log ("ARchiveIt SEARCH")
            var q = $('#edit-q').val().trim().replace(' ', '+');
            // log (' - q: ' + q);
            var url = this.api_baseurl;
	    
            /* NOTE: all the "keyword" queries below yield same results */
            var params = {
		query : q,
            }
            var self = this;
	    
            log ('ARchiveIt service query: ' + url)
            log (' -- query params: ' + stringify(params))
	    
            $.ajax({
		url: url,
		data: params,
		dataType: 'json',
		success: function (json_data) {
		    log ("ARchiveIt SEARCH RESULTS returned")
		    log (json_data);
		    self.render_search_results(q, json_data)
		},
            });
	},
	
	
	render_search_results: function (q, resp) {
            var $target = $('#archive-it-results').html('');
            var results = resp.results;
	    
            if (!results.length) {
		log("NO results")
		$target.append($t('div')
			       .html('No results found')
			       .addClass('results-msg'));
            } else {
		
		var see_all_url = this.ui_baseurl + q;
		
		// log ("ARCHIVE_IT Search URL: " + see_all_url)
		$('#archive-it-see-all-button')
		
                    .click (function (event) {
			window.open (see_all_url, 'archive-it');
			return false;
                    })
                    .show()
                    .button()
            }
            var self = this;
            $(results).each (function (i, result) {
		
		// slog (result)
		if ($target.children().length >= RESULTS_TO_SHOW) return;
		
		var $result_dom = $t('li').addClass('result')
		$result_dom
                    .appendTo($target)
                    .append($t('div')
			    .addClass('result-title')
//			    .html(result.title)
			    .append($t('a')
				    .addClass ('repo-link')
				    .html(result.title)
				    .attr ('href', result.archive_it_url)
				   ));
				    /*
				    .attr ('target', 'archive-it')
				    .append($t('span')
					  .addClass ('ui-icon ui-icon-extlink'))))
				    */		
		if (result.description) {
                    $result_dom.append($t('div')
				       .addClass('description')
				       .html(result.description))
		}
            })
		},
	
	
    });
    
    window.ArchiveItController = ArchiveItController;
    
}(jQuery));
