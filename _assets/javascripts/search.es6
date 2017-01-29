var search = (function(){
  var init = function(){
    bindFunctions();
  };

  var bindFunctions = function(){
    $("#search_input").on("keyup", displaySearchResults);
  };

  // Variables
  var posts_all = [],
      posts = [];

  // Templates
  var post_preview = function(post) {
    return `
      <article class="blog-post">
        <h1 class="padding-20">
          <a href="${post.url}">${post.title}</a>
        </h1>
        <div class="padding-20">
          ${post.content_truncated}<br><br>
          <a href="${post.url}" class="editable"><b>Weiterlesen ...</b></a>
        </div><!-- post.body -->
        <small>- ${post.date} :: ${post.author}</small>
      </article>`;
  };
  var empty_result = function(search_word) {
    return `
      <article class="blog-post">
        <h2 class="padding-20">
          Leider konnten keine Artikel mit dem Suchbegriff "${search_word}" gefunden werden. Bitte versuchen Sie einen anderen Begriff.
        </h2>
        <a href="/blog" class="padding-20">Alle Artikel laden</a>
      </article>`;
  };

  // Methods
  var getPosts = function(callback){
    $.getJSON("/blog/posts-api.json", function(data){
      callback(data);
    });
  };

  var initLunr = function(search_value, initLunr_callback){
    var index = elasticlunr(function(){
      this.addField('title');
      this.addField('content');
      this.setRef('id');
    });

    getPosts(function(data){
      posts_all = data;

      data.forEach(function(post, i){
        index.addDoc({
          "id" : i,
          "title" : post.title,
          "content" : post.content
        });
      });

      initLunr_callback(index);
    });
  };

  var startSearch = function(search_value, startSearch_callback){
    initLunr(search_value, function(index){
      var results = index.search(search_value, {
        fields: {
          title: {boost: 2},
          content: {boost: 1}
        }
      });
      startSearch_callback(results);
    });
  };

  var displayContent = function(content) {
    $("#blog").addClass("changing");
    setTimeout(function(){
      $("#blog").children().remove();
      content();
      $("#blog").removeClass("changing");
    }, 333);
  };

  var displaySearchResults = function(e){
    if (e.keyCode == 13) {
      var search_word = $("#search_input").val();
      startSearch(search_word, function(results){
        posts = []; // reset search
        // Find posts with result id
        for(let result of results){
          var post = posts_all[parseInt(result.ref)];
          posts.push(post);
        } // for

        displayContent(function(){
          if(posts.length > 0){
            // Results exist
            for(let post of posts){
              $("#blog").append(post_preview(post));
            }
          }else{
            // No results found
            $("#blog").append(empty_result(search_word));
          }; // if
        }); // displayContent
      }); // startSearch
    } // if
  };

  return {
    init: init
  };
})();
