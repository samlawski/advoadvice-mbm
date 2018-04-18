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
    thisState.quiz = {}
    thisState.auswertung = {}
    thisState.formContact = {}
    thisState.$app = $('.schufaTool')
    thisState.$slides = [$('.schufaTool__slide--0')]
    thisState.$removedSlides = []
  }

  var initialBindFunctions = function(){
    $('.schufaTool__progressBtn').click(onProgressClick)
  }

  var onProgressClick = function(){
    console.log('ProgressClick', thisState)
    if($(this).hasClass('disabled')) return
    // Copy state of current slide into the slides array (including form values)
    thisState.$slides.splice(thisState.progress, 1, thisState.$app.children().clone())
    // Slide Specific logic:
    runSlideLogic(thisState.progress, thisState.category, 'beforeExit')
    // Set new progress state
    let summand = $(this).hasClass('schufaTool__progress--next') ? 1 : -1
    thisState.progress += summand
    // Slide Specific logic:
    runSlideLogic(thisState.progress, thisState.category, 'beforeInit')
    // Rerender view
    checkRerender()
  }

  // ***** Events *****

  var bindFunctions = function(){
    thisState.$app.children().off()
    thisState.$app.find('.schufaTool__categoryBtn').click(onCategoryClick)
    thisState.$app.find('input').on('keyup change click', onFormKeyUp)
  }

  var onCategoryClick = function(){
    thisState.category = $(this).data('category')
    thisState.$removedSlides = [] // reset
    thisState.$slides = slideTemplates[thisState.category].map(selectorString => {
      // Select and clone templates from DOM
      return $('.schufaTool__templates').find(selectorString).clone()
    })
    // Toggle views:
    thisState.$app.find('.schufaTool__categoryBtn').removeClass('active')
    $(this).addClass('active')
    checkRerender()
  }

  var onFormKeyUp = function(){
    if(!formPresent()) return
    // Update state with data from the form:
    updateStateFromQuiz()
    checkRerender()
  }

  // ***** Private *****

  var formPresent = () => thisState.$app.find('form').length > 0

  var renderAndBind = function(){
    var slideToRender = thisState.$slides[thisState.progress]
    thisState.$app.html('')
    thisState.$app.append(slideToRender)
    // thisState.$app.html(slideToRender.children())
    thisState.$app.data('progress', thisState.progress) // update progress
    thisState.$app = $(thisState.$app.selector) // reload state variable
    // Slide Specific logic:
    runSlideLogic(thisState.progress, thisState.category, 'afterRender')
    bindFunctions()
  }

  var checkRerender = function(){
    reloadSlide()
    if(thisState.progress < (thisState.$slides.length - 1)){
      reloadProgressButtons()
    }else{
      hideProgressButtonsOnFinalSlide()
    }

    function reloadSlide(){
      let progressDifferent = thisState.$app.data('progress') != thisState.progress
      if(progressDifferent) renderAndBind()
    }
    function reloadProgressButtons(){
      let categorySelected = thisState.category.length > 0
      let allRequiredFieldsFilled = () => {
        if(!formPresent()) return true

        let formFieldArray = thisState.$app.find('.form-group').map(function(){
          // For each form group check if it contains a required input field
          if($(this).find('[type="radio"][required]').length > 1){
            return $(this).find('[type="radio"][required]').is(':checked')
          }else if($(this).find('input[required]').length > 1){
            return $(this).find('input[required]').val().trim() > 0
          }else{
            // in case there is no required field in the form group
            return true
          }
        })
        // Return true if no element in the array is 'false'
        return Array.from(formFieldArray).indexOf(false) < 0
      }
      $('.schufaTool__progress--next').toggleClass('disabled', !(categorySelected && allRequiredFieldsFilled()))
      $('.schufaTool__progress--prev').toggleClass('disabled', !(thisState.progress > 0))
    }
    function hideProgressButtonsOnFinalSlide(){
      $('.schufaTool__progressBtn').hide()
    }
  }

  var updateStateFromQuiz = function(){
    thisState.quiz[thisState.category] = thisState.$app.find('form').serializeArray().map(obj => {
      return {
        frage: $(`.schufaTool [for="${obj.name}"]`).text().trim(),
        antwort: obj.value
      }
    })
  }

  // ***** Slide Specific Logic *****
  const slideLogic = {
    negativeintrag: {
      '1': {
        beforeExit: () => {
          // Set Auswertung
          thisState.auswertung = getAuswertungBasedOnQuizAnswers()
          // Remove Auswertungsslide if there is no Auswertung
          if (thisState.auswertung.length < 1 &&
            thisState.$slides[2].hasClass('schufaTool__category--negativeintrag--2')){
            // Auswertung should disappear
            thisState.$removedSlides = thisState.$slides.splice(2, 1)
          }else if(thisState.auswertung.length > 0 &&
            !thisState.$slides[2].hasClass('schufaTool__category--negativeintrag--2')){
            // Auswertung should appear
            thisState.$slides.splice(2, 0, ...thisState.$removedSlides)
            thisState.$removedSlides = []
          }

          // Private Functions
          function getAuswertungBasedOnQuizAnswers(){
            try {
              let answeredYes = i => thisState.quiz[thisState.category][i].antwort == "Ja"
              let answeredNo = i => thisState.quiz[thisState.category][i].antwort == "Nein"
              let answerArray = []

              if(answeredYes(2)) answerArray.push(".schufaTool__negativeintrag__auskunft--a")
              if(answeredNo(2) && answeredNo(8) && answeredNo(10)) answerArray.push(".schufaTool__negativeintrag__auskunft--b")
              if(answeredYes(8) && answeredYes(10)) answerArray.push(".schufaTool__negativeintrag__auskunft--c")

              return answerArray
            }catch(e){
              return []
            }
          } // /getAuswertungBasedOnQuizAnswers
        } // /beforeExit
      },
      '2': {
        afterRender: () => {
          if(thisState.$app.find('.schufaTool__category--negativeintrag--2').length > 0){
            // Show correct auswertung
            thisState.$app.find('.schufaTool__auskunft').hide()
            thisState.auswertung.map(answerClass => thisState.$app.find(answerClass).show())
          }else{
            // Looking at the kontakt form:
            $('.schufaTool__progress--next').text('Abschicken')
          }
        },
        beforeExit: () => {
          // TODO Send Quiz here!? IF this is the contact slide
          $('.schufaTool__progress--next').text('Weiter')
        }
      },
      '3': {
        afterRender: () => {
          $('.schufaTool__progress--next').text('Abschicken')
        },
        beforeExit: () => {
          // TODO Send Quiz here!? IF this is the contact slide
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    },
    score: {
      '2': {
        afterRender: () => {
          try {
            thisState.$app.find('.schufaTool__auskunft').hide()

            switch(thisState.quiz[thisState.category][2].antwort){
              case '>95%':
                thisState.$app.find('.schufaTool__score__auskunft--a').show()
                break;
              case '90%-95%':
                thisState.$app.find('.schufaTool__score__auskunft--b').show()
                break;
              case '80%-90%':
                thisState.$app.find('.schufaTool__score__auskunft--c').show()
                break;
              case '<80%':
                thisState.$app.find('.schufaTool__score__auskunft--d').show()
                break;
            }
          }catch(e){
            console.log(e)
          }
        },
        beforeExit: () => {
          // Remove rest of the game for the first answer
          if(thisState.quiz[thisState.category][2].antwort == '>95%'){
            // Remove final slides
            thisState.$slides.splice(3, 2)
            // Add placeholder slide at end
            thisState.$slides.push($('.schufaTool__templates .schufaTool__slide--2').clone())
          }
        }
      },
      '3': {
        afterRender: () => {
          $('.schufaTool__progress--next').text('Abschicken')
        },
        beforeExit: () => {
          // TODO Send Quiz here!? IF this is the contact slide
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    },
    fraud: {},
    veraltet: {},
    restschuld: {},
    verzeichnisse: {}
  }

  const runSlideLogic = (progressIndex, category, action) => {
    try{
      // Available Actions: 'beforeInit', 'beforeExit', 'afterRender'
      slideLogic[category][progressIndex][action]()
    }catch(e){
      // Uncomment for debugging
      // console.log(e, 'Could not find action for: ', progressIndex, category, action)
    }
  }

  // ***** Constants *****

  const slideTemplates = {
    negativeintrag: [
      '.schufaTool__slide--0',
      '.schufaTool__category--negativeintrag--1',
      '.schufaTool__category--negativeintrag--2',
      '.schufaTool__slide--1',
      '.schufaTool__category--negativeintrag--3'
    ],
    score: [
      '.schufaTool__slide--0',
      '.schufaTool__category--score--1',
      '.schufaTool__category--score--2',
      '.schufaTool__slide--1',
      '.schufaTool__category--score--3'
    ],
    fraud: [
      '.schufaTool__slide--0',
      '.schufaTool__category--fraud--1',
      '.schufaTool__category--fraud--2',
      '.schufaTool__slide--1',
      '.schufaTool__category--fraud--3'
    ],
    veraltet: [
      '.schufaTool__slide--0',
      '.schufaTool__slide--1'
    ],
    restschuld: [
      '.schufaTool__slide--0',
      '.schufaTool__slide--1'
    ],
    verzeichnisse: [
      '.schufaTool__slide--0',
      '.schufaTool__slide--1'
    ]
  }

  return {
    init: init
  }
})()
