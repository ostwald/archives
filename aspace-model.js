var ASpaceSearchResult = Class.extend ({

    init: function (data) {
        this.data = data;
        this.id = data.id;
        this.uri = data.uri;
        this.title = data.title;
        this.level = data.level;
        this.json = JSON.parse(data.json);
        this.primary_type = data.primary_type;
        this.jsonmodel_type = data.jsonmodel_type
        this.description = this.get_description();
    },

    get_description: function () {
        // log ("getting description for " + this.jsonmodel_type)
        var description = '';
        var note_type = '';
        if (this.jsonmodel_type == 'archival_object' ||
            this.jsonmodel_type == 'resource') {

            note_type = 'scopecontent'
        }
        else if (this.jsonmodel_type == 'agent_person') {
            note_type = 'note_bioghist';
            // slog (this.json.notes);
        }

        var notes = this.json.notes;
        // log (this.id + '  NOTES')
        // slog (notes);

        $(notes).each (function (j, note) {
            if (note.type == note_type || note.jsonmodel_type == note_type) {



                // log ("found " + note_type)
                var dlist = [];

                if (note._inherited) {
                    dlist.push ("INHERITED!!")
                    log ("  --> INHERITED")
                }

                $(note.subnotes).each (function (k, sub) {
                    dlist.push (sub.content)
                })

                description = dlist.join ('\n\n');
            }
        })

        return description;
    }

});