<?php

function archive_it_proxy () {

    $query = $_GET['query'];
    $url_live = PSEARCH_ARCHIVE_IT_URL . '?page=1&show=ArchivedPages&q=' . $query;

    class ResultItem {
        
        public $title;
        public $archive_it_url;
        public $url;
        public $description;
        
        public function __construct($html) {
            $link_pat = '/<a href=\"(.*?)\".*?>(.*?)<\/a>/is';
            preg_match_all ($link_pat, $html, $matches);
            $this->archive_it_url = $matches[1][1];
            $this->url = $matches[2][1];
            $this->title = $matches[2][0];
            $p_pat = '/<p>(.*?)<\/p>/is';
            preg_match_all ($p_pat, $html, $matches);
            $this->description = $matches[1][1] .' ...';
        }
        public function report () {
            echo "\n" . $this->title;
            echo "\n-" . $this->url;
            echo "\n-" . $this->archive_it_url;
            echo "\n-" . $this->description . "\n";
        }
    }
    
    $contents = file_get_contents ($url_live);
    $item_pat = '/<div class=\"result-item\">.*?<\/div>/is';
    
    preg_match_all($item_pat, $contents, $matches);
    
    $match_items = $matches[0];
    $results = array();
    
    foreach ($match_items as $html) {
        $item = new ResultItem($html);
        $results[] = $item;
    }
    
    $response = array();
    $response['query'] = $query;
    $response['results'] = $results;

    return drupal_json_output($response);
}

function aspace_proxy () {
    $proxy = new AspaceProxy();
    $query = $_GET['query'];

    // echo 'token is ' . $proxy->token . "\n";
    $resp = $proxy->search($query);

    if (0) { // DEBUGGING
        $data = json_decode($resp);
        
        $results = $data->results;
        $total_hits = $data->total_hits;
        echo "total hits: $total_hits\n";
    }

    return $resp;
}

class AspaceProxy {

    public $api_baseurl = PSEARCH_ASPACE_API;
    public $token;

    public function __construct() {
        $this->token = $this->get_token();
    }

    private function get_token () {

        $url = "$this->api_baseurl/users/webservice/login";

        if (0) { // DRUPAL
            $data = http_build_query (array ('password' => 'api-client'));
            $options = array (
                'data' => $data,
                'method' => 'POST'
            );
            $resp = drupal_http_request($url, $options);
            print_r ($resp);

        } else {
            // PHP
            $data = array ('password' => 'api-client');

            $options = array (
                'http' => array (
                     'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                    'content' => http_build_query($data),
                    'method' => 'POST'
                )
            );
            $context  = stream_context_create($options);
            $result = file_get_contents($url, false, $context);
            if ($result === FALSE) {
                /* Handle error */
                echo 'Utilities.AspaceProxy got an error ..';
                echo '- trying to search '.$url;
            }

            $resp_json = json_decode($result);
            return $resp_json->session;
        }

    }

    public function search ($query) {
        $url = "$this->api_baseurl/repositories/2/search";

	// Copied from a query sent to backend during normal ASPACE query. Only dynamic part is single insertion of $query somewhere in this mess ...
        $aspace_query = "publish=true&page_size=10&resolve%5B%5D=repository%3Aid&resolve%5B%5D=resource%3Aid%40compact_resource&resolve%5B%5D=ancestors%3Aid%40compact_resource&resolve%5B%5D=top_container_uri_u_sstr%3Aid&facet.mincount=1&aq=%7B%22jsonmodel_type%22%3A%22advanced_query%22%2C%22query%22%3A%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22AND%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22publish%22%2C%22value%22%3Atrue%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22AND%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22pui%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22AND%22%2C%22subqueries%22%3A%5B%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22AND%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22keyword%22%2C%22value%22%3A%22$query%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%5D%7D%5D%7D%5D%7D%5D%7D%7D&filter=%7B%22jsonmodel_type%22%3A%22advanced_query%22%2C%22query%22%3A%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22AND%22%2C%22subqueries%22%3A%5B%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22subject%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22classification%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22accession%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22repository%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22resource%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22agent%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22digital_object%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22archival_object%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%5D%7D%5D%7D%5D%7D%5D%7D%5D%7D%5D%7D%5D%7D%5D%7D%5D%7D%7D&facet%5B%5D=repository&facet%5B%5D=primary_type&facet%5B%5D=subjects&facet%5B%5D=published_agents&page=1";

        $options = array (
            'http' => array (
                'method' => 'POST',
                'content' => $aspace_query,
                'header' => 'X-ArchivesSpace-Session: ' . $this->token,
            )
        );

        $context  = stream_context_create($options);
        $contents = file_get_contents($url, false, $context);
        $data = drupal_json_decode($contents);
        return drupal_json_output($data);
    }

    public function search_SIMPLE ($query) {
        $url = "$this->api_baseurl/repositories/2/search";
        $data = array (
            'page' => '1',
            'q' => "notes:\"$query\" OR title:\"$query\"",
            'op[]' => '',
            'facet' => array ('resource_type_enum_s', 'level_enum_s', 'type_enum_s')
        );
        $options = array (
            'http' => array (
                'method' => 'GET',
                'content' => http_build_query ($data),
                'header' => 'X-ArchivesSpace-Session: ' . $this->token,
            )
        );

        $context  = stream_context_create($options);
        $contents = file_get_contents($url, false, $context);
        $data = drupal_json_decode($contents);
        return drupal_json_output($data);
    }
}

/*
NOTE: as with all these proxies implemented as drupal
pages, we can't use "q" as a parameter because it means something
special to drupal
*/
function opensky_proxy() {
    $query = $_GET['query'];
    $proxy = new OpenSkyProxy();
    return $proxy->search($query, $fq);
}

class OpenSkyProxy {

    public $api_baseurl = 'http://osstage2.ucar.edu:8080';

    private function makeFQ() {

        // NOTE - this list of collections must be updated periodically!
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
            'info:fedora/archives:wwashington',
            'info:fedora/archives:comms'
        ];
        
        $clauses = array();

        foreach ($archive_collections as $pid) {
            $clauses[] = 'RELS_EXT_isMemberOfCollection_uri_ms:"' . $pid . '"';
        }

        return implode(' OR ', $clauses);        
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

        $data = array (
            'q' => $query,
            'fq' => $collections,
            'sort' => '',
            'defType' => 'dismax',
            'wt' => 'json',
            'start' => '0',
            'rows' => '10',
            'fl' => implode(',', $solr_fields),
            'version' => '1.2'
        );

        $query_string = http_build_query($data);
        $contents = file_get_contents($url.'?'.$query_string);	
        $data = drupal_json_decode($contents);
        return drupal_json_output($data);
    }

}
