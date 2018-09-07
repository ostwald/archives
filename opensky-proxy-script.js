/*
    NOTE: this file must be loaded after opensky-script since it specializes
    OpenSkyController.

    In order to mimic the search results in OPenSky, we have to mimic the queries it builds
    and also we have to query the solr index (not the OSWS Service).
    
    Since the Solr service does not support CORS, we use a PHP-based proxy (see opensky-proxy.php)
    and then parse and render the resulting json (see OpenSkyProxyResults and OpenSkyProxyResult below)
 */

var OpenSkyProxyController = OpenSkyController.extend ( {

    search: function () {
        log ("OpenSkyProxyController");
        var q = $('#query').val().trim();
        // this._super();
        var url = 'http://localhost/~ostwald/archives/opensky-proxy.php';
        var params = {
            q : q,
            // fq:this.makeFQ(),
        }

        log ('OpenSky PROXY query: ' + url)
        log (' -- proxy params: ' + stringify(params))

        var self = this;
        $.ajax({
            url: url,
            data: params,
        }).done (function (resp) {
            log ("OSWS PROXY RESULT returned")
            // log (stringify(resp))
            var json_resp;
            try {
                json_resp = JSON.parse(resp)
                log('json_resp is a ' + typeof json_resp)
            } catch (error) {
                log ("PARSE ERROR: " + error)
            }

            self.render_search_results(q, json_resp)
        })
    },

    render_search_results:function (q, data) {
        log ("PROXY: render_search_results")

        slog (data);

        var $target = $('#opensky-results').html('');
        var osws_response = new OpenSkyProxyResults(data);

        var results = osws_response.results;
        var total_hits = osws_response.numFound;

        log (total_hits + " hits found")
        log (results.length + " results returned")

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
            var result = new OpenSkyProxyResult (result_data)
            $target.append(result.render());
        })

    }

});

var OpenSkyProxyResults = Class.extend ({
    init: function (json_resp) {
        this.numFound = parseInt(json_resp.response.numFound);
        this.results = json_resp.response.docs;
    }
})

var OpenSkyProxyResult = Class.extend({
    init: function (json_data) {
        this.data = json_data;
        log ('OpenSkyProxyResult!!!');
        slog(json_data);
        this.pid = this.getValue(this.data.PID);
        this.title = this.getValue(this.data.fgs_label_s);
        this.description = this.getValue(this.data.mods_abstract_mt);
        this.date = this.getValue(this.data.keyDateYMD);
        this.ark = this.getValue(this.data.mods_identifier_ark_mt);
        this.collectionName = this.getValue(this.data.collectionName_ms);

        log ("PID: " + this.pid);
        log ("ark: " + this.ark);
        log ("description: " + this.description);


    },

    getValue: function (raw_value) {
        if ($.isArray(raw_value))
            return raw_value[0];
        return raw_value;
    },

    render: function () {
        var wrapper = $('<li>').addClass('result')
        var title = $('<div>')
            .html(this.title)
            .addClass('title')
            .append ($t('a')
                .addClass ('repo-link')
                .attr('href', 'http://n2t.net/' + this.ark)
                .attr('target', 'opensky')
                .attr('title', 'View in OpenSky')
                .html($t('span')
                    .addClass('ui-icon ui-icon-extlink')))



        var date = $('<div>')
            .addClass('date result-attr')
            .html($('<div>')
                .html(this.date))

        var description = $('<div>')
            .addClass("description")
            .append(this.description.trimToLength(200));

        // var collection_name = this.collectionKey ? COLLECTION_NAME_MAPPINGS[this.collectionKey] :
        //     "Unknown"

        var collection_link = "Unknown";
        if (this.collectionName) {
            // var collection_name = COLLECTION_NAME_MAPPINGS[this.collectionKey];

            var href = OPENSKY_UI + '/islandora/search/?type=dismax&collection=' + this.collectionPID;

            collection_link = $t('a')
                .prop('href', href)
                .prop('target','openspace')
                .html(this.collectionName);

            // collection_link = '<a href="' + href + '">' + this.collectionName + '</a>';
        }

        wrapper
            .append(date)
            .append(title)
            .append($t('div')
                .addClass ('result-attributes')
                .html ($t('div')
                    .html("Collection: ")
                    .append(collection_link)
                    // .append (' - ' + this.PID)
                    .addClass ('result-attr')))
            .append(description)


        return wrapper;

    },
})

