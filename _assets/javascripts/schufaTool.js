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
    $('.schufaTool__finalForm').submit(onFinalFormSubmit)
    $('.schufaTool__progressBtn').click(onProgressClick)
  }

  var onFinalFormSubmit = function(e){
    e.preventDefault()

    var $form = $(this)
    console.log(e, this, $form)
    $.post($form.attr("action"), $form.serialize()).then(function() {
      console.log('Form submitted!')
    })
  }

  var onProgressClick = function(){
    if($(this).hasClass('disabled')) return
    // Copy state of current slide into the slides array (including form values)
    copyCurrentSlideToState()
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

  var formPresent = () => thisState.$app.find('form').length > 0
  var finalSlide = () => thisState.progress >= (thisState.$slides.length - 1)
  var questionAnswerString = (frage) => {
    let questionObject = thisState.quiz[thisState.category].find(obj => obj.frage == frage)
    return (typeof questionObject == 'undefined') ? false : questionObject.antwort
  }
  var questionAnswer = (frage, antwort) => questionAnswerString(frage) == antwort

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
      let progressDifferent = thisState.$app.data('progress') != thisState.progress
      if(progressDifferent) renderAndBind()
    }
    function reloadProgressButtons(){
      let categorySelected = thisState.category.length > 0
      let allRequiredFieldsFilled = () => {
        if(!formPresent()) return true
        let formFieldArray = thisState.$app.find('.form-group').map(function(){
          // For each form group check if it contains a required input field
          if($(this).find('[type="radio"][required]').length > 0){
            return $(this).find('[type="radio"][required]').is(':checked')
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

  var updateStateFromForm = isContactForm => {
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
    newArray.map(newObj => {
      var indexOfQuestion = originalArray.map(obj => obj.frage).indexOf(newObj.frage)
      return (indexOfQuestion < 0) ? originalArray.push(newObj) : originalArray.splice(indexOfQuestion, 1, newObj)
    })
  }

  var serializedObjectFromForm = () => {
    return thisState.$app.find('form').serializeArray().map(obj => {
      return {
        frage: $(`.schufaTool [for="${obj.name}"]`).text().trim(),
        antwort: obj.value
      }
    })
  }

  // ***** Submit *****
  const submit = () => {
    var answerTemplate = (frage, antwort) => `<input type='hidden' name='${frage}' value='${antwort}' />`
    var $finalForm = $('.schufaTool__finalForm')
    // Add contact values to form
    thisState.formContact
      .filter(obj => obj.antwort.length > 0)
      .map(obj => $finalForm.append(answerTemplate(obj.frage, obj.antwort)))
    // Add quiz results to form
    Object.values(thisState.quiz)
      .map(quiz => {
        return quiz
          .filter(obj => obj.antwort.length > 0)
          .map(obj => $finalForm.append(answerTemplate(obj.frage, obj.antwort)))
      })

    $finalForm.submit()

    // MailthisTo
    // var stringOfContactState = thisState.formContact
    //   .filter(obj => obj.antwort.length > 0)
    //   .map(obj => `${obj.frage}: ${obj.antwort} |\n`)
    //   .join('')
    // var stringOfQuizState = Object.values(thisState.quiz)
    //   .map(quiz => {
    //     return quiz.filter(obj => obj.antwort.length > 0)
    //       .map(obj => `${obj.frage}: ${obj.antwort} |\n`)
    //       .join('')
    //   }).join('')
    // var messageString = `${thisState.formContact[0].antwort} hat den Vorabcheck durchgeführt und folgende Dinge ausgefüllt: \n\n\n ${stringOfContactState} ||\n\n ${stringOfQuizState}`
    //
    // $.post('https://mailthis.to/info@advoadvice.de', {
    //   _subject: 'Schufa Vorab-Check Formular ausgefüllt',
    //   _after: 'http://advoadvice.de/danke/vorab-check',
    //   email: thisState.formContact[4].antwort,
    //   message: messageString
    // }, function(response){
    //   console.log(response)
    //   location.href = 'https://mailthis.to/confirm'
    // })

    // CloudCannon:
    // var stringOfContactState = thisState.formContact.map(obj => `${encodeURIComponent(obj.frage)}=${encodeURIComponent(obj.antwort)}` ).join('&')
    // var stringOfQuizState = Object.values(thisState.quiz).map(quiz => quiz.map(obj => `${encodeURIComponent(obj.frage)}=${encodeURIComponent(obj.antwort)}`).join('&') ).join('&')
    // var sendingParams = `${encodeURIComponent('_to')}=${encodeURIComponent('masugob@gmail.com')}`
    // var entireParams = sendingParams + '&' + stringOfContactState + '&' + stringOfQuizState
    // // For Debugging: http://ptsv2.com/t/zhs50-1524062871/post
    //
    //
    // // if (grecaptcha) {
    // //   var recaptchaResponse = grecaptcha.getResponse();
    // //   if (!recaptchaResponse) { // reCAPTCHA not clicked yet
    // //     return false;
    // //   }
    // // }
    // var formEl = document.getElementById("schufaToolKontakt");
    // var request = new XMLHttpRequest();
    // request.addEventListener("load", function () {
    //   if (request.status === 302) { // CloudCannon redirects on success
    //     // It worked
    //   }
    // });
    // request.open(formEl.method, formEl.action);
    // request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // request.send(entireParams);
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
          if(thisState.$app.find('.schufaTool__form--kontakt').length > 0) submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      },
      '3': {
        afterRender: () => {
          $('.schufaTool__progress--next').text('Abschicken')
        },
        beforeExit: () => {
          if(thisState.$app.find('.schufaTool__form--kontakt').length > 0) submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    },
    score: {
      '1': {
        beforeExit: () => {
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
        afterRender: () => {
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
        beforeExit: () => {
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
        afterRender: () => {
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
        beforeExit: () => {
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
        afterRender: () => {
          if(thisState.$app.find('.schufaTool__form--kontakt').length > 0){
            $('.schufaTool__progress--next').text('Abschicken')
          }
        },
        beforeExit: () => {
          if(thisState.$app.find('.schufaTool__form--kontakt').length > 0) submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    },
    fraud: {
      '1': {
        beforeExit: () => {
          if(thisState.quiz[thisState.category].map(obj => obj.antwort).indexOf('Ja') < 0){
            // If both questions answered with no: insert last placeholder slide
            // Remove final slides and replace it with the final slide
            let $finalSlide = $('.schufaTool__templates').find('.schufaTool__category--fraud--5').clone()
            thisState.$slides.splice(2, 4, $finalSlide)
          }
        }
      },
      '2': {
        afterRender: () => {
          if(finalSlide()) return

          $('.schufaTool__form--fraud__placeholder').html('') // reset form
          // Insert form for the corresponding answer of the previous slide
          if(thisState.quiz[thisState.category][0].antwort == "Ja"){
            thisState.$app.find('[name="fraud__91"]').val('Ja')
            let $identitaetsForm = $('.schufaTool__templates').find('.schufaTool__form--fraud--a').clone()
            $('.schufaTool__form--fraud__placeholder').append($identitaetsForm)
          }
          if(thisState.quiz[thisState.category][1].antwort == "Ja"){
            thisState.$app.find('[name="fraud__92"]').val('Ja')
            let $fraudForm = $('.schufaTool__templates').find('.schufaTool__form--fraud--b').clone()
            $('.schufaTool__form--fraud__placeholder').append($fraudForm)
          }
        },
        beforeExit: () => {
          if(questionAnswer('Identitätsdiebstahl: Wurde in Folge des Identitätsdiebstahls ein negativer Schufa Eintrag eingemeldet?', 'Nein')){
            let $finalSlide = $('.schufaTool__templates').find('.schufaTool__category--fraud--4').clone()
            thisState.$slides.splice(3, 3, $finalSlide)
          }
        }
      },
      '3': {
        afterRender: () => {
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
        afterRender: () => {
          $('.schufaTool__progress--next').text('Abschicken')
        },
        beforeExit: () => {
          submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    },
    veraltet: {
      '2': {
        afterRender: () => {
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
          submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    },
    restschuld: {},
    verzeichnisse: {
      '1': {
        beforeExit: () => {
          if(thisState.quiz[thisState.category][0].antwort == 'Nein'){
            // Remove final slides
            thisState.$slides.splice(2, 3)
            // Add placeholder slide at end
            thisState.$slides.push($('.schufaTool__templates .schufaTool__category--verzeichnisse--3').clone())
          }
        }
      },
      '3': {
        afterRender: () => {
          $('.schufaTool__progress--next').text('Abschicken')
        },
        beforeExit: () => {
          submit()
          $('.schufaTool__progress--next').text('Weiter')
        }
      }
    }
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
      '.schufaTool__category--restschuld--1'
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
