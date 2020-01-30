/* README
How to edit slides:
In the schufa-beratung.html you define each slide template.

If you need to add or remove slides, you have to add, remove the HTML class
names of the given slide in the `slideTemplates` constant down below.

Additionally, you have to edit the `slideLogic` constant to make sure, each
slide's specific JS code is considered.

Available callback methods are `afterRender` and `beforeExit`. You can use
these callback methods for each slide to define what code is supposed to run
either after the HTML of the slide is rendered or after either of the progress
buttons is clicked and just before the next slide is rendered (beforeExit).

*/

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
    thisState.formContact = []
    thisState.$app = $('.schufaTool')
    thisState.$slides = [$('.schufaTool__slide--0')]
    thisState.$removedSlides = []
  }

  var initialBindFunctions = function(){
    $('.schufaTool__progressBtn').click(onProgressClick)
  }

  var onProgressClick = function(){
    if($(this).hasClass('disabled')) return
    // Copy state of current slide into the slides array (including form values)
    copyCurrentSlideToState()
    // Slide Specific logic:
    runSlideLogic(thisState.progress, thisState.category, 'beforeExit')
    // Set new progress state
    var summand = $(this).hasClass('schufaTool__progress--next') ? 1 : -1
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
    thisState.$slides = slideTemplates[thisState.category].map(function(selectorString){
      // Select and clone templates from DOM
      return $('.schufaTool__templates').find(selectorString).clone()
    })
    // Toggle views:
    thisState.$app.find('.schufaTool__categoryBtn').removeClass('active')
    $(this).addClass('active')
    // Move forward to next slide immediately:
    copyCurrentSlideToState()
    thisState.progress += 1
    checkRerender()
  }

  var onFormKeyUp = function(){
    if(!formPresent()) return
    // Update state with data from the form:
    updateStateFromForm(
      $(this).closest('form').hasClass('schufaTool__form--kontakt')
    )
    checkRerender()
  }

  // ***** Private *****

  var formPresent = function() { return thisState.$app.find('form').length > 0 }
  var finalSlide = function() { return thisState.progress >= (thisState.$slides.length - 1) }
  var questionAnswerString = function(frage) {
    var questionObject = thisState.quiz[thisState.category].find(function(obj){return obj.frage == frage})
    return (typeof questionObject == 'undefined') ? false : questionObject.antwort
  }
  var questionAnswer = function(frage, antwort) { return questionAnswerString(frage) == antwort }

  var copyCurrentSlideToState = function(){
    thisState.$slides.splice(thisState.progress, 1, thisState.$app.children().clone())
  }

  var renderAndBind = function(){
    var slideToRender = thisState.$slides[thisState.progress]
    thisState.$app.html('')
    thisState.$app.append(slideToRender)
    // thisState.$app.html(slideToRender.children())
    thisState.$app.data('progress', thisState.progress) // update progress
    thisState.$app = $(thisState.$app.selector) // reload state variable
    // Slide Specific logic:
    runSlideLogic(thisState.progress, thisState.category, 'afterRender')
    scrollToTop()
    bindFunctions()
  }

  var scrollToTop = function(){
    $('html, body').animate({
      scrollTop: 0
    }, 500);
  }

  var checkRerender = function(){
    reloadSlide()
    finalSlide() ? hideProgressButtonsOnFinalSlide() : reloadProgressButtons()

    function reloadSlide(){
      var progressDifferent = thisState.$app.data('progress') != thisState.progress
      if(progressDifferent) renderAndBind()
    }
    function reloadProgressButtons(){
      var categorySelected = thisState.category.length > 0
      var allRequiredFieldsFilled = function(){
        if(!formPresent()) return true
        var formFieldArray = thisState.$app.find('.form-group').map(function(){
          // For each form group check if it contains a required input field
          if($(this).find('[type="radio"][required]').length > 0){
            return $(this).find('[type="radio"][required]').is(':checked')
          }else if($(this).find('[type="checkbox"][required]').length > 0){
            return $(this).find('[type="checkbox"][required]').is(':checked')
          }else if($(this).find('input[required]').length > 0){
            return $(this).find('input[required]').val().trim().length > 0
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

  var updateStateFromForm = function(isContactForm){
    if(isContactForm){
      thisState.formContact = serializedObjectFromForm()
    }else{
      if(typeof thisState.quiz[thisState.category] == 'undefined'){
        thisState.quiz[thisState.category] = serializedObjectFromForm()
      }else{
        addOrReplace(thisState.quiz[thisState.category], serializedObjectFromForm())
      }
    }
  }

  var addOrReplace = function(originalArray, newArray){
    newArray.map(function(newObj){
      var indexOfQuestion = originalArray.map(function(obj){return obj.frage}).indexOf(newObj.frage)
      return (indexOfQuestion < 0) ? originalArray.push(newObj) : originalArray.splice(indexOfQuestion, 1, newObj)
    })
  }

  var serializedObjectFromForm = function(){
    return thisState.$app.find('form').serializeArray().map(function(obj) {
      return {
        frage: $('.schufaTool [for="' + obj.name + '"]').text().trim(),
        antwort: obj.value
      }
    })
  }

  // ***** Submit *****
  var submit = function(){
    var stringOfContactState = thisState.formContact
      .filter(function(obj){return obj.antwort.length > 0})
      .map(function(obj){return obj.frage + ": " + obj.antwort + " |\n"})
      .join('')
    var stringOfQuizState = Object.values(thisState.quiz)
      .map(function(quiz){
        return quiz.filter(function(obj){return obj.antwort.length > 0})
          .map(function(obj){return obj.frage + ": " + obj.antwort + " |\n"})
          .join('')
      }).join('')
    var messageString = thisState.formContact[0].antwort + ' hat den Vorabcheck durchgeführt und folgende Dinge ausgefüllt: \n\n\n ' + stringOfContactState + ' ||\n\n ' + stringOfQuizState
    var $finalForm = $('.schufaTool__finalForm')

    $finalForm.find('[name="antworten"]').val(messageString)
    $.post($finalForm.attr("action"), $finalForm.serialize()).then(function(r) {
      console.log('Form submitted!', $finalForm.serialize())
    })
  }

  // ***** Slide Specific Logic *****
  var slideLogic = {
    negativeintrag: {
      '1': {
        beforeExit: function(){
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
              var answeredYes = function(i){return thisState.quiz[thisState.category][i].antwort == "Ja"}
              var answeredNo = function(i){return thisState.quiz[thisState.category][i].antwort == "Nein"}
              var answerArray = []

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
        afterRender: function(){
          if(thisState.$app.find('.schufaTool__category--negativeintrag--2').length > 0){
            // Show correct auswertung
            thisState.$app.find('.schufaTool__auskunft').hide()
            thisState.auswertung.map(function(answerClass){return thisState.$app.find(answerClass).show()})
          }else{
            // Looking at the kontakt form:
            $('.schufaTool__progress--next').text('Abschicken')
          }
        },
        beforeExit: function(){
          if(thisState.$app.find('.schufaTool__form--kontakt').length > 0) submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      },
      '3': {
        afterRender: function(){
          $('.schufaTool__progress--next').text('Abschicken')
        },
        beforeExit: function(){
          if(thisState.$app.find('.schufaTool__form--kontakt').length > 0) submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    },
    score: {
      '1': {
        beforeExit: function(){
          if(thisState.quiz[thisState.category][0].antwort == 'Nein' &&
            thisState.$slides[2].hasClass('schufaTool__category--score--1a')){
            // Remove the follow up questions slide
            thisState.$removedSlides = thisState.$slides.splice(2, 1)
          }else if(thisState.quiz[thisState.category][0].antwort == 'Ja' &&
            !thisState.$slides[2].hasClass('schufaTool__category--score--1a')){
            // Add missing slide
            thisState.$slides.splice(2, 0, ...thisState.$removedSlides)
            thisState.$removedSlides = []
          }
        }
      },
      '2': {
        afterRender: function(){
          try {
            thisState.$app.find('.schufaTool__auskunft').hide()

            switch(questionAnswerString("Welchen Basis-Scorewert hat die Schufa Holding AG zu Ihrer Person errechnet?")){
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
            // console.log(e)
          }
        },
        beforeExit: function(){
          // Remove rest of the game for the first answer
          if(thisState.$app.find('.schufaTool__category--score--2') &&
            thisState.quiz[thisState.category][2].antwort == '>95%' &&
            thisState.quiz[thisState.category][0].antwort == 'Nein'){
            // Remove final slides
            thisState.$slides.splice(3, 2)
            // Add placeholder slide at end
            thisState.$slides.push($('.schufaTool__templates .schufaTool__slide--2').clone())
          }
        }
      },
      '3': {
        afterRender: function(){
          // If this is auswertungsslide
          try {
            thisState.$app.find('.schufaTool__auskunft').hide()

            switch(questionAnswerString("Welchen Basis-Scorewert hat die Schufa Holding AG zu Ihrer Person errechnet?")){
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
            // console.log(e)
          }
          // If this is contact slide
          if(thisState.$app.find('.schufaTool__form--kontakt').length > 0){
            $('.schufaTool__progress--next').text('Abschicken')
          }
        },
        beforeExit: function(){
          // In case this is not yet contact but just auswertungsslide
          if(thisState.$app.find('.schufaTool__category--score--2') &&
            thisState.quiz[thisState.category][2].antwort == '>95%' &&
            thisState.quiz[thisState.category][0].antwort == 'Nein'){
            // Remove final slides
            thisState.$slides.splice(3, 2)
            // Add placeholder slide at end
            thisState.$slides.push($('.schufaTool__templates .schufaTool__slide--2').clone())
          }
          // Contact submit
          if(thisState.$app.find('.schufaTool__form--kontakt').length > 0) submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      },
      '4': {
        afterRender: function(){
          if(thisState.$app.find('.schufaTool__form--kontakt').length > 0){
            $('.schufaTool__progress--next').text('Abschicken')
          }
        },
        beforeExit: function(){
          if(thisState.$app.find('.schufaTool__form--kontakt').length > 0) submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    },
    fraud: {
      '1': {
        beforeExit: function(){
          if(thisState.quiz[thisState.category].map(function(obj){return obj.antwort}).indexOf('Ja') < 0){
            // If both questions answered with no: insert last placeholder slide
            // Remove final slides and replace it with the final slide
            var $finalSlide = $('.schufaTool__templates').find('.schufaTool__category--fraud--5').clone()
            thisState.$slides.splice(2, 4, $finalSlide)
          }
        }
      },
      '2': {
        afterRender: function(){
          if(finalSlide()) return

          $('.schufaTool__form--fraud__placeholder').html('') // reset form
          // Insert form for the corresponding answer of the previous slide
          if(thisState.quiz[thisState.category][0].antwort == "Ja"){
            thisState.$app.find('[name="fraud__91"]').val('Ja')
            var $identitaetsForm = $('.schufaTool__templates').find('.schufaTool__form--fraud--a').clone()
            $('.schufaTool__form--fraud__placeholder').append($identitaetsForm)
          }
          if(thisState.quiz[thisState.category][1].antwort == "Ja"){
            thisState.$app.find('[name="fraud__92"]').val('Ja')
            var $fraudForm = $('.schufaTool__templates').find('.schufaTool__form--fraud--b').clone()
            $('.schufaTool__form--fraud__placeholder').append($fraudForm)
          }
        },
        beforeExit: function(){
          if(questionAnswer('Identitätsdiebstahl: Wurde in Folge des Identitätsdiebstahls ein negativer Schufa Eintrag eingemeldet?', 'Nein')){
            var $finalSlide = $('.schufaTool__templates').find('.schufaTool__category--fraud--4').clone()
            thisState.$slides.splice(3, 3, $finalSlide)
          }
        }
      },
      '3': {
        afterRender: function(){
          if(finalSlide()) return

          thisState.$app.find('.schufaTool__auskunft').hide()
          if(questionAnswer('Identitätsdiebstahl: Wurde in Folge des Identitätsdiebstahls ein negativer Schufa Eintrag eingemeldet?', 'Ja')){
            thisState.$app.find('.schufaTool__fraud__auskunft--a').show()
          }
          if(questionAnswer('Handelt es sich um ein Merkmal im sog. FraudPool?', 'Ja')){
            thisState.$app.find('.schufaTool__fraud__auskunft--b').show()
          }
          if(questionAnswer('FraudPool: Ist Ihnen der dazugehörige Sachverhalt bekannt?', 'Ja')){
            thisState.$app.find('.schufaTool__fraud__auskunft--c').show()
          }
          if(questionAnswer('FraudPool: Ist Ihnen der dazugehörige Sachverhalt bekannt?', 'Nein')){
            thisState.$app.find('.schufaTool__fraud__auskunft--d').show()
          }
        }
      },
      '4': {
        afterRender: function(){
          $('.schufaTool__progress--next').text('Abschicken')
        },
        beforeExit: function(){
          submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    },
    veraltet: {
      '2': {
        afterRender: function(){
          try {
            thisState.$app.find('.schufaTool__auskunft').hide()

            switch(thisState.quiz[thisState.category][0].antwort){
              case '>95%':
                thisState.$app.find('.schufaTool__veraltet__auskunft--a').show()
                break;
              case '90%-95%':
                thisState.$app.find('.schufaTool__veraltet__auskunft--b').show()
                break;
              case '80%-90%':
                thisState.$app.find('.schufaTool__veraltet__auskunft--c').show()
                break;
              case '<80%':
                thisState.$app.find('.schufaTool__veraltet__auskunft--d').show()
                break;
            }
          }catch(e){
            // console.log(e)
          }
        },
        beforeExit: function(){
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
        afterRender: function(){
          $('.schufaTool__progress--next').text('Abschicken')
        },
        beforeExit: function(){
          submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    },
    restschuld: {
      '2': {
        afterRender: function(){
          $('.schufaTool__progress--next').text('Abschicken')
        },
        beforeExit: function(){
          submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    },
    verzeichnisse: {
      '1': {
        beforeExit: function(){
          if(thisState.quiz[thisState.category][0].antwort == 'Nein'){
            // Remove final slides
            thisState.$slides.splice(2, 3)
            // Add placeholder slide at end
            thisState.$slides.push($('.schufaTool__templates .schufaTool__category--verzeichnisse--3').clone())
          }
        }
      },
      '3': {
        afterRender: function(){
          $('.schufaTool__progress--next').text('Abschicken')
        },
        beforeExit: function(){
          submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    }
  }

  var runSlideLogic = function(progressIndex, category, action){
    try{
      // Available Actions: 'beforeInit', 'beforeExit', 'afterRender'
      slideLogic[category][progressIndex][action]()
    }catch(e){
      // Uncomment for debugging
      // console.log(e, 'Could not find action for: ', progressIndex, category, action)
    }
  }

  // ***** Constants *****

  var slideTemplates = {
    negativeintrag: [
      '.schufaTool__slide--0',
      '.schufaTool__category--negativeintrag--1',
      '.schufaTool__category--negativeintrag--2',
      '.schufaTool__slide--1',
      '.schufaTool__slide--3'
    ],
    score: [
      '.schufaTool__slide--0',
      '.schufaTool__category--score--1',
      '.schufaTool__category--score--1a',
      '.schufaTool__category--score--2',
      '.schufaTool__slide--1',
      '.schufaTool__slide--3'
    ],
    fraud: [
      '.schufaTool__slide--0',
      '.schufaTool__category--fraud--1',
      '.schufaTool__category--fraud--2',
      '.schufaTool__category--fraud--3',
      '.schufaTool__slide--1',
      '.schufaTool__slide--3'
    ],
    veraltet: [
      '.schufaTool__slide--0',
      '.schufaTool__category--veraltet--1',
      '.schufaTool__category--veraltet--2',
      '.schufaTool__slide--1',
      '.schufaTool__slide--3'
    ],
    restschuld: [
      '.schufaTool__slide--0',
      '.schufaTool__category--restschuld--1',
      '.schufaTool__slide--1',
      '.schufaTool__slide--3'
    ],
    verzeichnisse: [
      '.schufaTool__slide--0',
      '.schufaTool__category--verzeichnisse--1',
      '.schufaTool__category--verzeichnisse--2',
      '.schufaTool__slide--1',
      '.schufaTool__slide--3'
    ]
  }

  return {
    init: init
  }
})()

schufaTool.init()