<template>
<section>
  <h1>Schufa* Vorab-Test</h1>
  <div v-for="quizBlock in quiz" :key="quizBlock.id" :id="quizBlock.id" :class="{ block: true, active: isCurrentBlock(quizBlock.id) }">
    <p>{{getText(quizBlock.id)}}</p>
    
    <template v-if="getBlockType(quizBlock.id) == 'frage_mit_text'">
      <input type="text" 
        @focus="focusBlock(quizBlock.id)"
        @blur="handleChoice(quizBlock.id, $event.target.value)" 
        @keyup.enter="$event.target.blur()"
      >
      <small :class="{ active: shouldShowHint(quizBlock.id)}"><i>Enter</i> drücken für die nächste Frage.</small>
    </template>
    <template v-else-if="getBlockType(quizBlock.id) == 'frage_mit_datum'">
      <input type="date" 
        @focus="focusBlock(quizBlock.id)"
        @blur="handleChoice(quizBlock.id, $event.target.value)" 
        @keyup.enter="$event.target.blur()"
      >
      <small :class="{ active: shouldShowHint(quizBlock.id)}"><i>Enter</i> drücken für die nächste Frage.</small>
    </template>
    <template v-else-if="getBlockType(quizBlock.id) == 'frage_mit_auswahl'">
      <ul id="antworten">
        <li v-for="(option, index) in getOptions(quizBlock.id)" :key="index">
          <button @mousedown="handleChoice(quizBlock.id, option)" :class="{ active: isSelectedOption(quizBlock.id, option)}">{{ option }}</button>
        </li>
      </ul>
    </template>
  </div>

  <div v-if="!quizStarted">
    <p><small>Mit der Benutzung unseres Vorab-Checks ist noch kein Auftrag an die Kanzlei AdvoAdvice Rechtsanwälte mbB verbunden. Eine Mandatsverhältnis entsteht erst dann, wenn Sie die Mandatsunterlagen ausgefüllt und an AdvoAdvice zurückgesendet sowie eine Erklärung zur Mandatsübernahme von AdvoAdvice erhalten haben. Sollten eine Auftragserteilung Aussicht auf Erfolg haben, werden Ihnen am Ende des Vorab-Checks weitere Unterlagen zur Verfügung gestellt.</small></p>
    <p><small>*Schufa ist eine eingetragene Wortmarke (DE1030700) der Schufa Holding AG (Wiesbaden)</small></p>
  </div>

  <div id="auswertung" v-if="quizStarted">
    <div class="auswertung__wrapper">
      <h2>Auswertung</h2>

      <template v-if="showAuswertung || requiredBlocks.length <= 1">
        <div v-for="(auswertung, index) in auswertungen" :key="'auswertung__' + index" v-html="auswertung.text_html"></div>

        <form v-if="enableContactForm">
          <input v-model="contactFormObj['name']" type="text" name="name" placeholder="Ihr Name* ..." aria-label="Ihr Name" required>
          <input v-model="contactFormObj['email']" type="email" name="email" placeholder="Ihre Email* ..." aria-label="Ihre Email Adresse" required>
          <input v-model="contactFormObj['tel']" type="tel" name="tel" placeholder="Ihre Telefonnummer ..." aria-label="Ihre Telefonnummer">

          <input v-model="contactFormObj['strasse_hausnummer']" type="text" name="strasse_hausnummer" placeholder="Straße und Hausnummer" aria-label="Straße und Hausnummer">
          <input v-model="contactFormObj['plz']" type="text" name="plz" placeholder="Postleitzahl" aria-label="Postleitzahl">
          <input v-model="contactFormObj['ort']" type="text" name="ort" placeholder="Ort" aria-label="Ort">

          <label for="rechtschutzversicherung">
            <input type="checkbox" id="rechtschutzversicherung" name="rechtschutzversicherung" aria-label="Rechtschutzversicherung" v-model="insurancePresent">
            <span>&nbsp;&nbsp;Haben Sie eine Rechtsschutzversicherung?</span>
          </label>

          <template v-if="insurancePresent">
            <input v-model="contactFormObj['rechtsschutz']['versicherung']" type="text" name="versicherung" placeholder="Name der Rechtsschutzversicherung" aria-label="Name der Rechtsschutzversicherung">
            <input v-model="contactFormObj['rechtsschutz']['versicherten_name']" type="text" name="versicherten_name" placeholder="Name des Versicherten" aria-label="Name des Versicherten">
            <input v-model="contactFormObj['rechtsschutz']['versicherten_nummer']" type="text" name="versicherten_nummer" placeholder="Versicherungsnummer" aria-label="Versicherungsnummer">
            <input v-model="contactFormObj['rechtsschutz']['versichert_seit']" type="text" name="versichert_seit" placeholder="Versichert seit Datum ..." aria-label="Versichert seit ...">
          </template>

          <textarea v-model="contactFormObj['sachverhalt']" name="sachverhalt" placeholder="Schilderung des Sachverhalts" aria-label="Schilderung des Sachverhalts" rows="5"></textarea>

          <label for="gdpr_check_schufa">
            <input v-model="contactFormObj['gdpr_check']" type="checkbox" name="gdpr_check" id="gdpr_check_schufa" aria-label="Nutzung meiner Daten zustimmen" required>
            <small class="editable">&nbsp;&nbsp;Mit der Nutzung dieses Formulars erklären Sie sich mit der Speicherung und Verarbeitung Ihrer Daten durch diese Webseite und der Weiterleitung an den Servicedienstleister einverstanden.</small>
          </label>
          <label class="cookie_check_container--js" id="cookie_check_container_schufa" for="cookie_check_schufa">
            <input @change="handleCookiesAgreed" class="cookie_check--js" type="checkbox" name="cookie_check" id="cookie_check_schufa" aria-label="Nutzung von Cookies zustimmen" required :disabled="formEnabled">
            <small class="editable">&nbsp;&nbsp;Ich stimme der kurzfristigen Nutzung von Cookies zur Vermeidung von Spam-Nachrichten zu. (Alternativ können Sie uns direkt eine <a href="mailto:info@advoadvice.de">email</a> schicken)</small>
          </label>

          <button @click="handleFormSubmit" class="kontakt__send" type="submit" aria-label="Formular absenden" :disabled="!formEnabled">Anfrage senden</button>
          <div class="kontakt__error"></div>
        </form>
      </template>
      <template v-else-if="enableAuswertung">
        <button @click="handleShowAuswertung">Auswertung zeigen</button>
      </template>
      <template v-else>
        <button disabled>Auswertung zeigen</button>
        <p><small>Sehen Sie hier eine Auswertung, sobald Sie alle Fragen beantwortet haben.</small></p>
      </template>
    </div>
  </div><!-- /#auswertung -->
