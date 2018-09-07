<?php
/**
 * Created by IntelliJ IDEA.
 * User: ostwald
 * Date: 6/19/18
 * Time: 3:07 PM
 */


class OpenSkyProxy {

    public $api_baseurl = 'http://osstage2.ucar.edu:8080';

    private function makeFQ()
    {

        $archive_collections = [
            'info:fedora/archives:asr',
            'info:fedora/archives:srm',
            'info:fedora/archives:amsohp',
            'info:fedora/archives:atd',
            'info:fedora/archives:fgge',
            'info:fedora/archives:gate',
            'info:fedora/archives:gtpr',
            'info:fedora/archives:guides',
            'info:fedora/archives:hao',
            'info:fedora/archives:ucar',
            'info:fedora/archives:mesalab',
            'info:fedora/archives:ipcc',
            'info:fedora/archives:info',
            'info:fedora/archives:kuettner',
            'info:fedora/archives:lie',
            'info:fedora/archives:wcia',
            'info:fedora/archives:unpc',
            'info:fedora/archives:nhre',
            'info:fedora/archives:nsbf',
            'info:fedora/archives:raf',
            'info:fedora/archives:scd',
            'info:fedora/archives:staffnotes',
            'info:fedora/archives:twerle',
            'info:fedora/archives:barbados',
            'info:fedora/archives:ucarbd',
            'info:fedora/archives:unoh',
            'info:fedora/archives:unid',
            'info:fedora/archives:vinlally',
            'info:fedora/archives:wor',
            'info:fedora/archives:wwashington'
        ];
        
        $clauses = array();

        foreach ($archive_collections as $pid) {
            $clauses[] = 'RELS_EXT_isMemberOfCollection_uri_ms:"' . $pid . '"';
        }

        return implode(' OR ', $clauses);
        
    }

    public function __construct() {
    }


    public function search ($query) {
        $url = "$this->api_baseurl/solr/core1/select";

        $collections = $this->makeFQ();

        $solr_fields = [
            'PID',
            'fgs_label_s',
            'mods_abstract_mt',
            'mods_extension_collectionKey_ms',
            'keyDateYMD',
            'mods_identifier_ark_mt',
            'collectionName_ms'
        ];

//        echo "Collections: $collections\n";
        
        $data = array (
            'q' => $query,
            'fq' => $collections,
            'sort' => '',
            'defType' => 'dismax',
            'wt' => 'json',
            'start' => '0',
            'rows' => '10',
//            'fl' => 'PID,fgs_label_s,mods_abstract_mt,mods_extension_collectionKey_ms,keyDateYMD,mods_identifier_ark_mt',
            'fl' => implode(',', $solr_fields),
            'version' => '1.2'
        );

        $query_string = http_build_query($data);

//        echo "query_string: $query_string\n";
        return file_get_contents($url.'?'.$query_string);
    }

}


function tester() {

    $proxy = new OpenSkyProxy();
    $resp = $proxy->search('cgd');


    $data = json_decode($resp);

    print (json_encode($data, JSON_PRETTY_PRINT));

    print "\n";


    $results = $data->response->docs;
    $total_hits = $data->response->numFound;
    echo "total hits: $total_hits\n";

}



if (0) {
    tester();
} else {
    $query = $_GET['q'];
    $proxy = new OpenSkyProxy();
    print $proxy->search($query, $fq);
}

