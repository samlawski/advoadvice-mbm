/*

  - General Functions
  - On Page Load
  - Navigation
  - Search (only on blog)
  - reCaptcha Cookies - Contact Form
  
*/

/* *** template *** */
;(function(){})()

/* *** General Functions *** */

function get(url, callback){
  var xmlhttp
  xmlhttp = new XMLHttpRequest()
  xmlhttp.onreadystatechange = function(){
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
      callback(xmlhttp.responseText)
    }
  }
  xmlhttp.open("GET", url, true)
  xmlhttp.send()
}
function arrayFrom(arr){
  return Array.prototype.slice.call(arr)
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

/* *** On Page Load *** */

clearAllCookies()

/* *** Navigation *** */

;(function(){
  var $navBtn   = document.querySelector('.hamburger'),
    $navMenu  = document.querySelector('.nav__menu'),
    $navLinks = document.querySelectorAll('.nav__menu a')

  // Toggle Hamburger menu
  $navBtn.onclick = function(){
    $navBtn.classList.toggle('is-active')
    $navMenu.classList.toggle('open')
  }

  // Close menu when clicking links
  $navLinks.forEach(function($link){
    $link.addEventListener('click', function(){
      $navBtn.classList.remove('is-active')
      $navMenu.classList.remove('open')
    })
  })
})()


/* *** Search *** */

;(function(){
  var $blogSuche = document.getElementById('blog__suche')
  
  // Stop if necessary elements aren't present
  if(!$blogSuche) return 

  // Methods
  function initializeSearch(callback){
    var index     = null,
        searchObj = null

    if(searchObj){
      callback(index, searchObj)
    }else if(sessionStorage.searchObj){
      searchObj = JSON.parse(sessionStorage.searchObj)
      index = initializeLunr(searchObj)
      callback(index, searchObj)
    }else{
      // Show loading spinner
      document.querySelector('.wrapper--search .articles').innerHTML = '<div class="loader" style="margin-bottom: 40px;"></div>'
      // GET searchable content
      get("/api/v1/posts.json", function(dataString){
        sessionStorage.searchObj = dataString
        searchObj = JSON.parse(dataString)
        index = initializeLunr(searchObj)
        callback(index, searchObj)
      })
    }
  }

  function initializeLunr(searchObj){
    var index = elasticlunr(function(){
      this.addField('title')
      this.addField('content')
      this.addField('topics')
      this.setRef('id')
    })

    searchObj.forEach(function(post, i){
      index.addDoc({
        "id" : i,
        "title" : post.title,
        "topics": post.topics,
        "content" : post.content
      })
    })

    return index
  }

  function search(query, index){
    return index.search(query, {
      fields: {
        title: {boost: 3},
        topics: {boost: 2},
        content: {boost: 1}
      }
    })
  }

  function displayResults(searchResults, searchObj){    
    document.querySelector('.wrapper--search .articles').innerHTML = searchResults.map(result => {
      var article = searchObj[parseInt(result.ref)]
      return articleTemplate(article)
    }).join(" ")
  }

  function articleTemplate(article){
    var topics = article.topics ? article.topics.map(function(topic){
      return '<small>' + topic + '</small>'
    }).join('<span>&nbsp;&#183&nbsp;</span>') : ''
    
    return '' + 
    '<article>' +
      '<a class="article__link" href="' + article.url + '">' +
        '<h3 class="article__title">' + article.title + '</h3>' + 
        '<p class="article__description">' + article.description + '</p>' +
        '<div class="article__topics">' + topics + '</div>' +
      '</a>' +
    '</article>'
  }

  function toggleResultVisibility(query){
    if(query.trim().length == 0){
      document.querySelector('.wrapper--articles').classList.add('active')
      document.querySelector('.wrapper--search').classList.remove('active')
    }else{
      document.querySelector('.wrapper--articles').classList.remove('active')
      document.querySelector('.wrapper--search').classList.add('active')
    }
  }

  function executeSearch(){
    initializeSearch(function(index, searchObj){
      var searchResults = search($blogSuche.value, index)

      displayResults(searchResults, searchObj)
      toggleResultVisibility($blogSuche.value)
    })
  }

  // Execution

  // GET searchable content
  $blogSuche.addEventListener('keyup', executeSearch)

  // Suggestions 
  document.querySelectorAll('.suche__suggestion').forEach(function($sugg){
    $sugg.addEventListener('click', function(event){
      $blogSuche.value = event.target.innerText
      executeSearch()
    })
  })
})()


/* *** reCaptcha Cookies / Contact Form *** */
var captchas = []

;(function(){
  var $captchaScriptContainer = document.getElementById('captcha_script_container'),
      $cookieCheckInputs      = document.querySelectorAll('.cookie_check--js'),
      $cookieCheckContainers  = document.querySelectorAll('.cookie_check_container--js'),
      $captchaContainers      = document.querySelectorAll('.captcha_container--js'),
      $sendBtns               = document.querySelectorAll('.kontakt__send')

  // Don't run unless necessary elements are present
  if($cookieCheckInputs.length == 0) return 

  // Methods

  function _enableSendBtn(){
    $sendBtns.forEach(function($btn){
      $btn.disabled = false
    })
  }
  function _disableSendBtn(){
    $sendBtns.forEach(function($btn){
      $btn.disabled = true
    })
  }

  function _activateRecaptcha(){
    var recaptchaAgreed = arrayFrom($cookieCheckInputs).some(function($check){
      return $check.checked
    })
    
    if(recaptchaAgreed){
      // After the recaptcha script has been inserted and loaded
      window.recaptchaLoaded = function(){
        // Activate reCaptcha for all forms
        $captchaContainers.forEach(function($container){
          // Add loaded captcha to array.
          captchas.push(
            grecaptcha.render($container.id, {
              'sitekey' : '6Ldi5ikTAAAAABHxVmt2EX-spF7lDD1ZEi_qU7tn',
              'callback' : _enableSendBtn,
              'expired-callback' : _disableSendBtn
            })
          )
        })
         
        // Hide all Cookie request checks
        $cookieCheckContainers.forEach(function($check){
          $check.style.display = 'none'
        })
      }
      
      // Insert reCaptcha script
      var tempScript  = document.createElement('script')

      tempScript.src = "https://www.google.com/recaptcha/api.js?onload=recaptchaLoaded&render=explicit"
      tempScript.async = true
      tempScript.defer = true

      $captchaScriptContainer.appendChild(tempScript)

      // Show loading spinner until all is loaded
      $cookieCheckContainers.forEach(function($check){
        $check.innerHTML = '<div class="loader"></div>'
      })
    }else{
      clearAllCookies()
    }
  }

  // Execution
  $cookieCheckInputs.forEach(function($check){
    $check.addEventListener('change', _activateRecaptcha)
  })
})()