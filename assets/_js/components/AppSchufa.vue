<template>
<div>
  <div v-for="quizBlock in quiz" :key="quizBlock.id" :id="quizBlock.id">
    <!-- TODO: Highlight current question -->
    <p>{{getText(quizBlock.id)}}</p>

    <!-- TODO: Add v-if and conditionally an input type for each block_typ -->
    <ul id="antworten">
      <li v-for="(option, index) in getOptions(quizBlock.id)" :key="index">
        <!-- TODO: Hightlight already selected answer -->
        <button @click="handleChoice(quizBlock.id, option)">{{ option }}</button>
      </li>
    </ul>

  </div>
</div>
</template>

<script>
const repo          = repoSchufa,
      firstBlockId  = repo[0].block_id

const flattenArr = arr => [].concat.apply([], arr)
const flattenAndMerge = (arr1, arr2) => [].concat.apply(arr1, arr2)
const getBlockById = id => repo.find(block => block.block_id == id)
const getBlocksByIds = ids => repo.filter(block => ids.includes(block.block_id))
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
      quiz: initQuiz()
    }
  },
  methods: {
    getText: id => getBlockById(id) ? getBlockById(id).text : '',
    getOptions: id => getBlockById(id) ? (getBlockById(id).optionen || []) : [],
    getAnswer(id){
      let quizBlock = this.quiz.find(block => block.id == id)
      return quizBlock ? quizBlock.answer : null
    },
    currentBlock(){
      return this.quiz.find(block => !block.answer)
    },
    handleChoice(block_id, choiceText){
      console.log('click', block_id, choiceText)

      this._addAnswerToQuiz(
        buildQuizBlock(block_id, choiceText)
      )

      this._rebuildQuiz()
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
      // Move to next question
      location.hash = this.currentBlock() && this.currentBlock().id
    })
  },
  computed: {},
  props: [],
  components: {}
}
</script>

<style lang="scss" scoped>
ul {
  padding-left: 0;
}
li {
  list-style: none;
}
</style>