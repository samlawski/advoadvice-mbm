$(document).ready(function(){
  layout.init();
  search.init();
  cookies.init();

  if($('.schufaTool').length > 0) schufaTool.init();
  ($('.landing__header').length >= 1) ? landing.init() : false;
});