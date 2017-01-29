var layout = (function(){
  var init = function(){
    initializeScrollMagic();
    initializeTooltips();
    initializeSmootScrolling();
  };

  var initializeScrollMagic = function(){
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
  };

  var initializeTooltips = function(){
    // $('[data-toggle="tooltip"]').tooltip();
  };

  var initializeSmootScrolling = function(){
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
  };

  return {
    init: init
  }
})();
