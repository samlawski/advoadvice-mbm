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
          <button @click="handleChoice(quizBlock.id, option)" :class="{ active: isSelectedOption(quizBlock.id, option)}">{{ option }}</button>
        </li>
      </ul>
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
      focusedBlock: null
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
      this.focusedBlock = null // for input fields only

      this._addAnswerToQuiz(
        buildQuizBlock(block_id, choiceText)
      )

      this._rebuildQuiz()
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
      }else{
        location.hash = ''
      }
    })
  },
  computed: {},
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
}
.active p {
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
</style>