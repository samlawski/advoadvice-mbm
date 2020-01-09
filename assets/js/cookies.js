var cookies = (function(){
  var captchaContainer = null

  var init = function(){
    clearAllCookies()

    // Start Listeners
    $('#cookie_check').on('change', _activateRecaptcha)
  }

  function _activateRecaptcha(){
    var recaptchaAgreed = $("#cookie_check").is(":checked")
    
    if(recaptchaAgreed){
      window.recaptchaLoaded = function(){
        captchaContainer = grecaptcha.render('captcha_container', {
          'sitekey' : '6Ldi5ikTAAAAABHxVmt2EX-spF7lDD1ZEi_qU7tn',
          'callback' : function(response) { $(".send-form").attr("disabled", false) },
          'expired-callback' : function(response) { $(".send-form").attr("disabled", true) }
        })

        $('#cookie_check_container').hide()
      }
      
      $('#captcha_script_container').html('<script src="https://www.google.com/recaptcha/api.js?onload=recaptchaLoaded&render=explicit" async defer></script>')

      $('#cookie_check_container').html('<div class="loader"></div>')
    }else{
      clearAllCookies()
    }
  }

  function clearAllCookies(){
    var cookies = document.cookie.split("; ");
    for (var c = 0; c < cookies.length; c++) {
      var d = window.location.hostname.split(".");
      while (d.length > 0) {
        var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
        var p = location.pathname.split('/');
        document.cookie = cookieBase + '/';
        while (p.length > 0) {
          document.cookie = cookieBase + p.join('/');
          p.pop();
        };
        d.shift();
      }
    }
  }


  function readCookie(n) {
    var a = ("; " + document.cookie ).match(";\\s*" + n + "=([^;]+)")
    return a ? a[1] : ''
  }

  return {
    init: init,
    readCookie: readCookie,
    clearAllCookies: clearAllCookies
  }
})()