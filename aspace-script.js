var AspaceController = Class.extend ({

    init:function (api_baseurl, ui_baseurl) {

        this.TOKEN = null;
        this.api_baseurl = api_baseurl;
        this.ui_baseurl = ui_baseurl;
        this.get_token()

    },

    get_token: function (callback) {
        var url = this.api_baseurl + '/users/webservice/login'
        var data = {password:'api-client'}
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

    getResource: function () {

        if (!this.TOKEN) {
            this.get_token(this._getResource)
        }
        else {
            this._getResource(this.showDetails)
        }
    },

    showDetails: function (id, data) {
        slog(data)
        var fields = [
            'level', 'notes',
        ]
        $('#details').html($t('div')
            .html('Level: ' + data.level))
        $(data.notes).each(function (i, note){
            $('#details').append($t('div')
                .css ('font-weight','bold')
                .html(note.label));
            if (note.content) {
                $('#details').append($t('pre')
                    .html(note.content));
            }
            if (note.subnotes) {
                $('#details').append($t('pre')
                    .html(stringify(note.subnotes)))
            }
            // $('#details').append($t('pre').html(stringify(data[field])));
        })
    },

    _getResource: function(callback) {
        log ("Aspace SEARCH")
        var id = $('#prefix').val().trim() + $('#query').val().trim();
        log (' - id: ' + id);
        var url = this.api_baseurl + id;

        var self = this;

        log ('Aspace service query: ' + url)
        // log (' -- query params: ' + stringify(params))

        $.ajax({
            url: url,
            data: {},
            headers: {'X-ArchivesSpace-Session': self.TOKEN}
        }).done (function (resp) {
            log ("ASPACE resource data returned")
            // self.render_search_results(id, resp)
            self.render_result(id, resp, $('#aspace-results'))
            if (callback) {
                callback (id, resp);
            }
        })
    },

    render_search_results: function (q, data) {
        var $target = $('#aspace-results').html('');

        if (0) {
            log ("ASPACE Result Data")
            slog(data);
        }


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
	    
            var search_url = this.ui_baseurl + '/search?op%5B%5D=&q%5B%5D=' + q;

            log ("ASSPACE Search URL: " + search_url)
            $('#aspace-see-all-button')

                .click (function (event) {
                    window.open (search_url, 'aspace');
                    return false;
                })
                .show()
                .button()
        }
        var self = this;
        $(results).each (function (i, result_data) {
            var result = new ASpaceSearchResult(result_data);
            // log ("- " + result.id)
            if (0) {
                log ("ASpaceSearchResult Json")
                slog (result.json);

            }

            if (result.jsonmodel_type == 'accession') {
                log (" .. skipping accession record")
                return;
            }

            // slog (result)
            if ($target.children().length >= RESULTS_TO_SHOW) return;

            var $result_dom = $t('li').addClass('.result')
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
            if (result.id) {
                $attrs.append($t('div')
                    .addClass('result-attr')
                    .html('id: ' + result.id))
            }

            if (result.level) {
                $attrs.append($t('div')
                    .addClass('result-attr')
                    .html('Level: ' + result.level))
            }

            // if (result.resource_type) {
            //     $attrs.append($t('div')
            //         .addClass('result-attr')
            //         .html('resource type: ' + result.resource_type))
            // }

            // if (result.jsonmodel_type) {
            //     $attrs.append($t('div')
            //         .addClass('result-attr')
            //         .html('jsonmodel type: ' + result.jsonmodel_type))
            // }

            $result_dom.append ($attrs);

            if (result.description) {
                $result_dom.append($t('div')
                    .addClass('description')
                    .html(result.description.trimToLength(200)))
            }
        })
    },

    render_result: function (i, result, $target) {


        // slog (result)
        // slog (result.notes)
        var description = '';
        $(result.notes).each (function (i, note) {
            log (note.label)
            if (note.type == 'scopecontent') {
                var dlist = [];

                $(note.subnotes).each (function (j, sub) {
                    dlist.push (sub.content)
                })

                description = dlist.join ('\n\n');
            }
        })

        $target.html('');
        var $result_dom = $t('li').addClass('.result')
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

        if (description) {
            $result_dom.append($t('div')
                .addClass('description')
                .html(description.trimToLength(200)))
        }

        if (result.ancestors.length) {
            $result_dom.append($t('div')
                .addClass('parent')
                .html('parent: ' + result.ancestors[0].ref + '  (' + result.ancestors[0].level + ')')
                .click (function () {
                    var pat = '/repositories/2';
                    $('#query').val(result.ancestors[0].ref.substring(pat.length));
                    ASPACE.getResource();
                }));
        }

    }

});


