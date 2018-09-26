<?php
/**
 * Created by IntelliJ IDEA.
 * User: ostwald
 * Date: 6/19/18
 * Time: 3:07 PM
 */

$query = $_GET['q'];

$url_live = '';

/*
 * base url for various instances of aspace
 *  aspace running locally in dev mode:
 *    $api_baseurl = 'http://localhost:4567'
 *    user: admin, password: admin
 *
 *  aspace running locally in prod mode:
 *    $api_baseurl = 'http://localhost:8089';
 *    user: webservice, password: api-client
 *
 *  aspace on oswscl:
 *    $api_baseurl = 'http://oswscl.dls.ucar.edu:7089';
 *    user: webservice, password: api-client
 */
class AspaceProxy {

    public $api_baseurl = 'http://localhost:4567';
    public $token;

    public function __construct() {
        $this->token = $this->get_token();
    }

    private function get_token () {

//        $url = "$this->api_baseurl/users/webservice/login";
        $url = "$this->api_baseurl/users/admin/login";


        if (0) { // DRUPAL
//            $data = http_build_query (array ('password' => 'api-client'));
            $data = http_build_query(array('password' => 'admin'));
            $options = array(
                'data' => $data,
                'method' => 'POST'
            );
            $resp = drupal_http_request($url, $options);
            print_r ($resp);

        } else {
            // PHP
//            $data = array ('password' => 'api-client');
            $data = array('password' => 'admin');

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
//        echo "- url: $url\n";

        $aspace_query = "publish=true&page_size=10&resolve%5B%5D=repository%3Aid&resolve%5B%5D=resource%3Aid%40compact_resource&resolve%5B%5D=ancestors%3Aid%40compact_resource&resolve%5B%5D=top_container_uri_u_sstr%3Aid&facet.mincount=1&aq=%7B%22jsonmodel_type%22%3A%22advanced_query%22%2C%22query%22%3A%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22AND%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22publish%22%2C%22value%22%3Atrue%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22AND%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22pui%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22AND%22%2C%22subqueries%22%3A%5B%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22AND%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22keyword%22%2C%22value%22%3A%22$query%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%5D%7D%5D%7D%5D%7D%5D%7D%7D&filter=%7B%22jsonmodel_type%22%3A%22advanced_query%22%2C%22query%22%3A%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22AND%22%2C%22subqueries%22%3A%5B%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22subject%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22classification%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22accession%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22repository%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22resource%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22agent%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22digital_object%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%2C%7B%22jsonmodel_type%22%3A%22boolean_query%22%2C%22op%22%3A%22OR%22%2C%22subqueries%22%3A%5B%7B%22field%22%3A%22types%22%2C%22value%22%3A%22archival_object%22%2C%22type%22%3A%22text%22%2C%22negated%22%3Afalse%2C%22jsonmodel_type%22%3A%22field_query%22%7D%5D%7D%5D%7D%5D%7D%5D%7D%5D%7D%5D%7D%5D%7D%5D%7D%5D%7D%7D&facet%5B%5D=repository&facet%5B%5D=primary_type&facet%5B%5D=subjects&facet%5B%5D=published_agents&page=1";

        $options = array(
            'http' => array(
                'method' => 'GET',
                'content' => $aspace_query,
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

