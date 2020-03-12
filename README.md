# Website Documentation

This website is a **static site** built and optimized for speed, stability and SEO.

## Overview

This repository contains not only the main site but also a few separate pages hosted on separate domains. 

The main site is built with Jekyll and can be found in the root directory of the repository. Here an overview over the folders and files of the repository: 

* **/**: The root contains several files such as pages and more. Files and directories prefixed with an underscore `_` will not be built by Jekyll. Additionally, view the [_config.yml](_config.yml) file for details on the website, what's build and what's not. 
* **_authors**: Jekyll data collection used as the people showing up on the home page but also used as authors for blog articles. It's called "authors" to match the SEO tags. 
* **_custom-theme**: The main theme of the website. Including all HTML layouts and partials aka includes. It is automatically built by Jekyll along with the rest of the website. 
* **_custom-theme/_js**: Special note about this folder as it contains the VueJS app loaded on `./schufa-beratung.html`. It's excluded from the normal build of Jekyll and has to be built separately. See details under "Build & Deploy" below. 
* **_custom-theme/_sass**: Jekyll supports SASS by default. The main entry file is in `./_custom-theme/assets/css/main.scss`
* **_data**: Jekyll's data files, currently used for PDF file downloads and reference logos.
* **_landing_pages**: Jekyll data collection used for landing pages, that are not listed in the sitemap.xml and mainly used for direct traffic through ads. 
* **_plugins**: Custom written Ruby plugins for Jekyll. Currently only one is used to generate related articles under blog articles.
* **_posts**: Jekyll collection of blog posts
* **_site**: The public built site. (in .gitignore)
* **_topics**: Jekyll data collection also used to generate sub pages for the website. 
* **_api**: Contains only a JSON file with details about the blog posts. It's used by the client-side search feature of the blog. 
* **blog**: Main index page of the blog
* **danke**: Thank you pages, unindexed and only linked to after submitting a form. 
* **separate-seiten**: Each directory in here is hosted separately on it's own domain. Those starting with an underscore won't show up in the CloudCannon CMS. The entire directory is excluded from the Jekyll build step because they are built separately. (see details below)
* **uploads**: Contains all images and other files uploaded by the user through CloudCannon as well as some layout specific assets. 

### "separate-seiten" aka separate pages

This directory contains pages hosted separately from the rest of the main website. 

- **tintemann**: tintemann.de (managed on CloudCannon but built and hosted on Strato - see below why)
- **zehlendorf-anwalt**: zehlendorf-anwalt.de (hosted on CloudCannon as separate site)
- **_www**: This is a redirect-workaround for CloudCannon. It's hosted on CloudCannon under the `www.` subdomain to manually redirect traffic to the domain without `www`
- **_api**: This contains PHP files hosted on Strato separately. The PHP file in there right now is an end point for the contact form to feed data into the CRM.

**Note about tintemann.de**

tintemann.de is hosted on Strato because it also hosts Matomo for Analytics. To make sure Matomo can run using the SSL certificate it can't be hosted using a subdomain.

## Tech Stack

* The site uses [Jekyll](https://jekyllrb.com/) as main static site generator. Checkout the [Gemfile](Gemfile) to view the version used as well as additional gems and plugins. 
* [VueJS](https://vuejs.org/) together with [ParcelJS](https://parceljs.org/) and [npm](https://www.npmjs.com/) are used only for a single feature on a single page: [/schufa-beratung](schufa-beratung.html)
* The JavaScript of the theme is meant to support all browsers and IE10+ without any build step. The JavaScript used within Vue (see above), however is transpiled using Babel. 

## Installation

Run `npm run setup` to both install all gems and packages. You need to have Ruby and the `bundler` gem installed. You also need to have NodeJS and `npm` installed. 

## Run Dev server

Run `npm run dev` to start both the ParcelJS dev process (for transpiling all JS and CSS related to the /schufa-beratung.html page) and `jekyll serve`. This will also automaticallys tart listening to all changes in any files. 

If you're certain, you won't make any edits on the ./schufa-beratung.html, you can also just run `jekyll serve`.

## Build & Deploy

Run `npm run build` to start the build process first for ParcelJS and afterwards for Jekyll. 

**Important:** The ParcelJS build step must run before Jekyll's build step. ParcelJS will build everything inside `./_custom-theme/_js` and put it as CSS and JS file inside `./_custom-theme/assets/dist`. So when Jekyll builds, the CSS and JS file already exists and Jekyll will end up putting them along with the other assets into the `./_site` folder.

The entire main site will end up in the `./_site` directory. 