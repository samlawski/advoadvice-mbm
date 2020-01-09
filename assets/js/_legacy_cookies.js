var cookieBanner = (function(){
  var init = function(){
    showCookieBanner();
  };

  function readCookie(n) {
    var a = ("; " + document.cookie ).match(";\\s*" + n + "=([^;]+)");
    return a ? a[1] : '';
  }

  function showCookieBanner(){
    if(!readCookie('cookieBannerDismissed')){
      var banner_wrapper = document.createElement('div');
      banner_wrapper.setAttribute("id", "cookieBanner");
      banner_wrapper.style.cssText =
        'font-size: 0.7rem;' +
        'background-color: #ddd;' +
        'color: #444;' +
        'max-width: 240px;' +
        'padding: 16px;' +
        'position: fixed;' +
        'bottom: 0;' +
        'left: 0;';

      var banner_text = document.createElement('p');
      banner_text.innerHTML = 'Um unsere Webseite für Sie optimal zu gestalten und fortlaufend verbessern zu können, verwenden wir Cookies und Analysetools. Durch die weitere Nutzung der Webseite stimmen Sie der Verwendung von Cookies zu. Weitere Informationen zur Nutzung von Cookies und Analysetools erhalten Sie in unserer <a href="/datenschutz">Datenschutzerklärung</a>.';
      banner_wrapper.appendChild(banner_text);

      var banner_link = document.createElement('a');
      banner_link.innerHTML = 'Verstanden';
      banner_link.style.cssText = 
        'margin-top: 8px;' +
        'padding: 4px;' +
        'border: 1px solid #444;' +
        'display: inline-block;' +
        'cursor: pointer;'
      banner_link.addEventListener('click', function(){
        document.cookie = "cookieBannerDismissed=true";
        banner_wrapper.style.display = "none";
      })
      banner_wrapper.appendChild(banner_link);

      document.body.appendChild(banner_wrapper);
    }
  }


  return {
    init: init
  }
})();