</section>
</template>

<script>
const repo = {
  fragen: repoFragen,
  auswertungen: repoAuswertungen
}
const firstBlockId = repo.fragen[0].block_id

const flattenArr = arr => [].concat.apply([], arr)
const flattenAndMerge = (arr1, arr2) => [].concat.apply(arr1, arr2)
const getBlockById = id => repo.fragen.find(block => block.block_id == id)
const getBlocksByIds = ids => repo.fragen.filter(block => ids.includes(block.block_id))
const getFolgeBlockIds = (id, answer) => {
  let block = getBlockById(id)
  if(!block || !block.folge_bloecke) return []

  // Note: `antwort_ist` and `block_ids` must be arrays
  let folgeBlocks = block.folge_bloecke.filter(folgeBlock => folgeBlock.antwort_ist.includes(answer))
  let idsOfFolgeBlocks = folgeBlocks.map(folgeBlock => folgeBlock.block_ids)
  return flattenArr(idsOfFolgeBlocks)
}

const buildQuizBlock = (block_id, answer = null) => {
  return {
    id: block_id,
    answer: answer
  }
}

const initQuiz = () => [buildQuizBlock(firstBlockId)]

export default {
  name: 'AppSchufa',
  data(){
    return {
      quiz: initQuiz(),
      auswertungen: [],
      focusedBlock: null,
      showAuswertung: false,
      insurancePresent: false,
      formEnabled: false,
      contactFormObj: {
        rechtsschutz: {}
      }
    }
  },
  methods: {
    getText: id => getBlockById(id) ? getBlockById(id).text : '',
    getOptions: id => getBlockById(id) ? (getBlockById(id).optionen || []) : [],
    getBlockType: id => getBlockById(id) ? getBlockById(id).block_typ : null,
    getAnswer(id){
      let quizBlock = this.quiz.find(block => block.id == id)
      return quizBlock ? quizBlock.answer : null
    },
    currentBlock(){
      return this.quiz.find(block => !block.answer)
    },
    isCurrentBlock(id){
      return this.currentBlock() && id == this.currentBlock().id
    },
    isSelectedOption(id, option){
      return this.getAnswer(id) == option
    },
    shouldShowHint(id){
      return ['frage_mit_datum', 'frage_mit_text'].includes(this.getBlockType(id)) && (this.focusedBlock == id)
    },
    handleChoice(block_id, choiceText){
      // Analytics:
      _paq.push(['trackEvent', 'Vorab-Check: Schufa', `Eingabe: ${block_id}`, choiceText])

      this.focusedBlock = null // for input fields only

      this._addAnswerToQuiz(
        buildQuizBlock(block_id, choiceText)
      )

      this._rebuildQuiz()
      this._rebuildAuswertung()
    },
    handleShowAuswertung(){ 
      // Analytics:
      _paq.push(['trackEvent', 'Vorab-Check: Schufa', 'Auswertung zeigen'])
      this.showAuswertung = true 
    },
    handleCookiesAgreed(e){
      // Analytics:
      _paq.push(['trackEvent', 'Vorab-Check: Schufa', 'Klick: Cookies erlauben', 'erlaubt'])

      this.formEnabled = true

      crmForm.cookiesAgreedEnableForm(
        e.target.closest('form')
      )
    },
    handleFormSubmit(e){
      e.preventDefault()

      let $contactForm = e.target.closest('form')

      if($contactForm.reportValidity()){
        // Analytics:
        _paq.push(['trackEvent', 'Vorab-Check: Schufa', 'Klick: Senden', 'vollständig'])

        let quizResultsAsArrString  = this.quiz.map(block => `${getBlockById(block.id).text}: ${block.answer}`),
            rechtschutzAsArrString  = Object.keys(this.contactFormObj.rechtsschutz).map(k => `${k}: ${this.contactFormObj.rechtsschutz[k]}`),
            sachverhaltArrString    = [`sachverhalt: ${this.contactFormObj.sachverhalt || '/'}`],
            anliegenAsString        = [].concat.apply([], [quizResultsAsArrString, rechtschutzAsArrString, sachverhaltArrString]).join('\n|\n')

        let nameAsArr = this.contactFormObj.name.split(' ')
        crmForm.submitFormObj(
          $contactForm,
          {
            firstName     : nameAsArr.length > 1 ? nameAsArr.slice(0, -1).join(' ') : nameAsArr[0],
            lastName      : nameAsArr.slice(-1)[0],
            email         : this.contactFormObj.email,
            tel           : this.contactFormObj.tel,
            streetAddress : this.contactFormObj.strasse_hausnummer,
            zip           : this.contactFormObj.plz,
            city          : this.contactFormObj.ort,
            anliegen      : anliegenAsString
          }
        )
      }else{
        // Analytics:
        _paq.push(['trackEvent', 'Vorab-Check: Schufa', 'Klick: Senden', 'unvollständig'])
      }
    },
    focusBlock(id){
      this.focusedBlock = id
    },
    _addAnswerToQuiz(newQuizBlock){
      let blockIndex = this.quiz.findIndex(block => block.id == newQuizBlock.id)
      if(blockIndex >= 0){
        this.quiz[blockIndex] = newQuizBlock
      }else{
        this.quiz.push(newQuizBlock)
      }
    },
    _rebuildQuiz(){
      const newQuiz = []

      // Recursive function to add each quiz block one by one making sure that nested followup questions are added right in the middle
      const rebuildBlock = id => {
        let answer = this.getAnswer(id)
        // Add block to new quiz array (including an answer if it has been given)
        newQuiz.push(buildQuizBlock(id, answer))
        // Stop here if no answer has been given
        if(!answer) return 
        // Get the followup questions for the given answers (if they exist) and call this function for each followup question
        let folgeBlockIds = getFolgeBlockIds(id, answer)
        folgeBlockIds.forEach(folgeBlockid => rebuildBlock(folgeBlockid))
      }
      rebuildBlock(firstBlockId)

      this.quiz = newQuiz
    },
    _rebuildAuswertung(){
      this.auswertungen = repo.auswertungen.filter(auswertung => {
        let bedAll = auswertung.bedingungen_alle_erfuellt
        let bedSome = auswertung.bedingungen_eins_erfuellt

        let allTrue = bedAll && bedAll.length > 0 ?
          bedAll.every(a => this.getAnswer(a.block_id) == a.antwort_ist) : true
        let someTrue = bedSome && bedSome.length > 0 ?
          bedSome.some(a => this.getAnswer(a.block_id) == a.antwort_ist) : true

        return allTrue && someTrue
      })
    }
  },
  updated(){
    this.$nextTick(function () {
      // Check if there is a next question
      if(this.currentBlock()){
        // Move to next question
        location.hash = this.currentBlock().id
      }else if(this.enableAuswertung){
        location.hash = 'auswertung'
      }else{
        location.hash = ''
      }
    })
  },
  computed: {
    quizStarted(){
      return this.quiz.some(block => block.answer)
    },
    requiredBlocks(){
      return this.quiz.filter(block => getBlockById(block.id) && getBlockById(block.id).erforderlich)
    },
    enableAuswertung(){
      let isAnyWithoutAnswer = this.requiredBlocks.some(block => !this.getAnswer(block.id))

      return this.requiredBlocks.length > 0 && !isAnyWithoutAnswer
    },
    enableContactForm(){
      return this.auswertungen.every(a => a.erlaube_kontakt)
    }
  },
  props: [],
  components: {}
}
</script>

