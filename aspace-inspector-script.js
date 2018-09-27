
var AspaceInspector = AspaceController.extend ({

    init:function (api_baseurl, ui_baseurl) {
        this._super(api_baseurl, ui_baseurl)
        log ("ApaceInspector!")
        this.name = 'fooberry'
    },

    getResource: function () {
        log ("getResource - " + this.name)
        var id = $('#prefix').val().trim() + $('#query').val().trim();
        log (' - id: ' + id);
        var self = this;
        this.getObject(id, displayObject)
    },

    getObject: function (id, callback) {
        log ("getObject - " + this.name)
        var self = this;
        if (!this.TOKEN) {
            this.get_token(self._getObject (id, callback))
        }
        else {
            this._getObject(id, callback)
        }
    },

    _getObject: function(id, callback) {
        log ("_getObject - " + this.name)
        log (' - id: ' + id);
        log (' - callback: ' + callback);
        var url = this.api_baseurl + id;

        var self = this;

        log ('Aspace service query: ' + url)
        // log (' -- query params: ' + stringify(params))

        $.ajax({
            url: url,
            data: {},
            headers: {'X-ArchivesSpace-Session': self.TOKEN}
        }).done (function (resp) {
            log ("ASPACE object data returned")
            if (callback) {
                callback (id, resp);
            }
        })
    }

});

var AspaceObject = Class.extend ({
    init: function (data) {
        this.data = data;
        this.notes = this.data.notes || [];
        this.ancestors = this.data.ancestors || [];
    },

    render: function () {
        var $target = $('#aspace-results')
        // slog (result)
        // slog (this.notes)
        var description = '';
        $(this.notes).each (function (i, note) {
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
                .html(this.data.title)
                .append($t('a')
                    .addClass ('repo-link')
                    .prop ('href', self.ui_baseurl + this.data.uri)
                    .attr ('target', 'aspace')
                    .html($t('span')
                        .addClass ('ui-icon ui-icon-extlink'))))

        var $attrs = $t('div').addClass('result-attributes')
        if (this.data.level) {
            $attrs.append($t('div')
                .addClass('result-attr')
                .html('level: ' + this.data.level))
        }

        if (this.data.resource_type) {
            $attrs.append($t('div')
                .addClass('result-attr')
                .html('resource type: ' + this.data.resource_type))
        }

        $result_dom.append ($attrs);

        if (description) {
            $result_dom.append($t('div')
                .addClass('description')
                .html(description.trimToLength(200)))
        }

        if (this.ancestors.length) {

            var parent_id = this.ancestors[0].ref;
            var parent_level = this.ancestors[0].level;
            $result_dom.append($t('div')
                .addClass('parent')
                .html('parent: ' + parent_id + '  (' + parent_level + ')')
                .click (function () {
                    var pat = '/repositories/2';
                    $('#query').val(parent_id.substring(pat.length));
                    ASPACE.getResource();
                }));
        }

        this.render_details();

    },

    render_details: function () {
        var fields = [
            'level', 'notes',
        ]
        $('#details').html($t('div')
            .html('Level: ' + this.data.level))
        $(this.data.notes).each(function (i, note){
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
    }
})

function displayObject(id, data) {
    log ("displayObject")
    // slog(data)

    var object = new AspaceObject (data)

    object.render();

}
