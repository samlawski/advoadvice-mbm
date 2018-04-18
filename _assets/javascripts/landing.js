var landing = (function(){
  var init = function(){
    parallaxHeader();
    parallaxSonstwo();
  };

  var parallaxHeader = function(){
    var $header = $('.landing__header');
    if($header.length == 0 || (typeof $header.css('background-position-y') == 'undefined')) return; // IE fix
    var yPos = $header.css('background-position-y').replace('%','');
    $(document).on('scroll', function(){
      var newPosition = parseInt(yPos) + ($(document).scrollTop() * 0.05);

      $header.css('background-position-y', `${newPosition}%`);
    });
  };

  var parallaxSonstwo = function(){
    $('.landing__bgbox').each(function(){
      // For each course break element:
      var $element = $(this);
      if(typeof $element.css('background-position-y') == 'undefined') return;// IE Fix!
      var originalPosition = $element.css('background-position-y').replace('%','');

      $(document).on('scroll', function(){
        var scrollBottom = $(window).scrollTop() + $(window).height();
        var elementOffset = $element.offset().top;

        if(elementOffset > scrollBottom){
          // Element not visible yet:
          $element.css('background-position-y', `${originalPosition}%`);
        }else{
          // Element inside visible space:
          var newPosition = parseInt(originalPosition) + (Math.max(0, scrollBottom - elementOffset) * 0.05);
          $element.css('background-position-y', `${newPosition}%`);
        }
      });
    });
  }


  return {
    init: init
  }
})();
