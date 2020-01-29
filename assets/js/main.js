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
  var $blogSuche  = document.getElementById('blog__suche')
  
  // Stop if necessary elements aren't present
  if(!$blogSuche) return 

  // Methods
  function initializeSearch(callback){
    var index = null

    if(index){
      callback(index)
    }else if(sessionStorage.searchObj){
      index = initializeLunr(
        JSON.parse(sessionStorage.searchObj)
      )
      callback(index)
    }else{
      get("/api/v1/posts.json", function(dataString){
        sessionStorage.searchObj = dataString
        index = initializeLunr(
          JSON.parse(dataString)
        )
        callback(index)
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

  function displayResults(data){
    console.log('results', data, data.map(r => {
      return JSON.parse(sessionStorage.searchObj)[parseInt(r.ref)]
    }))
  }

  

  // Execution

  // GET searchable content
  $blogSuche.addEventListener('keyup', function(event){
    initializeSearch(function(index){
      var results = search(event.target.value, index)

      displayResults(results)
    })

  })
  
})()