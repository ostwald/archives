# archives
parallel search prototype for Archives

# Install/Configuration
## Clone archives repo into Drupal
**Git project** - https://github.com/ostwald/archives
- master branch is for drupal
- stand-alone is javascript-based prototype


on webpub test the location is /cmstest/test7.archives.cms/sites/default/modules/custom

## rename “archives” dir to “psearch”
check permissions: directories must have o+x and files o+r

## Enable Parallel Search module

## Configure blocks defined by psearch module In drupal
for test archives drupal instance (https://test7.archives.cms.ucar.edu/)

### Parallel Search Form Wrapper
goes in “content” region
displays only in <front>, psearch pages
title is <none>

### Psearch search Form (not active - it is part of search form wrapper)
