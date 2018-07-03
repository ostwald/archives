
(function ($) {
    
    var OpenSkyController = Class.extend ({
	
	init: function(api_baseurl, ui_baseurl) {
            this.api_baseurl = api_baseurl;
            this.ui_baseurl = ui_baseurl;
            this.$result_list = $('#opensky-result-list')
            this.$see_all_button = $('#opensky-see-all-button')
	},
	
	search: function () {
	    log ("OpenSky Seaerch");
            var q = $('#edit-q').val().trim();
	    
            // here is example searching title field
            // var user_query = 'mods_titleInfo_title_mt:"' + q + '"'
	    
            // simple search does not specify a field
            var user_query = 'catch_all_fields_mt:"' + q + '"';
	    
            var query = user_query + ' AND PID_t:"archives*"';
            // var query = query + ' NOT RELS_INT_embargo-expiry-notification-date_literal_ms:*';
            // var query = query + ' NOT RELS_INT_embargo-until_literal_ms:*';
	    
            // query += ' NOT mods_extension_collectionKey_ms:articles NOT mods_extension_collectionKey_ms:books'
	    
            // var url = this.api_baseurl + '/service/search/v1'
            // var url = this.api_baseurl + '/osws/search/v1';    // DEVEL
            var params = {
		// q: 'mods_titleInfo_title_mt:"' + q + '"',
		q: query,
		start: '0',
		rows: '10',
		output: 'json',
            }
	    
            log ('OpenSky service query: ' + this.api_baseurl);
            log ('query params: ' + stringify(params));
	    
	    
            var self = this;
	    $.ajax({
		url: this.api_baseurl,
		data: params,
		success: function (resp) {
		    log ("OSWS SEARCH RESULTS returned");
		    log (resp);
		    self.render_search_results(q, resp);
		}
	    });
	},
	
	/** OpenSky requires double quotes surrounding a query term to be the escaped version of "fancy"
	 *  quotes, not simple ones (i.e., NOT %22term%22, but %27term%28).
	 *
	 * @param q
	 * @returns {string}
	 */
	get_opensky_query: function (q) {
            // https://opensky.ucar.edu/islandora/search/warren%20washington?type=dismax&collection=opensky%3Aarchives

            var os_query =  this.ui_baseurl + '/islandora/search/' + encodeURIComponent(q) + '?type=dismax&collection=opensky%3Aarchives';
            var splits = os_query.split('%22');
            if (splits.length > 2) {
		os_query = splits[0] + '%28' + splits[1] + '%29' + splits[2];
            }
	    
            return os_query;
	},
	
	
	render_search_results:function (q, data) {
	    
            var $target = $('#opensky-results').html('');
            var osws_response = new OSWSResponse(data);
	    
            var results = osws_response.results;
            var total_hits = osws_response.numFound;
	    
            // log (total_hits + " hits found")
            // log (results.length + " results returned")
	    
            if (!results.length) {
		log("NO results")
		$target.append($t('div')
			       .html('No results found')
			       .addClass ('results-msg'))
            } else {
		
		var opensky_url = this.get_opensky_query(q);
		// log ('OpenSky url: ' + opensky_url)
		
		$('#opensky-see-all-button')
                    .click (function (event) {
			log ("opensky_url: " + opensky_url)
			window.open (opensky_url, 'opensky');
			return false;
                    })
                    .button()
                    .show()
            }
	    
            $(results).each(function (i, result_data) {
		if (i >= RESULTS_TO_SHOW) return;
		var result = new OSWSModsResult (result_data)
		$target.append(result.render());
            })
		
		}
	
    });
    
    window.OpenSkyController = OpenSkyController;
    
}(jQuery));
