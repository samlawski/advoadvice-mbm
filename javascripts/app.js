$(document).ready(function(){
  // Tooltips
  // $('[data-toggle="tooltip"]').tooltip();

  // ScrollMagic  + $("#navigation").height()
  var controller = new ScrollMagic.Controller();

  var headerHeight = $("header>.container").height() - 140;

  // Navigation Scene
  var navScene = new ScrollMagic.Scene({
    duration: 0,
    offset: headerHeight
  })
  .setClassToggle("#navigation", "navbar-fixed-top");

  var kennenScene = new ScrollMagic.Scene({
    duration: 10
  })


  // add scenes to controller
  controller.addScene([
    navScene,
    kennenScene
  ]);

  // ---- SMOOTH SCROOLLING -----------
  var $root = $('html, body');

  $('a.a-scroll').click(function() {
      var href = $.attr(this, 'href');
      $root.animate({
          scrollTop: $(href).offset().top
      }, 500, function () {
          window.location.hash = href;
      });
      return false;
  });

});
