//= require_tree .

$(document).ready(function(){
  layout.init();
  search.init();
  cookieBanner.init();
  ($('.landing__header').length >= 1) ? landing.init() : false;
});
