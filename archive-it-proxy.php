<?php

$query = $_GET['q'];

$url_live = 'https://www.archive-it.org/collections/3544?page=1&show=ArchivedPages&q=' . $query;
$url_canned = '/Users/ostwald/Desktop/archive-it.html';
$url_mock = 'http://localhost/~ostwald/archives/archive-it-mock.html';

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
// print_r ($match_items);

// echo count ($match_items) . ' items found';
$results = array();

foreach ($match_items as $html) {
  //  $html = $value[0];
  $item = new ResultItem($html);
  //   $item->report();
  $results[] = $item;
 }

$response = array();
$response['query'] = $query;
$response['results'] = $results;

$json = json_encode($response);

echo $json;
