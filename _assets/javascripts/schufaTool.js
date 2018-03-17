var schufaTool = (function(){
  var thisState = {}

  var init = function(){
    initializeState()
    renderAndBind()
  }

  var initializeState = function(){
    thisState.progress = 0
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
    console.log(thisState)
  }

  var bindFunctions = function(){
    thisState.$app.children().off()
  }




  return {
    init: init
  }
})();
