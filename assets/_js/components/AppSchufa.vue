<template>
<section>
  <h1>Schufa Vorab-Test</h1>
  <div v-for="quizBlock in quiz" :key="quizBlock.id" :id="quizBlock.id" :class="{ block: true, active: isCurrentBlock(quizBlock.id) }">
    <p>{{getText(quizBlock.id)}}</p>
    
    <template v-if="getBlockType(quizBlock.id) == 'frage_mit_text'">
      <input type="text" 
        @focus="focusBlock(quizBlock.id)"
        @blur="handleChoice(quizBlock.id, $event.target.value)" 
        @keyup.enter="$event.target.blur()"
      ><!-- :required="isBlockRequired(quizBlock.id)" -->
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
          <button @click="handleChoice(quizBlock.id, option)" :class="{ active: isSelectedOption(quizBlock.id, option)}">{{ option }}</button>
        </li>
      </ul>
    </template>
  </div>

  <div id="auswertung" class="auswertung__wrapper">
    <h2>Auswertung</h2>
    <template v-if="showAuswertung">
      <div v-for="(auswertung, index) in auswertungen" :key="'auswertung__' + index" v-html="auswertung.text_html"></div>

      <form v-if="auswertungen.every(a => a.erlaube_kontakt)">
        <input type="text" name="name" placeholder="Ihr Name* ..." aria-label="Ihr Name" required>
        <input type="email" name="email" placeholder="Ihre Email* ..." aria-label="Ihre Email Adresse" required>
        <input type="tel" name="tel" placeholder="Ihre Telefonnummer ..." aria-label="Ihre Telefonnummer">

        <input type="text" name="strasse_hausnummer" placeholder="Straße und Hausnummer" aria-label="Straße und Hausnummer">
        <input type="text" name="plz" placeholder="Postleitzahl" aria-label="Postleitzahl">
        <input type="text" name="ort" placeholder="Ort" aria-label="Ort">

        <label for="rechtschutzversicherung">
          <input type="checkbox" id="rechtschutzversicherung" name="rechtschutzversicherung" aria-label="Rechtschutzversicherung" v-model="insurancePresent">
          <span>&nbsp;&nbsp;Haben Sie eine Rechtschutzversicherung?</span>
        </label>

        <template v-if="insurancePresent">
          <input type="text" name="versicherung_name" placeholder="Name der Rechtschutzversicherung" aria-label="Name der Rechtschutzversicherung">
          <input type="text" name="versicherten_name" placeholder="Name des Versicherten" aria-label="Name des Versicherten">
          <input type="text" name="versicherten_nummer" placeholder="Versicherungsnummer" aria-label="Versicherungsnummer">
          <input type="date" name="versichert_seit" placeholder="Versichert seit ..." aria-label="Versichert seit ...">
        </template>

        <textarea name="sachverhalt" placeholder="Schilderung des Sachverhalts" aria-label="Schilderung des Sachverhalts" rows="5"></textarea>

        <!-- Add all Quiz answers -->
        <input v-for="block in quiz" :key="'form__' + block.id" type="hidden" :name="block.id" :value="block.answer" />

        <label for="gdpr_check_schufa">
          <input type="checkbox" name="gdpr_check" id="gdpr_check_schufa" aria-label="Nutzung meiner Daten zustimmen" required>
          <small class="editable">&nbsp;&nbsp;Mit der Nutzung dieses Formulars erklären Sie sich mit der Speicherung und Verarbeitung Ihrer Daten durch diese Webseite und der Weiterleitung an den Servicedienstleister Netlify einverstanden.</small>
        </label>
        <label class="cookie_check_container--js" id="cookie_check_container_schufa" for="cookie_check_schufa">
          <input class="cookie_check--js" type="checkbox" name="cookie_check" id="cookie_check_schufa" aria-label="Nutzung von Cookies zustimmen" required>
          <small class="editable">&nbsp;&nbsp;Ich stimme der kurzfristigen Nutzung von Cookies zur Vermeidung von Spam-Nachrichten zu. (Alternativ können Sie uns direkt eine <a href="mailto:info@advoadvice.de">email</a> schicken)</small>
        </label>

        <button class="kontakt__send" type="submit" aria-label="Formular absenden" disabled>Anfrage senden</button>
      </form>
    </template>
    <template v-else-if="enableAuswertung">
      <button @click="handleShowAuswertung">Auswertung zeigen</button>
    </template>
    <template v-else>
      <button disabled>Auswertung zeigen</button>
      <p><small>Haben Sie alle Fragen beantwortet?</small></p>
      <p><small>Sehen Sie hier eine Auswertung, sobald Sie alle Fragen beantwortet haben.</small></p>
    </template>
  </div>
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
      showAuswertung: false,
      focusedBlock: null,
      insurancePresent: false
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
      console.log('click', block_id, choiceText)
      // Analytics:
      // _paq.push(['trackEvent', 'Vorab-Check: Schufa', 'Eingabe', block_id, choiceText])

      this.focusedBlock = null // for input fields only

      this._addAnswerToQuiz(
        buildQuizBlock(block_id, choiceText)
      )

      this._rebuildQuiz()
      this._rebuildAuswertung()
    },
    handleShowAuswertung(){ 
      // Analytics:
      // _paq.push(['trackEvent', 'Vorab-Check: Schufa', 'Auswertung zeigen'])
      this.showAuswertung = true 
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
        // Focus input fields if they exist
        let $input = document.querySelector(`#${this.currentBlock().id} input`)
        if($input) $input.focus()
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
    enableAuswertung(){
      // are there NOT some required blocks with no answer?
      return !this.quiz.some(block => {
        let blockRequired = getBlockById(block.id) && getBlockById(block.id).erforderlich
        return blockRequired && !this.getAnswer(block.id)
      })
    }
  },
  props: [],
  components: {}
}
</script>

<style lang="scss" scoped>
// Layout
section {
  min-height: calc(100vh - 80px);
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
    color: rgba(0,0,0,0.7);
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
      background-color: #081114;
      color: white;
    }
  }
}

.auswertung__wrapper {
  overflow: hidden;
  background-color: #cfe9f5;

  margin-bottom: 40px;
  padding: 20px 20px 40px;

  text-align: center;

  button[disabled] {
    border-color: rgba(0,0,0,0.4);
    color: rgba(0,0,0,0.4);
  }

  form {
    text-align: left;
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
</style>