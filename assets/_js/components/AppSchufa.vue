<template>
<div>
  <div v-for="quizBlock in quiz">
    <p>{{getText(quizBlock.id)}}</p>

    <ul id="antworten">
      <li v-for="(option, index) in getOptions(quizBlock.id)" v-bind:key="index">
        <button v-on:click="handleChoice(quizBlock.id, option)">{{ option }}</button>
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

const buildQuizBLock = (block_id, answer = null) => {
  return {
    id: block_id,
    answer: answer
  }
}

const initQuiz = () => [buildQuizBLock(firstBlockId)]


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
      return this.quiz.findIndex(block => !block.answer)
    },
    handleChoice(block_id, choiceText){
      console.log('click', block_id, choiceText)

      this._addAnswerToQuiz(
        buildQuizBLock(block_id, choiceText)
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
      // Get all blocks that already have answers given
      let blocksWithAnswers = this.quiz.filter(block => block.answer)
      console.log('answered questions', blocksWithAnswers)

      // Based on the answers find all folge_block_ids
      let allBlockIds = flattenAndMerge(
        [firstBlockId],
        blocksWithAnswers.map(block => getFolgeBlockIds(block.id, block.answer))
      )
      console.log('allBlockIds', allBlockIds)

      // Create new quiz array only including the right block IDs and adding existing answers
      this.quiz = allBlockIds.map(id => buildQuizBLock(id, this.getAnswer(id)))
    }
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