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

//    dpm ('template_preprocess_psearch_wrapper');
//    dpm ($variables);

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

    $variables['PSEARCH_ARCHIVE_IT_URL'] = PSEARCH_ARCHIVE_IT_URL;
    $variables['PSEARCH_OPENSKY_URL'] = PSEARCH_OPENSKY_URL;
    $variables['PSEARCH_OPENSKY_API'] = PSEARCH_OPENSKY_API;
    $variables['PSEARCH_ASPACE_API'] = PSEARCH_ASPACE_API;
    $variables['PSEARCH_ASPACE_URL'] = PSEARCH_ASPACE_URL;
}
