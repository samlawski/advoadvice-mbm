var schufaTool = (function(){
  var thisState = {}

  var init = function(){
    initializeState()
    renderAndBind()
    initialBindFunctions()
  }

  var initializeState = function(){
    thisState.progress = 0
    thisState.category = ''
    thisState.$app = $('.schufaTool')
    thisState.$slides = []
    $('.schufaTool__slide').each((i, slideHtml) => {
      thisState.$slides.push($(slideHtml))
    })
  }

  var initialBindFunctions = function(){
    $('.schufaTool__progressBtn').click(onProgressClick)
  }

  // ***** Events *****

  var bindFunctions = function(){
    thisState.$app.children().off()
    thisState.$app.find('.schufaTool__categoryBtn').click(onCategoryClick)
  }

  var onCategoryClick = function(){
    thisState.category = $(this).data('category')
    $('.schufaTool__categoryBtn').removeClass('active')
    $(this).addClass('active')
    checkRerender()
  }
  var onProgressClick = function(){
    let summand = $(this).hasClass('schufaTool__progress--next') ? 1 : -1
    thisState.progress += summand
    checkRerender()
  }

  // ***** Private *****

  var renderAndBind = function(){
    var slideToRender = thisState.$slides[thisState.progress]
    thisState.$app.html(slideToRender.html())
    bindFunctions()
  }

  var checkRerender = function(){
    reloadSlide()
    reloadProgress()

    function reloadSlide(){
      if(thisState.$app.data('progress') != thisState.progress){
        console.log('Rerendering Slide', thisState)
        renderAndBind()
      }else{
        console.log('not rerendering slide', thisState)
      }
    }
    function reloadProgress(){
      let categorySelected = thisState.category.length > 0
      $('.schufaTool__progress--next').toggle(categorySelected)
      $('.schufaTool__progress--prev').toggle(thisState.progress > 0);
    }
  }

  return {
    init: init
  }
})();
