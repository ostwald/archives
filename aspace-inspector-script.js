
function idFromPath (path) {
    var pat = '/repositories/2/';
    return path.substring(pat.length);
}

var AspaceInspector = AspaceController.extend ({

    init:function (api_baseurl, ui_baseurl) {
        this._super(api_baseurl, ui_baseurl)
    },

    getResource: function () {
        var id = $('#prefix').val().trim() + $('#query').val().trim();
        log (' - id: ' + id);
        var self = this;
        this.getObject(id, displayObject)
    },

    getObject: function (id, callback) {
        var self = this;
        if (!this.TOKEN) {
            this.get_token(self._getObject (id, callback))
        }
        else {
            this._getObject(id, callback)
        }
    },

    _getObject: function(id, callback) {
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
        // slog (this.data)
        var description = '';
        $(this.notes).each (function (i, note) {
            // log (note.label)
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

            var parent_path = this.ancestors[0].ref;
            var parent_level = this.ancestors[0].level;
            $result_dom.append($t('div')
                .addClass('parent')
                .html('parent: ' + parent_path + '  (' + parent_level + ')')
                .click (function () {
                    // var pat = '/repositories/2/';
                    // $('#query').val(parent_id.substring(pat.length));
                    $('#query').val(idFromPath(parent_path));
                    ASPACE.getResource();
                }));
        }

        this.render_details();

    },

    render_details: function () {
        // slog (this.notes)

        $('#details').html($t('div')
            .html('Level: ' + this.data.level))
            .append (this.render_notes());

    },

    render_notes: function () {
        var $notes_list = $t('ul')
            .attr ('id', 'notes')
        var $wrapper = $t('div')
            .html ($t('h3')
                .html('Notes'))
            .append ($notes_list)
        var self = this;
        $(this.data.notes).each(function (i, note) {
            $notes_list.append(self.render_note(note));
        })
        return $wrapper;
    },

    render_note: function (data) {
        // log ("RENDER_NOTE")
        // slog (data);
        var $wrapper = $t('li').addClass('note')
        if (data.jsonmodel_type == 'note_singlepart') {
            $wrapper.append($t('div')
                .addClass('note-label')
                .html(data.label))
            $(data.content).each (function (i, content) {
                $wrapper.append($t('div')
                    .addClass('note-content')
                    .html (content.replace(/\n/g, '<br>')))
            })

        }
        else if (data.jsonmodel_type == 'note_multipart') {
            $wrapper.append($t('div')
                .addClass('note-label')
                .html(data.label))
            if (data.type) {
                $wrapper.append($t('div')
                    .addClass('note-type')
                    .html(data.type))
            }
            $(data.subnotes).each (function (i, subnote) {
                var $subnote = $t('div')
                    .addClass('subnote-content')
                    .html (subnote.content.replace(/\n/g, '<br>'))
                if (!subnote.publish)
                    $subnote.addClass ('unpublished')
                $wrapper.append($subnote)
            })
        }
        else {  // mulit
            $wrapper.append($t('pre')
                .html(stringify(data)))
        }

        if (!data.publish)
            $wrapper.addClass ('unpublished')
        return $wrapper;
    }
})

function displayObject(id, data) {
    log ("displayObject")
    // slog(data)

    var object = new AspaceObject (data)

    object.render();

}