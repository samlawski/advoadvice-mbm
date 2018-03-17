var schufaTool = (function(){
  var thisState = {}

  var init = function(){
    initializeState()
    renderAndBind()
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

  var renderAndBind = function(){
    var slideToRender = thisState.$slides[thisState.progress]
    thisState.$app.html(slideToRender.html())
    bindFunctions()
  }

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

  var checkRerender = function(){
    reloadSlide()
    reloadProgress()


    function reloadSlide(){
      if(thisState.$app.data('progress') != thisState.progress){
        console.log('Rerendering Slide', thisState)
      }else{
        console.log('not rerendering slide', thisState)
      }
    }

    function reloadProgress(){
      let categorySelected = thisState.category.length > 0
      if(categorySelected){
        console.log('Rerendering Progress', thisState)
        $('.schufaTool__progress--next').show()
      }else{
        console.log('not rerendering progress', thisState)
      }
    }
  }

  return {
    init: init
  }
})();
