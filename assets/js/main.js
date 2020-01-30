/*

  - General Functions
  - Navigation
  - Scoped (by page or component)

*/

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

/* *** Navigation *** */

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


/* *** Search *** */
;(function(){
  var $blogSuche        = document.getElementById('blog__suche')
  
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

  // Execution

  // GET searchable content
  $blogSuche.addEventListener('keyup', function(event){
    initializeSearch(function(index, searchObj){
      var searchResults = search(event.target.value, index)

      displayResults(searchResults, searchObj)
      toggleResultVisibility(event.target.value)
    })
  })
  
})()