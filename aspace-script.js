var ApaceController = Class.extend ({

    init:function (api_baseurl, ui_baseurl) {
        this.TOKEN = null;
        this.api_baseurl = api_baseurl;
        this.ui_baseurl = ui_baseurl;
        this.get_token()
    },

    get_token: function (callback) {
        var url = this.api_baseurl + '/users/admin/login'
        var data = {password:'admin'}
        var self = this;
        $.post(url, data, function (resp) {
//                log ("success!")
//                slog (resp)
            $('#token').html('TOKEN: ' + resp.session);
            self.TOKEN = resp.session;
            if (callback) {
                callback()
            }
        })
    },

    search: function() {
        log ("Aspace SEARCH")
        var q = $('#query').val().trim();
        // log (' - q: ' + q);
        var url = this.api_baseurl + '/repositories/2/search'

        /* NOTE: all the "keyword" queries below yield same results */
        var params = {
            page : '1',
            // q: 'title:"' + q + '"',
            // q: 'notes:"' + q + '"',
            q: 'notes:"' + q + '" OR title:"' + q + '"',

            // q: 'keyword:"' + q + '"',
            // 'q[]': q,
            // 'q[]' : ['keyword:"' + q + '"'],
            'op[]': '',
            facet: ["resource_type_enum_s", "level_enum_s", "type_enum_s"],
            // 'fq': 'NOT type:"accessrestrict"'
        }
        var self = this;

        log ('Aspace service query: ' + url)
        log (' -- query params: ' + stringify(params))

        $.ajax({
            url: url,
            data: params,
            headers: {'X-ArchivesSpace-Session': self.TOKEN}
        }).done (function (resp) {
            log ("ASPACE SEARCH RESULTS returned")
            self.render_search_results(q, resp)
        })
    },

    doSearch: function () {
        if (!this.TOKEN) {
            this.get_token(this.search)
        }
        else {
            this.search()
        }
    },
    render_search_results: function (q, data) {
        var $target = $('#aspace-results').html('');

        var results = data.results;
        var total_hits = data.total_hits;
        var this_page = data.this_page;
        var last_page = data.last_page;

        if (!results.length) {
            log("NO results")
            $target.append($t('div')
                .html('No results found')
                .css({fontStyle: 'italic'}))
        } else {

            var search_url = this.api_baseurl + '/search?op%5B%5D=&q%5B%5D=' + q;

            log ("ASSPACE URL!: " + search_url)
            $('#aspace-see-all-button')
                .html ($t('a')
                    .prop('href', search_url)
                    .prop('target', 'aspace')
                    // .html("See all " + total_hits + " results"))
                    .html("See all results"))
                .show()
                .button()
        }
        var self = this;
        $(results).each (function (i, result) {

            $result_dom = $t('li').addClass('.result')
            $result_dom
                .appendTo($target)
                .append($t('div')
                    .addClass('title')
                    .html(result.title)
                    .append($t('a')
                        .addClass ('repo-link')
                        .prop ('href', self.ui_baseurl + result.uri)
                        .attr ('target', 'aspace')
                        .html($t('span')
                            .addClass ('ui-icon ui-icon-extlink'))))

            var $attrs = $t('div').addClass('result-attributes')
            if (result.level) {
                $attrs.append($t('div')
                    .addClass('result-attr')
                    .html('level: ' + result.level))
            }

            if (result.resource_type) {
                $attrs.append($t('div')
                    .addClass('result-attr')
                    .html('resource type: ' + result.resource_type))
            }

            $result_dom.append ($attrs);

            if (result.summary) {
                $result_dom.append($t('div')
                    .addClass('description')
                    .html(result.summary.trimToLength(200)))
            }
        })

    }
});


