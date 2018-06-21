<?php
/**
 * Created by IntelliJ IDEA.
 * User: ostwald
 * Date: 6/19/18
 * Time: 3:07 PM
 */

$query = $_GET['q'];

$url_live = '';

class AspaceProxy {

    public $api_baseurl = 'http://oswscl.dls.ucar.edu:7089';
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
                echo 'we got an error ..';
            }

//            var_dump($result);
            $resp_json = json_decode($result);

            return $resp_json->session;

        }

    }

    public function search ($query) {
        echo "search\n";
        $url = "$this->api_baseurl/repositories/2/search";
        echo "- url: $url\n";
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
        return file_get_contents($url, false, $context);

    }

}


function tester() {

    $proxy = new AspaceProxy();
    echo 'token is ' . $proxy->token . "\n";
    $resp = $proxy->search('balloon');

    $data = json_decode($resp);

    $results = $data->results;
    $total_hits = $data->total_hits;
    echo "total hits: $total_hits\n";

}

tester();

