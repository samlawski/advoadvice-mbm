/*

  - Polyfill
  - General Functions
  - On Page Load
  - Catch and track all console errors
  - Navigation
  - Search (only on blog)
  - reCaptcha Cookies - Contact Form
  
*/

/* *** template *** */
;(function(){})()

/* *** Polyfill *** */

if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || 
                              Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;

    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

if (!HTMLFormElement.prototype.reportValidity) {
  HTMLFormElement.prototype.reportValidity = function() {
      if (this.checkValidity()) return true;
      var btn = document.createElement('button');
      this.appendChild(btn);
      btn.click();
      this.removeChild(btn);
      return false;
  };
}

if (!HTMLInputElement.prototype.reportValidity) {
  HTMLInputElement.prototype.reportValidity = function(){
      if (this.checkValidity()) return true
      var tmpForm;
      if (!this.form) {
          tmpForm = document.createElement('form');
          tmpForm.style.display = 'inline';
          this.before(tmpForm);
          tmpForm.append(this);
      }
      var siblings = Array.from(this.form.elements).filter(function(input){
          return input !== this && !!input.checkValidity && !input.disabled;
      },this);
      siblings.forEach(function(input){
          input.disabled = true;
      });
      this.form.reportValidity();
      siblings.forEach(function(input){
          input.disabled = false;
      });
      if (tmpForm) {
          tmpForm.before(this);
          tmpForm.remove();
      }
      this.focus();
      this.selectionStart = 0;
      return false;
  };
}

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

// Track all console errors

console.defaultError = console.error.bind(console)
console.errors = []
console.error = function(){
    console.defaultError.apply(console, arguments)
    console.errors.push(Array.from(arguments))
    // analytics:
    var arg1 = Array.from(arguments)[0]
    var args = Array.from(arguments).slice(1).join('; ')
    _paq.push(['trackEvent', 'Console', 'Error', arg1, args])
}

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

/* *** Contact Form / CRM script *** */

;(function(){
  var $crmScriptContainer     = document.getElementById('crm_script_container'),
      $cookieCheckInputs      = document.querySelectorAll('.cookie_check--js'),
      $cookieCheckContainers  = document.querySelectorAll('.cookie_check_container--js'),
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

  function _activateCRMform(){
    var cookiesAgreed = arrayFrom($cookieCheckInputs).some(function($check){
      return $check.checked
    })
    
    if(cookiesAgreed){
      // Analytics:
      _paq.push(['trackEvent', 'Kontaktformular', 'Klick: Cookies erlauben', 'erlaubt'])

      // Insert CRM script
      var tempScript  = document.createElement('script')
      tempScript.src = "https://external.centralstationcrm.net/external/web_forms/d35c6634-4e50-11ea-8efe-0cc47a45bfdd.js"
      $crmScriptContainer.appendChild(tempScript)

      // Enable Send buttons only once CRM form is loaded
      // Set loading spinner
      arrayFrom(document.querySelectorAll('.kontakt__send')).forEach(function($sendBtn){
        $sendBtn.innerHTML = '<div class="loader"></div>'
      })

      // Recursively check if form is loaded yet
      var presenceCheckTime = 0
      var checkPresenceOfCrmForm = function(){ 
        var $crmForm = document.querySelector('.cscrm_webform_container')

        if($crmForm.innerHTML.length > 0){
          arrayFrom(document.querySelectorAll('.kontakt__send')).forEach(function($sendBtn){
            $sendBtn.innerHTML = 'Anfrage senden'
          })
          _enableSendBtn()
        }else if(presenceCheckTime >= 50){ // Stop and show Error
          // Analytics:
          _paq.push(['trackEvent', 'Kontaktformular', 'CRM Formular laden fehlgeschlagen'])

          alert('Leider reagiert das Formular leider nicht. Das kann unter anderem an einer schlechten Internetverbindung liegen. Bitte senden Sie uns einfach eine email an info@advoadvice.de oder rufen Sie uns an unter 030 - 921 000 40.')
        }else{ // Run again in 100 ms
          presenceCheckTime = presenceCheckTime + 1
          setTimeout(checkPresenceOfCrmForm, 100)
        }
      }
      checkPresenceOfCrmForm()

    }else{
      // Analytics:
      _paq.push(['trackEvent', 'Kontaktformular', 'Klick: Cookies erlauben', 'nicht erlaubt'])

      _disableSendBtn()
      clearAllCookies()
    }
  }

  // Execution
  // Listen to Cookie agreement and activate CRM form when clicking "agree"
  $cookieCheckInputs.forEach(function($check){
    $check.addEventListener('change', _activateCRMform)
  })

  // Listen to Kontakt form send clicks and fill the CRM form when clicking "send"
  arrayFrom(document.querySelectorAll('.kontakt__send')).forEach(function($sendBtn){
    $sendBtn.addEventListener('click', function(event){
      event.preventDefault()
  
      var $contactForm      = $sendBtn.closest('.kontakt'),
          $crmForm          = document.querySelector('#cscrm_wf_inner_d35c6634-4e50-11ea-8efe-0cc47a45bfdd')
  
      if($contactForm.reportValidity()){
        // Analytics:
        _paq.push(['trackEvent', 'Kontaktformular', 'Klick: Senden', 'vollständig'])

        var nameAsArr = $contactForm.querySelector('[name="name"]').value.split(' ')
  
        $crmForm.querySelector('#person_first_name').value = nameAsArr.length > 1 ? nameAsArr.slice(0, -1).join(' ') : nameAsArr[0]
        $crmForm.querySelector('#person_name').value = nameAsArr.slice(-1)[0]
        $crmForm.querySelector('#person_emails_attributes_0_name').value = $contactForm.querySelector('[name="email"]').value
        $crmForm.querySelector('#person_tels_attributes_0_name').value = $contactForm.querySelector('[name="tel"]').value
        $crmForm.querySelector('#person__background_d35c6634-4e50-11ea-8efe-0cc47a45bfdd').value = $contactForm.querySelector('[name="anliegen"]').value
  
        $crmForm.querySelector('[type="submit"]').click()
      }else{
        // Analytics:
        _paq.push(['trackEvent', 'Kontaktformular', 'Klick: Senden', 'unvollständig'])
      }
  
    })
  })
})()