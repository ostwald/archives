

var archives_keys = ['asr','atd','barbados','comm','fgge','gate','gtpr','guides','hao','info','ipcc','jkuettner','lie','mesalab','natlballoonfac','nhre','raf','scdnewsletter','srm','staff','twerle','ucar','ucarbd','unid','unoh','unpc','vinlally','wcias','wor','wwashington']
var non_archives_keys = ['articles','books','cimg','conference','dataviz','dcerc','jkuettner','kuettner','manuals','manuscript','reports','siparcs','soars','technotes','usclivar']
// var non_archives_keys = ['articles','books']

var OpenSkyController = Class.extend ({

    init: function(api_baseurl, ui_baseurl) {
        this.api_baseurl = api_baseurl;
        this.ui_baseurl = ui_baseurl;
        this.$result_list = $('#opensky-result-list')
        this.$see_all_button = $('#opensky-see-all-button')
    },

    makeFQ: function() {
        return [
            "info:fedora/archives:asr",
            "info:fedora/archives:srm",
            "info:fedora/archives:amsohp",
            "info:fedora/archives:atd",
            "info:fedora/archives:fgge",
            "info:fedora/archives:gate",
            "info:fedora/archives:gtpr",
            "info:fedora/archives:guides",
            "info:fedora/archives:hao",
            "info:fedora/archives:ucar",
            "info:fedora/archives:mesalab",
            "info:fedora/archives:ipcc",
            "info:fedora/archives:info",
            "info:fedora/archives:kuettner",
            "info:fedora/archives:lie",
            "info:fedora/archives:wcia",
            "info:fedora/archives:unpc",
            "info:fedora/archives:nhre",
            "info:fedora/archives:nsbf",
            "info:fedora/archives:raf",
            "info:fedora/archives:scd",
            "info:fedora/archives:staffnotes",
            "info:fedora/archives:twerle",
            "info:fedora/archives:barbados",
            "info:fedora/archives:ucarbd",
            "info:fedora/archives:unoh",
            "info:fedora/archives:unid",
            "info:fedora/archives:vinlally",
            "info:fedora/archives:wor",
            "info:fedora/archives:wwashington",
        ].join(' OR ');

    },

    search: function () {
        log ("OpenSky SEARCH")
        var q = $('#query').val().trim();
        log (' - q: ' + q);


        var url = "http://osstage2.ucar.edu:8080/solr/core1/select";
        // var url = this.api_baseurl + '/service/search/v1'
        // var url = this.api_baseurl + '/osws/search/v1';    // DEVEL
        var params = {
            // q: 'mods_titleInfo_title_mt:"' + q + '"',
            q: q,
            fq:this.makeFQ(),
            fl: 'ds.MODS,PID,dsmd_MODS.Content-Type,fgs_ownerId_s,fgs_createdDate_dt,fgs_label_s,score',
            sort: '',
            defType: 'dismax',
            wt: 'json',
            start: '0',
            rows: '10',
        }

        log ('OpenSky service query: ' + url)
        log (' -- query params: ' + stringify(params))


        var self = this;
        $.ajax({
            url: url,
            data: params,
        }).done (function (resp) {
            log ("OSWS SEARCH RESULTS returned")
            log (stringify(resp))
            self.render_search_results(q, resp)
        })
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
        log ("render_search_results")

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
                .css({fontStyle: 'italic'}))
        } else {

            var opensky_url = this.get_opensky_query(q);
            log ('OpenSky url: ' + opensky_url)

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

})
