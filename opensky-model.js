
/* OSWSResponse
- get results as a list of Result objects
*/

var OSWSResponse = Class.extend({
	init: function (data) {
		this.data = data;
		this.numFound = 0;
		this.results = [];
		this.length = 0;
		this.start = 0;
		this.facets = null;
		try {
			this.facets = this._get_facets()
		} catch (error) {
			log ("_get_facets ERROR: " + error);

		}

		this.error = this._get_error();
		
		if (!this.error) {
			this.numFound = this._get_numFound();
			this.results = this._get_results();
			this.start = this._get_start();
			this.length = this.results.length;
		}
	},
	
	_get_error: function () {
		var error = null;
		try {
			return this.data.OpenSkyWebService.error;
		} catch (error) {}
		return null;
	},

	_get_results: function () {
		// log ("_get_results");
		// log (stringify(this.data));
		var json_results = [];
		if (this.numFound) {
			try {
				json_results = this.data.OpenSkyWebService.Search.results.result;
				// log (JSON.stringify(json_results, null, 2))
				if (json_results == null) {
					log (stringify (this.data))
					throw "could not parse response into results"
				}
				
				// if this is a single result item turn it into a list
				if (!json_results.length) {
					json_results = [json_results]
				}
			} catch (error) {
				throw ("could not find json_results: " + error);
			}
		}
		
		// DEBUGGING
		if (this.verbose) {
			log (json_results.length + " results found");
		}
		
		return json_results;
	},
	
	_get_numFound: function () {
		var numFound = -1;
		try {
			numFound = parseInt(this.data.OpenSkyWebService.Search.resultInfo.response.numFound);
		} catch (error) {}
		return numFound;
	},

	_get_start: function () {
		var start = -1;
		try {
			start = parseInt(this.data.OpenSkyWebService.Search.resultInfo.response.start);
		} catch (error) {}
		return start;
	},

	_get_facets: function () {
		var json_facets = [];
		try {
			json_facets = this.data.OpenSkyWebService.Search.facetFields.lst;
			// log (JSON.stringify(json_facets, null, 2))
			if (json_facets == null)
				return null
			if (!$.isArray(json_facets))
				return [ json_facets ];
		} catch (error) {
			// log ("did not find json_facets: " + error);
			return null;
		}
		
		return json_facets;
	}
})

