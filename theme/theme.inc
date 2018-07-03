<?php

/**
 * @file
  * This file contains all theme and preprocess functions
*/

/**
 * Implements template_preprocess_HOOK().
  *
*/

function template_preprocess_psearch_wrapper(&$variables) {

    // dpm ('template_preprocess_psearch_wrapper');

    // dpm ('- request uri: ' . request_uri());
    $query = $_GET['query'];
    if ($query) {
        // dpm ('query: ' . $query);
    } else {
        // dpm ('NO Query');
    }
    $pat = '/psearch';

    if (substr(request_uri(), 0, strlen($pat)) === $pat) {
        $variables['is_psearch_page'] = 1;
    } else {
        $variables['is_psearch_page'] = 0;
    }
    $variables['query'] = $query;
    // dpm ('completed template_preprocess_psearch_wrapper');
}
