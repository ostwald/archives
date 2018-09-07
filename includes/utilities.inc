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

    // public $api_baseurl = 'http://osws-p.ucar.edu:7089';
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
//        var_dump ($options);
        $context  = stream_context_create($options);

        $contents = file_get_contents($url, false, $context);
        $data = drupal_json_decode($contents);
        return drupal_json_output($data);
    }

}
