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
    thisState.formContact = {}
    thisState.$app = $('.schufaTool')
    thisState.$slides = [$('.schufaTool__slide--0')]
  }

  var initialBindFunctions = function(){
    $('.schufaTool__progressBtn').click(onProgressClick)
  }

  var onProgressClick = function(){
    if($(this).hasClass('disabled')) return
    // Copy state of current slide into the slides array (including form values)
    thisState.$slides.splice(thisState.progress, 1, thisState.$app.clone())
    // Update Auswertung
    thisState.auswertung = checkAuswertung()
    // Set new progress state
    let summand = $(this).hasClass('schufaTool__progress--next') ? 1 : -1
    thisState.progress += summand
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
    thisState.$slides = slideTemplates[thisState.category]
    // Toggle views:
    $('.schufaTool__categoryBtn').removeClass('active')
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
  var auswertungPresent = () => thisState.$app.find('.schufaTool__auswertung').length > 0

  var renderAndBind = function(){
    var slideToRender = thisState.$slides[thisState.progress]
    thisState.$app.html(slideToRender.children())
    thisState.$app.data('progress', thisState.progress) // update progress
    thisState.$app = $(thisState.$app.selector) // reload state variable
    showCorrectAuswertung() // if viewing auswertungsslide
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
  }

  var updateStateFromQuiz = function(){
    thisState.quiz[thisState.category] = $('.schufaTool form').serializeArray().map(obj => {
      return {
        frage: $(`.schufaTool [for="${obj.name}"]`).text().trim(),
        antwort: obj.value
      }
    })
  }

  var showCorrectAuswertung = function(){
    if(!auswertungPresent()) return true
    $('.schufaTool__auskunft').hide()
    thisState.auswertung.map(answerClass => $(answerClass).show())
  }

  var checkAuswertung = () => slideAuswertung[thisState.category]()

  // ***** Constants *****

  const slideTemplates = {
    negativeintrag: [
      $('.schufaTool__slide--0'),
      $('.schufaTool__category--negativeintrag--1'),
      $('.schufaTool__category--negativeintrag--2'),
      $('.schufaTool__slide--1'),
      $('.schufaTool__category--negativeintrag--3')
    ],
    score: [
      $('.schufaTool__slide--0'),
      $('.schufaTool__category--score--1'),
      $('.schufaTool__category--score--2'),
      $('.schufaTool__slide--1'),
      $('.schufaTool__category--score--3')
    ],
    fraud: [
      $('.schufaTool__slide--0'),
      $('.schufaTool__category--fraud--1'),
      $('.schufaTool__category--fraud--2'),
      $('.schufaTool__slide--1'),
      $('.schufaTool__category--fraud--3')
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

  const slideAuswertung = {
    negativeintrag: () => {
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
    },
    score: () => false,
    fraud: () => false,
    veraltet: () => false,
    restschuld: () => false,
    verzeichnisse: () => false
  }

  return {
    init: init
  }
})()