<style lang="scss" scoped>
@import '../../_sass/_constants.scss';

// Layout

section {
  min-height: 60vh;
}

// Fragen
.block {
  margin-bottom: 80px;

  &.active p {
    font-weight: 700;
  }
  input,
  small {
    width: 100%;
  }
  small {
    color: $clr-transparent-bl-7;
    opacity: 0;
    transition: .3s all;
    &.active { opacity: 1; }
  }

  // Antworten
  ul {
    padding-left: 0;
  }
  li {
    list-style: none;
  }
  button {
    margin-top: 10px;
    width: 100%;

    &.active {
      background-color: $clr-text;
      color: $clr-bg;
    }
  }
  @media(min-width: $media-md){
    ul {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    li {
      flex: 0 0 30%;
      margin: 10px;
    }
    button {
      height: 100%;
    }
  }
}

// Auswertung
.auswertung__wrapper {
  overflow: hidden;
  background-color: $clr-highlight-2;

  margin-bottom: 40px;
  padding: 20px 20px 40px;

  text-align: center;

  button[disabled] {
    border-color: $clr-transparent-bl-3;
    color: $clr-transparent-bl-3;
  }

  form {
    text-align: left;
    margin-top: 40px;
  }

  input[type="text"],
  input[type="tel"],
  input[type="email"],
  input[type="date"],
  textarea,
  label {
    display: block;
    width: 100%;
    margin-bottom: 20px
  }
  textarea {
    margin-bottom: 40px;
    margin-top: 40px;
  }
}

// Contact Form
.kontakt__error {
  color: tomato;
  margin-top: 20px;
}
</style>