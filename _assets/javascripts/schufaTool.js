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
    thisState.$slides = [$('.schufaTool__slide--0')]
  }

  var initialBindFunctions = function(){
    $('.schufaTool__progressBtn').click(onProgressClick)
  }

  var onProgressClick = function(){
    let summand = $(this).hasClass('schufaTool__progress--next') ? 1 : -1
    thisState.progress += summand
    checkRerender()
  }

  // ***** Events *****

  var bindFunctions = function(){
    thisState.$app.children().off()
    thisState.$app.find('.schufaTool__categoryBtn').click(onCategoryClick)
  }

  var onCategoryClick = function(){
    thisState.category = $(this).data('category')
    thisState.$slides = slideTemplates[thisState.category]
    $('.schufaTool__categoryBtn').removeClass('active')
    $(this).addClass('active')
    checkRerender()
  }

  // ***** Private *****

  var renderAndBind = function(){
    var slideToRender = thisState.$slides[thisState.progress]
    thisState.$app.html(slideToRender.html())
    thisState.$app.data('progress', thisState.progress) // update progress
    thisState.$app = $(thisState.$app.selector) // reload variable
    bindFunctions()
  }

  var checkRerender = function(){
    reloadSlide()
    reloadProgress()

    function reloadSlide(){
      let progressDifferent = thisState.$app.data('progress') != thisState.progress
      if(progressDifferent) renderAndBind()
    }
    function reloadProgress(){
      let categorySelected = thisState.category.length > 0
      $('.schufaTool__progress--next').toggle(categorySelected)
      $('.schufaTool__progress--prev').toggle(thisState.progress > 0)
    }
  }

  // ***** Constants *****

  const slideTemplates = {
    negativeintrag: [
      $('.schufaTool__slide--0'),
      $('.schufaTool__category--negativeintrag--1'),
      $('.schufaTool__category--negativeintrag--2'),
      $('.schufaTool__slide--1'),
      $('.schufaTool__slide--2')
    ],
    score: [
      $('.schufaTool__slide--0'),
      $('.schufaTool__category--score--1'),
      $('.schufaTool__slide--1')
    ],
    fraud: [
      $('.schufaTool__slide--0'),
      $('.schufaTool__slide--1')
    ],
    veraltet: [
      $('.schufaTool__slide--0'),
      $('.schufaTool__slide--1')
    ],
    restschuld: [
      $('.schufaTool__slide--0'),
      $('.schufaTool__slide--1')
    ],
    verzeichnisse: [
      $('.schufaTool__slide--0'),
      $('.schufaTool__slide--1')
    ]
  }

  return {
    init: init
  }
})()
